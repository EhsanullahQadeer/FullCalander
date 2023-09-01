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
    let data = await $.ajax({
      url: baseCfmUrl + params,
      type: "GET",
      dataType: "json",
    });
    jsonData.events = data;
    let paresedData = data.map((item) => {
      if (item.start && item.end) {
        item.start = formatDateToYYYYMMDD(item.end);
        item.end = formatDateToYYYYMMDD(item.end);
      }
      return item;
    });
    // first clear all events
    calendar.removeAllEvents();
    window.calendar.addEventSource(paresedData);
  } catch (error) {
    console.error("Error:", error);
  }
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
        var jsonPart = text.substring(startIndex, endIndex).trim();
        if (jsonPart.length > 0) {
          // Parse the extracted JSON
          var newData = JSON.parse(jsonPart);
          jsonData.employees.push(...newData);
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching JSON:", error);
    });
  return jsonData;
}

function formatDateToYYYYMMDD(dateString) {
  const parts = dateString.split("/");
  let date = dateString;
  if (parts.length === 3) {
    var day = parts[0];
    var month = parts[1];
    var year = parts[2];
    date = `${year}-${month}-${day}`;
  }
  return date;
}

//   ................................................................................
//hnadle employee select change

function handleEmployeeChange() {
  let values=$('#employee').val();
  // Write any logic as required here
  localStorage.setItem("employeeId", values);
  window.fetchFilterData()
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
  let id = info.event._def.publicId;
  var foundEvent = jsonData.events.find(function (event) {
    return event.id == id;
  });
  var $eventTable = $("<table>").attr("id", "eventTable");
  $("#dialog").dialog("option", "title", foundEvent?.title);
  $(".ui-widget-header").css("background", `linear-gradient(to bottom, ${foundEvent?.color}, #f8f8ff)`);
  for (var key in foundEvent) {
    //
    if (
      foundEvent.hasOwnProperty(key) &&
      key != "title" &&
      key != "color" &&
      key != "id"
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
        var $linkButton = $("<button>").text("Link").css({
          "background":`linear-gradient(to bottom, ${foundEvent?.color}, #f8f8ff)`,
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
  // alert(
  //   "Coordinates: " + info.jsEvent.pageX + "," + info.jsEvent.pageY
  // );
  // Append the table to the document
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
    // get data from server
    window.fetchFilterData = async function fetchFilterData() {
      let searchFrom =localStorage.getItem("searchFrom")?.replace(/\//g, "-");
      let searchTo = localStorage.getItem("searchTo")?.replace(/\//g, "-");
      let employeeId = localStorage.getItem("employeeId");
      let selectedMonth = localStorage.getItem("selectedMonth");
      let selectedYear = localStorage.getItem("selectedYear");
      let date;
      
      if (selectedMonth && selectedYear) {
        date = selectedYear + "-" + selectedMonth + "-01";
      } else {
        let currentDate = new Date(); 
        let currentyear= currentDate.getFullYear(); 
        let currentMonth= currentDate.getMonth() + 1; 
        date = currentyear + "-" + (currentMonth < 10 ? "0" : "") + currentMonth + "-01";
      }

      let filterQuery;
      if (searchFrom && searchTo && employeeId) {
        filterQuery = `?start=${searchFrom}&end=${searchTo}&id=${employeeId}`;
      } else if (searchFrom && searchTo) {
        filterQuery = `?start=${searchFrom}&end=${searchTo}`;
      }
      else if(employeeId){
        filterQuery = `?id=${employeeId}`;
      }
      // for this implement filter in backend start >= date
      else if (date) {
        filterQuery = `?start=${date}`;
      } else {
        filterQuery = "";
      }
      await fetchEvents(filterQuery);
    };
    //
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
  $("#employee").val(jsonData.employees[0]?.id);
  window.fetchFilterData();
}
