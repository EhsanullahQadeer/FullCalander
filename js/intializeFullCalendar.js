document.addEventListener("DOMContentLoaded", async function () {
  // get selected date from local storage
  let defMonth = window.localStorage.getItem("selectedMonth");
  let defYear = window.localStorage.getItem("selectedYear");
  let defaultDate;
  // to use this anywhere instead getting multiple time from local storage
  if (defMonth && defMonth) {
    window.defMonth = defMonth;
    window.defYear = defYear;
    defaultDate = `${defYear}-${defMonth}-01`;
  }
  var calendarEl = document.getElementById("iCalendar");
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: {
      right: "prev,next today dayGridMonth,dayGridWeek",
    },
    ...(defaultDate && { initialDate: defaultDate }),
    navLinks: true,
    selectable: true,
    selectMirror: true,
    showNonCurrentDates: true,
    longPressDelay: 1,
    dayMaxEvents: true, // allow "more" link when too many events,
    events: jsonData.events,
    eventClick: function (info) {
      handleEventPopup(info);
    },
    eventContent: function (arg) {
      var eventBackgroundColor = arg.backgroundColor;

      var eventTitle = $("<div>").text(arg.event.title);
      eventTitle.css({
        background: `linear-gradient(to bottom, ${eventBackgroundColor}, #f8f8ff)`,
        // color: "white",
        "border-color": eventBackgroundColor,
      });

      return { domNodes: eventTitle };
    },

    dayCellClassNames: function (arg) {
      let { date } = arg;
      var classNames = [];

      var dayOfWeek = new Date(date);
      var dayName = dayOfWeek.toLocaleDateString("en-US", { weekday: "long" });
      var isWeekday = dayName == "Sunday" || dayName == "Saturday";
      if (isWeekday) {
        classNames.push("week-days");
      }

      var date2 = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );
      //This gives the next day of the clicked day('date' contains the clicked day)

      var todaysEvents = calendar.getEvents();
      if (todaysEvents) {
        todaysEvents = todaysEvents.filter(
          (event) => event.start >= date && event.start < date2
        );
        if (!(todaysEvents && todaysEvents.length > 0)) {
          classNames.push("no-events");
        }
      } else {
        classNames = ["no-events"];
      }
      return classNames;
    },

    droppable: false,
    editable: true,
    locale: $("#iCalendar").attr("data-language"),
    selectAllow: function (info) {
      return info.start >= getDateWithoutTime(new Date());
    },
  });
  window.calendar = calendar;
  calendar.render();
  $(".fc-header-toolbar").children().eq(0).prepend(gotoDrop());
  $(".fc-header-toolbar").children().eq(1).html(addSerachByWeek());
  var combinedDiv = $("<div class='selector-wrapper'>");
  combinedDiv.append(await addEmployeeSelect());
  combinedDiv.append(ProcessedSelect());
  $(".fc-header-toolbar").children().eq(1).append(combinedDiv);
  $(".fc-today-button").click(function () {
    let chDt = calendar.getDate();
    let y = chDt.getFullYear();
    let m = ("0" + (chDt.getMonth() + 1)).slice(-2);
    $("#month").val(m);
    $("#year").val(y);
  });
  //   this is beacuse above await takse some time so we hence to render this function after new fullcalendaer render
  await window?.renerTopSearch();
});
//
function gotoDrop() {
  let sHtml = "";
  sHtml += '<div id="goto">';
  let d = new Date();
  let m;
  if (window?.defMonth) {
    m = parseInt(window?.defMonth) - 1;
  } else {
    m = d.getMonth();
  }
  let y = window?.defYear || d.getFullYear();
  var aMonth = JSON.parse($("#iCalendar").attr("data-months"));
  sHtml +=
    '<label class="mb-0"  for="styledSelect1"><select onchange="handleMonthChange(this)" class="select_month form-control text ui-widget-content ui-corner-all" name="month" id="month">';
  $.each(aMonth, function (k, v) {
    sHtml +=
      "<option " +
      (k == m ? "selected" : "") +
      ' value="' +
      ("0" + (k + 1)).slice(-2) +
      '">' +
      v +
      "</option>";
  });
  sHtml += "</select></label>";
  sHtml +=
    '<label class="mb-0"  for="styledSelect1" style="margin-left:10px;min-width:120px;"><select onChange="handleYearChange(this)" class="form-control select_year text ui-widget-content ui-corner-all" name="year" id="year">';
  $.each(yearRange(), function (k, v) {
    sHtml +=
      "<option " +
      (v.t == y ? "selected" : "") +
      ' value="' +
      v.v +
      '">' +
      v.t +
      "</option>";
  });
  sHtml += "</select></label>";

  sHtml += "</div>";
  return sHtml;
}

function addSerachByWeek() {
  return `<div class="search-flex"><label for="from">From</label>
<input autocomplete="off" class='form-control searchInput' type="text" id="from" name="from" />
<label for="to">to</label>
<input autocomplete="off" class='form-control searchInput' type="text" id="to" name="to" />
<button class="search-btns fc-button fc-button-primary" onclick="handleSearch()">Search</button>
<button class="search-btns fc-button fc-button-primary" onclick="handleClear()">Clear</button>
</div>
`;
}

async function addEmployeeSelect() {
  let employees = (await fetchEmployeesData())?.employees;
  let employeeId = localStorage.getItem("employeeId");

  let sHtml = '<div class="employee-select">';
  sHtml += '<label class="mb-0" for="styledSelect1">Employee</label>';
  sHtml +=
    '<select onchange="handleEmployeeChange(this)" title="Select Employee" id="employee" multiple = "multiple" data-live-search="true">';
  sHtml += `<option value=-1 >All</option>`;
  employees?.forEach(function (employee, index) {
    sHtml +=
      `<option value=${employee?.id}  ${
        employeeId?.includes(employee?.id) ? "selected" : ""
      }>` +
      employee?.name +
      "</option>";
  });

  sHtml += "</select>";
  sHtml += "</div>";

  return sHtml;
}

function ProcessedSelect() {
  let processed = localStorage.getItem("processed");
  return `
  <div class="processed-select">
  <label class="mb-0" for="processed">Processed</label>
  <select onchange="handleProcessedChange(this)" id="processed"  multiple = "multiple" title="Select Processed" data-live-search="true">
  <option value=-1>All</option>
  <option ${
    processed?.includes(0) ? "selected" : ""
  }  value="0">Processed</option>
    <option ${
      processed?.includes(1) ? "selected" : ""
    } value="1">Submitted</option>
    <option ${
      processed?.includes(2) ? "selected" : ""
    } value="2">Complete</option>
  </select>
  </div>
  `;
  // `;
}

function getDateWithoutTime(dt) {
  dt.setHours(0, 0, 0, 0);
  return dt;
}
