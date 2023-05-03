/**
 * Functions for generating the manager reports, which giving various kinds of information to help the manager run the business.
 * @module manager/reports
 */
/**
 * When the report modal is closed, reset the html to be empty
 *
 * @memberof module:manager/reports
 * @function
 * @name clear_modal
 * @inner
 */
function clear_modal() {
    $('#modal_table').html("");
    const popup = document.getElementById("date");
    popup.innerHTML = "";
    popup.style.width = '0px';
    popup.style.height = 'opx';
    popup.style.padding = '0px';
    popup.style.border = 'none';
    popup.style.background = 'none';
}

/**
 * Show a popup for selecting a date range, then send call generate_sells_together_report()
 *
 * @memberof module:manager/reports
 * @function
 * @name sells_together_report
 * @inner
 */
function sells_together_report() {
	// console.log('in modal');
	// console.log(button.dataset.ingredients);
    const popup = document.getElementById("date");
    popup.innerHTML = `
        <label for="start-date">Start Date:</label>
        <input type="date" id="start-date">
        <br>
        <label for="end-date">End Date:</label>
        <input type="date" id="end-date">
        <br>
        <button onclick="generate_sells_together_report()">Submit</button>
    `;
    
    // Style the popup
    popup.style.position = 'fixed';
    popup.style.zIndex = '100';
    popup.style.width = '240px';
    popup.style.height = '122px';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.padding = '20px';
    popup.style.border = '1px solid black';
    popup.style.background = 'white';
}

/**
 * Send a request to the backend to generate the sells together report over the specified date range, then change the modal html to show the results
 *
 * @memberof module:manager/reports
 * @function
 * @name generate_sells_together_report
 * @inner
 */
function generate_sells_together_report() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    if ((startDate == "") || (endDate == "")) {
        return;
    }
    
    const popup = document.getElementById("date");
    popup.innerHTML = "";
    popup.style.width = '0px';
    popup.style.height = 'opx';
    popup.style.padding = '0px';
    popup.style.border = 'none';
    popup.style.background = 'none';

    // Send an AJAX request to the server to update the database
    var request = {startDate: startDate, endDate: endDate}
    var xhr = new XMLHttpRequest();
    xhr.onload = () => {
        // menu, menu_ingredients
        var response = JSON.parse(xhr.response);
        var table = '<table style="border-collapse: collapse; border: 1px solid black;"><thead><tr style="background-color: #ddd;"><th style="padding: 10px; border: 1px solid black;">Item 1</th><th style="padding: 10px; border: 1px solid black;">Item 2</th><th style="padding: 10px; border: 1px solid black;">Count</th></tr></thead><tbody>';
        for (var i = 0; i < response.pairs.length; i++) {
            table += '<tr>';
            table += '<td style="padding: 10px; border: 1px solid black;">' + response.pairs[i].item1 + '</td>';
            table += '<td style="padding: 10px; border: 1px solid black;">' + response.pairs[i].item2 + '</td>';
            table += '<td style="padding: 10px; border: 1px solid black;">' + response.pairs[i].count + '</td>';
            table += '</tr>';
        }
        table += '</tbody></table>';
        $('#modal_table').html(table);
    }
    xhr.open("PUT", "/manager/reports/sells_together", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(request));
}
