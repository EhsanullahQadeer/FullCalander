let baseCfmUrl = "https://randhawaworld.com/calendar/FullCalander/timcard.cfm";

let jsonData = {
  events: [],
  employees: [],
};
//
let holdPreviousYearView;

async function fetchEvents(filter) {
  let params = filter ? filter : "";
  try {
    // Make the fetch request
    // let data = await $.ajax({
    //   url: baseCfmUrl + params,
    //   type: "GET",
    //   dataType: "json",
    // });
    if (data) {
      data[0].user_details.forEach((element, index) => {
        // to prevent display holidays multiple user , and just display alert we can not display holidays for multiple users
        if (index === 0) {
          let userHolidays = element?.user_holidays.map((item) => {
            if (item.start && item.end) {
              // Getting AM/PM
              item.sTime = getTimeFromDate(item.start);
              item.eTime = getTimeFromDate(item.end);
              //
              item.start = formatDateToYYYYMMDD(item.start);
              item.end = formatDateToYYYYMMDD(item.end);
              item.eventType = "userHolidays";
            }
            return item;
          });
          delete element?.user_holidays;
          jsonData.events.push(element, ...userHolidays);
        } else {
          delete element?.user_holidays;
          jsonData.events.push(element);
          return;
        }
      });
    }
    // comapny holidays
    if (data[0].company_holidays) {
      let companyHolidays = data[0].company_holidays.map((item) => {
        if (item.start && item.end) {
          // Getting AM/PM
          item.sTime = getTimeFromDate(item.start);
          item.eTime = getTimeFromDate(item.end);
          //
          item.start = formatDateToYYYYMMDD(item.start);
          item.end = formatDateToYYYYMMDD(item.end);
          item.eventType = "companyHolidays";
        }
        return item;
      });
      jsonData.events.push(...companyHolidays);
    }

    // let paresedData = data.map((item) => {
    //   if (item.start && item.end) {
    //     item.start = formatDateToYYYYMMDD(item.end);
    //     item.end = formatDateToYYYYMMDD(item.end);
    //   }
    //   return item;
    // });

    // first clear all events
    calendar.removeAllEvents();
    window.calendar.addEventSource(jsonData.events);
  } catch (error) {}
}
// Call the function to fetch events

async function fetchEmployeesData() {
  await fetch("employees.cfm")
    .then((response) => response.text())
    .then((text) => {
      if (text.length > 0) {
        // Extract JSON part from the response using string manipulation
        var startIndex = text.indexOf("[{");
        var endIndex = text.lastIndexOf("}]") + 2;
        if (startIndex == -1 || endIndex == -1) {
          return;
        }
        var jsonPart = text.substring(startIndex, endIndex).trim();
        if (jsonPart.length > 4) {
          // Parse the extracted JSON
          var newData = JSON.parse(jsonPart);
          jsonData.employees.push(...newData);
        }
      }
    })
    .catch((error) => {});
  return jsonData;
}

//   ................................................................................
//hnadle employee select change
let recordPreStateOfEmploye;
function handleEmployeeChange(select) {
  let values = $("#employee").val();
  !recordPreStateOfEmploye &&
    (recordPreStateOfEmploye = localStorage.getItem("employee"));
  // calling function
  values = togleSelectALl(values, recordPreStateOfEmploye, select);
  recordPreStateOfEmploye = values;
  // Update the selected values
  $(select).val(values);
  $(select).select2();
  localStorage.setItem("employeeId", values);
  window.fetchFilterData();
}

let recordPrevoiusValues;
function handleProcessedChange(select) {
  let values = $("#processed").val();
  !recordPrevoiusValues &&
    (recordPrevoiusValues = localStorage.getItem("processed"));
  // calling function
  values = togleSelectALl(values, recordPrevoiusValues, select);
  recordPrevoiusValues = values;
  // Update the selected values
  $(select).val(values);
  $(select).select2();
  localStorage.setItem("processed", values);
  window.fetchFilterData();
}

let workPreValues;
function handleTypeOfWorkChange(select) {
  let values = $("#typeOfWork").val();
  !workPreValues && (workPreValues = localStorage.getItem("typeOfWork"));
  // calling function
  values = togleSelectALl(values, workPreValues, select);
  workPreValues = values;
  // Update the selected values
  $(select).val(values);
  $(select).select2();
  localStorage.setItem("typeOfWork", values);
  window.fetchFilterData();
}

// Event popup
$(function () {
  $("#dialog").dialog({
    autoOpen: false,
  });
});

// year range
function yearRange() {
  var currentYear = new Date().getFullYear();
  var yearArray = [];
  for (var i = currentYear; i <= currentYear + 10; i++) {
    yearArray.push({ t: i, v: i });
  }
  return yearArray;
}
// handle month change
function handleMonthChange(select) {
  let selectedYear = parseInt($(".select_year").val());
  let selectedMonth = select.value || select;
  setDateToLocalStorage(selectedMonth, selectedYear);
  // Remove the valid range for the calendar
  window.calendar.setOption("validRange", null);
  window.calendar.changeView("dayGridMonth", selectedMonth);
  window.calendar.gotoDate(selectedYear + "-" + selectedMonth + "-01");
  window.fetchFilterData();
}

// handle year change
function handleYearChange(select) {
  let selectedYear = parseInt(select.value);
  let selectedMonth = $(".select_month").val();
  setDateToLocalStorage(selectedMonth, selectedYear);
  // Remove the valid range for the calendar
  window.calendar.setOption("validRange", null);
  window.calendar.changeView("dayGridMonth", selectedMonth);
  window.calendar.gotoDate(selectedYear + "-" + selectedMonth + "-01");
  window.fetchFilterData();
}
function setDateToLocalStorage(selectedMonth, selectedYear) {
  window.localStorage.setItem("selectedMonth", selectedMonth);
  window.localStorage.setItem("selectedYear", selectedYear);
}
// Event Popup
function handleEventPopup(info) {
  let id = info.event.id;
  var foundEvent = jsonData.events.find(function (event) {
    return event.id == id;
  });
  var $eventTable = $("<table>").attr("id", "eventTable");

  $("#dialog").dialog("option", "title", foundEvent?.title);

  $(".ui-dialog-title").find(".custom-title").remove();
  if (foundEvent?.icon) {
    var image = $("<img class='work-icon'>").attr("src", foundEvent?.icon);
    $(".ui-dialog-title").prepend(image);
  }

  $(".ui-widget-header").css(
    "background",
    `linear-gradient(to bottom, ${foundEvent?.color}, #f8f8ff)`
  );
  var excludedProperties = ["title", "color", "id", "link", "icon"];
  for (var key in foundEvent) {
    //
    if (
      foundEvent.hasOwnProperty(key) &&
      excludedProperties.indexOf(key) === -1 &&
      typeof foundEvent[key] !== "object" &&
      !Array.isArray(foundEvent[key])
    ) {
      if (key != "link") {
        let text = key;
        text = text.replace(/_/g, " ").replace(/\w\S*/g, function (txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        var $dataRow = $("<tr>").attr("data-event-name", key);
        var $dataCell1 = $("<td>").addClass(key).text(text);
        var $dataCell2 = $("<td>").addClass(key).text(foundEvent[key]);
        $dataRow.append($dataCell1);
        $dataRow.append($dataCell2);
        $eventTable.append($dataRow);
      } else {
        // Adding a link button at the end
        var $linkRow = $("<tr>");
        var $linkCell = $("<td colspan='2'>");
        var $linkButton = $("<button>")
          .text("Link")
          .css({
            background: `linear-gradient(to bottom, ${foundEvent?.color}, #f8f8ff)`,
            color: "white",
            border: foundEvent?.color,
          });
        var $linkAnchor = $("<a>")
          .attr("href", foundEvent.link) // Set the link URL
          .attr("target", "_blank") // Open link in new tab/window
          .append($linkButton);
        $linkCell.append($linkAnchor);
        $linkRow.append($linkCell);
      }
    }
  }
  if (foundEvent.hasOwnProperty("link")) {
    $eventTable.append($linkRow);
  }
  $("#dialog").html($eventTable);
  $("#dialog").dialog("open");
}

//

$(function () {
  window.renerTopSearch = async function renerTopSearch() {
    var dateFormat = "mm/dd/yy";
    from = $("#from").datepicker({
      showWeek: true,
      firstDay: 1,
      changeMonth: true,
      changeYear: true,
      numberOfMonths: 1,
      yearRange:
        new Date().getFullYear() + ":" + (new Date().getFullYear() + 10), // Display current year to next 10 years
      onSelect: function (selectedDate) {
        var endDate = new Date(selectedDate);
        endDate.setDate(endDate.getDate() + 365);
        to.datepicker("option", "minDate", selectedDate); // Set minDate of 'to' datepicker
        to.datepicker("option", "maxDate", endDate); // Set maxDate of 'to' datepicker
        localStorage.setItem("searchFrom", selectedDate);
      },
    });

    to = $("#to").datepicker({
      defaultDate: "+1w",
      showWeek: true,
      firstDay: 1,
      changeMonth: true,
      changeYear: true,
      numberOfMonths: 1,
      yearRange:
        new Date().getFullYear() + ":" + (new Date().getFullYear() + 10), // Display current year to next 10 years
      onSelect: function (selectedDate) {
        from.datepicker("option", "maxDate", selectedDate); // Set maxDate of 'from' datepicker
        localStorage.setItem("searchTo", selectedDate);
      },
    });
    // This logic for settting deafult search date from local storage
    let searchFrom = localStorage.getItem("searchFrom");
    let searchTo = localStorage.getItem("searchTo");
    if (searchFrom) {
      $("#from").datepicker("setDate", searchFrom);
      var endDate = new Date(searchFrom);
      endDate.setDate(endDate.getDate() + 365);
      $("#to").datepicker("option", "minDate", searchFrom); // Set minDate of 'to' datepicker
      $("#to").datepicker("option", "maxDate", endDate);
    }
    if (searchTo) {
      $("#to").datepicker("setDate", searchTo);
      $("#from").datepicker("option", "maxDate", searchTo);
    }

    window.applyDateFilter = function applyDateFilter() {
      var fromDate = from.datepicker("getDate");
      var toDate = to.datepicker("getDate");
      if (!fromDate || !toDate) {
        return;
      }
      // var multiMonthYearView = $(".fc-multiMonthYear-view");

      // Remove the cloned view after appending
      $(".fc-year-container").remove();
      //
      fromDate = new Date(fromDate);
      toDate = new Date(toDate);
      fromDate.setDate(1);
      toDate.setDate(1);
      window.calendar.changeView("multiMonthYear");

      // change tolbar grid stack only if search lies in the same year
      if (fromDate.getFullYear() == toDate.getFullYear()) {
        calendar.setOption("headerToolbar", {
          right: "multiMonthYearGrid,multiMonthYearStack",
        });
        // bind click listner on stack
        $(".fc-multiMonthYearStack-button").on("click", function () {
          window.calendar.setOption("multiMonthMaxColumns", 1);
        });
        // bind click listner on grid
        $(".fc-multiMonthYearGrid-button").on("click", function () {
          const monthDifference =
            (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
            (toDate.getMonth() - fromDate.getMonth());
          if (monthDifference === 0) {
            window.calendar.setOption("multiMonthMaxColumns", 1);
          } else {
            window.calendar.setOption("multiMonthMaxColumns", 2);
          }
        });
      } else {
        calendar.setOption("headerToolbar", {
          right: "prev,next today dayGridMonth,dayGridWeek",
        });
      }
      // This check is for intially
      const monthDifference =
        (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
        (toDate.getMonth() - fromDate.getMonth());
      if (monthDifference === 0) {
        window.calendar.setOption("multiMonthMaxColumns", 1);
      } else {
        window.calendar.setOption("multiMonthMaxColumns", 2);
      }

      window.calendar.gotoDate(fromDate.getFullYear() + "-" + "01" + "-01");
      var multiMonthYearView = $(".fc-multiMonthYear-view");

      // Select child elements within the parent container
      var childElements = multiMonthYearView.children();

      childElements.each(function (index, element) {
        var dataDateValue = $(element).data("date").split("-");
        let dataMonth = new Date(dataDateValue);
        // Compare with the date range
        if (dataMonth >= fromDate && dataMonth <= toDate) {
          $(element).css("display", ""); // Reset the display property
        } else {
          $(element).css("display", "none");
        }
      });

      holdPreviousYearView = multiMonthYearView.clone();

      // its means range lies between 2 years so, we also have render months for next year
      if (fromDate.getFullYear() != toDate.getFullYear()) {
        window.calendar.gotoDate(toDate.getFullYear() + "-" + "01" + "-01");
        var multiMonthYearView = $(".fc-multiMonthYear-view");
        // Select child elements within the parent container
        var childElements = multiMonthYearView.children();
        childElements.each(function (index, element) {
          var dataDateValue = $(element).data("date").split("-");
          let dataMonth = new Date(dataDateValue);
          // Compare with the date range
          if (dataMonth >= fromDate && dataMonth <= toDate) {
            $(element).css("display", ""); // Reset the display property
          } else {
            $(element).css("display", "none");
          }
        });
        var yearContainer = $("<div>").addClass("fc-year-container");
        //
        // yearContainer.append(multiMonthYearView);
        yearContainer.append(holdPreviousYearView);
        // Prepend the cloned view to the container
        multiMonthYearView.prepend(yearContainer);
      }
    };
    window.fetchFilterData = async function fetchFilterData() {
      // Retrieve data from localStorage
      const searchFrom = localStorage
        .getItem("searchFrom")
        ?.replace(/\//g, "-");
      const searchTo = localStorage.getItem("searchTo")?.replace(/\//g, "-");
      const employeeId = localStorage.getItem("employeeId");
      const processed = localStorage.getItem("processed");
      const typeOfWork = localStorage.getItem("typeOfWork");
      const selectedMonth = localStorage.getItem("selectedMonth");
      const selectedYear = localStorage.getItem("selectedYear");

      // Calculate the default date
      let date;
      if (selectedMonth && selectedYear) {
        date = `${selectedYear}-${selectedMonth}-01`;
      } else {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        date = `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`;
      }

      // Build the filter query based on available parameters
      let filterQuery = "";
      const queryParams = [];

      if (searchFrom && searchTo) {
        queryParams.push(`start=${searchFrom}&end=${searchTo}`);
      } else {
        if (date) {
          queryParams.push(`start=${date}`);
        }
      }

      if (employeeId) {
        queryParams.push(`id=${employeeId}`);
      }

      if (processed) {
        queryParams.push(`processed=${processed}`);
      }
      if (typeOfWork) {
        queryParams.push(`typeOfWork=${typeOfWork}`);
      }

      if (queryParams.length > 0) {
        filterQuery = `?${queryParams.join("&")}`;
      }

      // Fetch events using the constructed filter query
      await fetchEvents(filterQuery);
    };

    $(document).ready(async function () {
      await window.fetchFilterData();
      if (searchFrom && searchTo) {
        window.applyDateFilter();
      }
    });
  };
});

function handleSearch() {
  window.fetchFilterData();
  window.applyDateFilter();
}
function handleClear() {
  // render month view
  let selectedMonth = $(".select_month").val();
  // Replace tolbar rigth to intially
  calendar.setOption("headerToolbar", {
    right: "prev,next today dayGridMonth,dayGridWeek",
  });
  handleMonthChange(selectedMonth);
  $("#from").val("");
  $("#to").val("");
  // Reset minDate and maxDate options
  $("#from").datepicker("option", "minDate", null);
  $("#from").datepicker("option", "maxDate", null);
  $("#to").datepicker("option", "minDate", null);
  $("#to").datepicker("option", "maxDate", null);
  localStorage.removeItem("searchFrom");
  localStorage.removeItem("searchTo");
  localStorage.removeItem("employeeId");
  localStorage.removeItem("processed");
  localStorage.removeItem("processed");
  $("#employee").val([]);
  $("#processed").val([]);
  $("#typeOfWork").val([]);
  // reintialized
  $(".select2").select2();

  window.fetchFilterData();
}
