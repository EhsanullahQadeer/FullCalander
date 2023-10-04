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
  //
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
      right: "prev,next today dayGridMonth,dayGridWeek,dayGridDay,listWeek",
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
      if (
        extendedProps?.eventType == "companyHolidays" ||
        extendedProps?.eventType == "userHolidays"
      ) {
        var eventGroup = {};
        // Iterate through the events to group them by date and title
        arg.view.calendar.getEvents().forEach(function (event) {
          if (event.start.toISOString() === arg.event.start.toISOString()) {
            if (!eventGroup[event.start.toISOString()]) {
              eventGroup[event.start.toISOString()] = [];
            }
            eventGroup[event.start.toISOString()].push({
              title: event.title,
              ...event.extendedProps,
              start: event.start,
              end: event.end,
            });
          }
        });
        let tooltipContent = { AM: {}, PM: {}, AMPM: {} };
        if (eventGroup[arg.event.start.toISOString()]?.length > 0) {
          eventGroup[arg.event.start.toISOString()].forEach((item) => {
            if (item?.sTime == "AM" && item?.eTime == "AM") {
              if (tooltipContent.AM[item.eventType] === undefined) {
                tooltipContent.AM[item.eventType] = [];
              }
              tooltipContent.AM[item.eventType].push(item);
            } else if (item?.sTime == "PM" && item?.eTime == "PM") {
              if (tooltipContent.PM[item.eventType] === undefined) {
                tooltipContent.PM[item.eventType] = [];
              }
              tooltipContent.PM[item.eventType].push(item);
            } else if (item?.sTime == "AMPM" && item?.eTime == "AMPM") {
              if (tooltipContent.AMPM[item.eventType] === undefined) {
                tooltipContent.AMPM[item.eventType] = [];
              }
              tooltipContent.AMPM[item.eventType].push(item);
            }
          });
          for (let data in tooltipContent) {
            const tableId = `${
              data +
              "_" +
              arg.event.start.toISOString().replace(/[^a-zA-Z0-9]+/g, "_")
            }`;
            var tableWrapper = $("<div class='d-none'>").attr("id", tableId);
            let table = $("<table class='tooltipData-table'>");
            for (let key in tooltipContent[data]) {
              tooltipContent[data][key].forEach(function (item) {
                var dataRow = $("<tr>");
                dataRow.append($("<td>").text(key));
                if (item.title) {
                  dataRow.append($("<td>").text(item.title));
                }
                table.append(dataRow);
              });
            }
            tableWrapper.append(table);
            $("body").append(tableWrapper);
          }
        }

        let { sTime, eTime } = extendedProps;
        if (sTime != "AMPM" && eTime != "AMPM") {
          let html = "";
          if (sTime == "AM" && eTime == "AM") {
            // its means half day holiday
            html = $(
              `<div data-tooltip-content=${
                "AM_" +
                arg.event.start.toISOString().replace(/[^a-zA-Z0-9]+/g, "_")
              } class="leftPart custom-tooltip"><div></div></div>`
            );
          } else if (sTime == "PM" && eTime == "PM") {
            html = $(
              `<div data-tooltip-content=${
                "PM_" +
                arg.event.start.toISOString().replace(/[^a-zA-Z0-9]+/g, "_")
              }  class="rightPart custom-tooltip" ><div></div></div>`
            );
          }
          addEvent = html;
        } else {
          addEvent = $(
            `<div data-tooltip-content=${
              "AMPM_" +
              arg.event.start.toISOString().replace(/[^a-zA-Z0-9]+/g, "_")
            }  class='addFullDayHoliday custom-tooltip'>
            </div>`
          );
        }
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

        addEvent = eventTitle;
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
      //This gives the next day of the clicked day('date' contains the clicked day)
      var todaysEvents = calendar.getEvents();
      if (todaysEvents) {
        todaysEvents = todaysEvents.filter((event) => {
          return event.start.toISOString() === date.toISOString();
        });

        if (!(todaysEvents && todaysEvents.length > 0)) {
          classNames.push("no-events");
        } else {
          if (
            todaysEvents.some(
              (event) =>
                event.extendedProps?.eventType == "userHolidays" ||
                event.extendedProps?.eventType == "companyHolidays"
            )
          ) {
            let isHalfDayHoliday = todaysEvents.some((event) => {
              return (
                event.extendedProps?.sTime == "AM" ||
                event.extendedProps?.sTime == "PM"
              );
            });
            classNames.push(
              `no-events red  enable-link fw-700 disableEventLink`
            );
          }
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
