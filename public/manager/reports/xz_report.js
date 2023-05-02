
/**
 * Sends an AJAX request to the server to retrieve data for the XZ report,
 * formats today's date, and builds an HTML table with conditional formatting
 * based on the current time. Displays the HTML table in a modal dialog on the page.
 *
 * @memberof module:manager/reports
 * @function xz_report
 * @returns {void}
 */
function xz_report() {

    // Send an AJAX request to the server to update the database
    var xhr = new XMLHttpRequest();
    const today = new Date();    
    const year = today.getFullYear(); // get the year (yyyy)
    const month = ('0' + (today.getMonth() + 1)).slice(-2); // get the month (mm)
    const day = ('0' + today.getDate()).slice(-2); // get the day (dd)
    const formattedDate = `${year}-${month}-${day}`;
    xhr.onload = () => {
        // menu, menu_ingredients
        var response = JSON.parse(xhr.response);
        // <th>Report Type</th>
        var table = '<table><thead><tr><th>Date</th><th>Total Sales</th></tr></thead><tbody>';
        for (var i = 0; i < response.xz.length; i++) {
            table += '<tr>';
            // response.xz.length
            // if (formattedDate === response.xz.report_date.toString() && today.getHours() < 17) {
            //     table += '<td>' + "x report" + '</td>';
            // }
            // else {
            //     table += '<td>' + "z report" + '</td>';
            // }
            table += '<td>' + response.xz.report_date + '</td>';
            table += '<td>' + response.xz.daily_sales + '</td>';
            table += '</tr>';
        }
        table += '</tbody></table>';
        $('#modal_table').html(table);
    }
    xhr.open("PUT", "/manager/reports/xz_report", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}