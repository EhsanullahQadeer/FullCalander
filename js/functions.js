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

function findMissingValues(arr1, arr2) {
  // Create a Set from arr2 for faster look-up
  if (!arr1 || !arr2) {
    return;
  }
  const set2 = new Set(arr2);
  // Use filter to find values in arr1 that are not in arr2
  const missingValues = arr1.filter((value) => !set2.has(value));

  return missingValues;
}

function togleSelectALl(values, recordPrevoiusValues,select) {
  let latestValue = findMissingValues(values, recordPrevoiusValues);
  // Get the total number of options
  const totalOptions = $(select).find("option").length;
  // If other is selected, unselect "All"
  if (latestValue != -1 && values.includes("-1")) {
    const index = values.indexOf("-1");
    values.splice(index, 1);
  } else if (latestValue == -1) {
    values = [-1];
  } else if (totalOptions == values.length) {
    values = [-1];
  }

  return values;
}
// 
// Add a click event listener to the header buttons
