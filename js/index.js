let jsonData = {
  events: [
    {
      status: "Processed",
      title: "Work from Home",
      start: "2023-08-14",
      end: "2023-08-14",
      id: 2083851,
      full_name: "Michael",
      color: "blue",
      link: "https://www.youtube.com",
    },
    {
      status: "Scheduled",
      title: "Work From Office",
      start: "2023-08-15",
      end: "2023-08-15",
      id: 2083852,
      full_name: "James",
      color: "purple",
    },
    {
      status: "In Progress",
      title: "Holiday or Leave",
      start: "2023-08-20",
      end: "2023-08-23",
      id: 2083853,
      full_name: "Richard",
      color: "red",
    },
    // {
    //   status: "Processed",
    //   title: "Working from Home",
    //   start: "2023-08-16",
    //   end: "2023-08-16",
    //   id: 2083854,
    //   full_name: "User 1 ",
    //   color: "blue",
    // },
    // {
    //   status: "Processed",
    //   title: "Working from Home",
    //   start: "2023-08-16",
    //   end: "2023-08-16",
    //   id: 2083855,
    //   full_name: "User 1 ",
    //   color: "black",
    // },
    // {
    //   status: "Processed",
    //   title: "Working from Office",
    //   start: "2023-08-17",
    //   end: "2023-08-17",
    //   id: 2083856,
    //   full_name: "User 1 ",
    //   color: "indigo",
    // },
    // {
    //   status: "Processed",
    //   title: "Working from Office",
    //   start: "2023-08-17",
    //   end: "2023-08-17",
    //   id: 2083857,
    //   full_name: "User 1 ",
    // },
    // {
    //   status: "Processed",
    //   title: "Working from Home",
    //   start: "2023-08-18",
    //   end: "2023-08-18",
    //   id: 2083858,
    //   full_name: "User 1 ",
    //   color: "brown",
    // },
    // {
    //   status: "Processed",
    //   title: "Working from Home",
    //   start: "2023-08-18",
    //   end: "2023-08-18",
    //   id: 2083859,
    //   full_name: "User 1 ",
    //   color: "orange",
    //   link: "https://www.youtube.com",
    // },
  ],
};

const customConsole = (w) => {
  const pushToConsole = (payload, type) => {
    w.parent.postMessage(
      {
        console: {
          payload: stringify(payload),
          type: type,
        },
      },
      "*"
    );
  };

  w.onerror = (message, url, line, column) => {
    // the line needs to correspond with the editor panel
    // unfortunately this number needs to be altered every time this view is changed
    line = line - 70;
    if (line < 0) {
      pushToConsole(message, "error");
    } else {
      pushToConsole(`[${line}:${column}] ${message}`, "error");
    }
  };

  let console = (function (systemConsole) {
    return {
      log: function () {
        // let args = Array.from(arguments)
        // pushToConsole(args, "log")
        // systemConsole.log.apply(this, args)
      },
      info: function () {
        // let args = Array.from(arguments)
        // pushToConsole(args, "info")
        // systemConsole.info.apply(this, args)
      },
      warn: function () {
        // let args = Array.from(arguments)
        // pushToConsole(args, "warn")
        // systemConsole.warn.apply(this, args)
      },
      error: function () {
        // let args = Array.from(arguments)
        // pushToConsole(args, "error")
        // systemConsole.error.apply(this, args)
      },
      system: function (arg) {
        pushToConsole(arg, "system");
      },
      clear: function () {
        systemConsole.clear.apply(this, {});
      },
      time: function () {
        let args = Array.from(arguments);
        systemConsole.time.apply(this, args);
      },
      assert: function (assertion, label) {
        if (!assertion) {
          pushToConsole(label, "log");
        }

        let args = Array.from(arguments);
        systemConsole.assert.apply(this, args);
      },
    };
  })(window.console);

  window.console = { ...window.console, ...console };

  console.system("Running fiddle");
};

//   ................................................................................
// year range
function yearRange() {
  var currentYear = new Date().getFullYear();
  var yearArray = [];
  for (var i = currentYear; i <= currentYear + 5; i++) {
    yearArray.push({ t: i, v: i });
  }
  return yearArray;
}
// handle month change
function handleMonthChange(select) {
  let selectedYear = parseInt($(".select_year").val());
  let selectedMonth = select.value;
  window.localStorage.setItem("selectedMonth", selectedMonth);
  setDateToLocalStorage(selectedMonth, selectedYear);
  window.calendar.gotoDate(selectedYear + "-" + selectedMonth + "-01");
}
// handle year change
function handleYearChange(select) {
  let selectedYear = parseInt(select.value);
  let selectedMonth = $(".select_month").val();
  setDateToLocalStorage(selectedMonth, selectedYear);
  window.calendar.changeView("dayGridMonth", selectedMonth);
  window.calendar.gotoDate(selectedYear + "-" + selectedMonth + "-01");
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
  $("#dialog").dialog("option", "title", foundEvent.title);
  $(".ui-widget-header").css("background-color", foundEvent.color);
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
          "background-color": foundEvent.color,
          color: "white",
          border: foundEvent.color,
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