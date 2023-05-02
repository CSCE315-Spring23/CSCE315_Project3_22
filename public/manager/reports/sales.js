function sales_report() {
    var startDate = document.getElementById("start-date").value;
    var endDate = document.getElementById("end-date").value;

    var xhr = new XMLHttpRequest();
    xhr.onload = () => {
        var response = JSON.parse(xhr.response);
        var table = '<table><thead><tr><th>Product Name</th><th>Quantity Sold</th></tr></thead><tbody>';
        var sorted_sales = response.sales.sort(function(a, b) {
            return a.quantity_sold - b.quantity_sold;
        });
        for (var i = 0; i < sorted_sales.length; i++) {
            table += '<tr>';
            table += '<td>' + sorted_sales[i].menu_item_id + '</td>';
            table += '<td>' + sorted_sales[i].quantity_sold + '</td>';
            table += '</tr>';
        }
        table += '</tbody></table>';
        $('#modal_table2').html(table);
    };
    xhr.open("PUT", "/manager/reports/load_sales", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ start_date: startDate, end_date: endDate }));
}


function sortTable() {
    event.preventDefault();
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.querySelector("#modal_table2 table");
    switching = true;
    var sortDirection = document.getElementById("sort-button").getAttribute("data-sort-direction");
  
    if (sortDirection == "asc") {
      document.getElementById("sort-button").setAttribute("data-sort-direction", "desc");
      document.getElementById("sort-button").textContent = "Sort by Quantity Sold (Descending)";
    } else {
      document.getElementById("sort-button").setAttribute("data-sort-direction", "asc");
      document.getElementById("sort-button").textContent = "Sort by Quantity Sold (Ascending)";
    }
  
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < rows.length - 1; i++) {
        shouldSwitch = false;
        x = rows[i].querySelectorAll("td")[1];
        y = rows[i + 1].querySelectorAll("td")[1];
  
        if (sortDirection == "asc") {
          if (Number(x.innerHTML) > Number(y.innerHTML)) {
            shouldSwitch = true;
            break;
          }
        } else {
          if (Number(x.innerHTML) < Number(y.innerHTML)) {
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
}

function find_and_set_date(){
    // Get the current date
    var currentDate = new Date();
    
    // Calculate the date for one year ago
    var oneYearAgo = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    // Format the dates as strings in the format "yyyy-mm-dd"
    var oneYearAgoStr = oneYearAgo.toISOString().slice(0, 10);
    var currentDateStr = currentDate.toISOString().slice(0, 10);
    
    // Set the default values for the start and end date fields
    document.getElementById("start-date").value = oneYearAgoStr;
    document.getElementById("end-date").value = currentDateStr;

    // Get the date input fields
    var startDateInput = document.getElementById("start-date");
    var endDateInput = document.getElementById("end-date");

    // Add event listeners to the date input fields
    startDateInput.addEventListener("change", sales_report);
    endDateInput.addEventListener("change", sales_report);
}