document.addEventListener("DOMContentLoaded", async function () {
  // This is logic for to make event popup workable when search range is between 2 years
  $("body").on("click", function (event) {
    // Event handler logic here
    const clickedElement = event.target;
    let data = clickedElement?.dataset?.arg;
    if (data) {
      data = JSON.parse(data);
      handleEventPopup(data);
    }
  });
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
    views: {
      multiMonthYearGrid: {
        type: "multiMonthYear",
        buttonText: "Grid",
      },
      multiMonthYearStack: {
        type: "multiMonthYear",
        buttonText: "Stack",
        multiMonthMaxColumns: 1,
      },
      dayGridYear: {
        buttonText: "Continuous",
      },
    },
    ...(defaultDate && { initialDate: defaultDate }),
    navLinks: true,
    selectable: true,
    selectMirror: true,
    showNonCurrentDates: true,
    longPressDelay: 1,
    dayMaxEvents: true, // allow "more" link when too many events,
    events: jsonData.events,
    eventContent: function (arg) {
      let event = arg.event;
      let extendedProps = event.extendedProps;
      let addEvent;
      let { start, end } = event._instance.range;
      if (extendedProps?.eventType == "companyHolidays") {
        if (extendedProps?.sTime != "AMPM") {
          let html = "";
          const timeDifference = end - start;
          const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
          if (daysDifference == 1) {
            if (extendedProps?.sTime == "AM" && extendedProps?.eTime == "AM") {
              // its means half day holiday
              html =  $(`<div title=${event._def.title} class="leftPart"><div>AM</div></div>`);
            } else if (
              extendedProps?.sTime == "PM" &&
              extendedProps?.eTime == "PM"
            ) {
              html = $(`<div title=${event._def.title}  class="rightPart"><div>PM</div></div>`);
            }
          }
          addEvent=html
        } else {
          addEvent = $(
            `<div title=${event._def.title} class='addFullDayHoliday'></div>`
          );
        }
      }else if(extendedProps?.eventType == "userHolidays"){
        debugger

      } else {
        var eventBackgroundColor = arg.backgroundColor;
        var eventTitle = $("<div data-arg='" + JSON.stringify(arg) + "'>").text(
          arg.event.title
        );
        if (arg.event.extendedProps.icon) {
          // Create an image element
          var eventImage = $("<img class='work-icon'>").attr(
            "src",
            arg.event.extendedProps.icon
          );

          // Append the image to the eventTitle
          eventTitle.prepend(eventImage);
        }
        // Add a click event listener to the element
        eventTitle.on("click", function () {
          var serializedArg = $(this).data("arg");
          handleEventPopup(serializedArg);
        });

        eventTitle.css({
          background: `linear-gradient(to bottom, ${eventBackgroundColor}, #f8f8ff)`,
          // color: "white",
          "border-color": eventBackgroundColor,
        });

        return { domNodes: eventTitle };
      }
      return { domNodes: addEvent };
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
        } else {
          let extendProps = todaysEvents[0]._def.extendedProps;
          if (
            extendProps?.eventType == "companyHolidays" &&
            extendProps?.sTime != "AMPM"
          ) {
            classNames.push("disableEventLink");
          } else if (extendProps?.sTime == "AMPM") {
            // jsut disable click on a tag bcz its holdiay
            classNames.push(
              `no-events ${todaysEvents[0]._def.ui.backgroundColor} enable-link fw-700 disableEventLink`
            );
          }
          // classNames.push("addDiagonal");
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
  combinedDiv.append(typeOfWorkSelect());
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
  $(".select2").select2();
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
    '<select onchange="handleEmployeeChange(this)" class="select2" title="Select Employee" id="employee" >';
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
  <select onchange="handleProcessedChange(this)" class="select2" id="processed"  title="Select Processed">
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
}
function typeOfWorkSelect() {
  let typeOfWork = localStorage.getItem("typeOfWork");
  return `
  <div class="typeOfWork-select">
  <label class="mb-0" for="typeOfWork">Work</label>
  <select onchange="handleTypeOfWorkChange(this)" class="select2" id="typeOfWork" title="Select type of work">
  <option value=-1>All</option>
  <option ${typeOfWork?.includes(0) ? "selected" : ""}  value="0">Home</option>
    <option ${
      typeOfWork?.includes(1) ? "selected" : ""
    } value="1">Office</option>
    <option ${
      typeOfWork?.includes(2) ? "selected" : ""
    } value="2">Nowork</option>
  </select>
  </div>
  `;
}

function getDateWithoutTime(dt) {
  dt.setHours(0, 0, 0, 0);
  return dt;
}
