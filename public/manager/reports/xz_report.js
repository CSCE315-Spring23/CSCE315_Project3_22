
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
    var xhr = new XMLHttpRequest();
    var table = '<table><thead><tr><th>Report Type</th><th>Date</th><th>Total Sales</th></tr></thead><tbody>';
    var total_sales = 0;
    var response = JSON.parse(xhr.response);
    var prev_splitted = response.xz[0][2].split(" ");
    xhr.onload = () => {
    for (var i = 0; i < response.xz.length; i++) {
        var splitted = response.xz[i][2].split(" ");
        var row = [];
        var myobj = new Date();
        var formattedDate = myobj.getFullYear() + "-" + ('0' + (myobj.getMonth() + 1)).slice(-2) + "-" + ('0' + myobj.getDate()).slice(-2);
        
        //handles old z reports 
        total_sales += response.xz[i][3];
        if (prev_splitted[0] !== splitted[0]) {
            if (splitted[0] === formattedDate && myobj.getHours() < 17) {
                row.push("x report");
            }
            else {
                row.push("z report");
            }
            row.push(splitted[0]);
            row.push(total_sales);
            table += '<tr><td>' + row[0] + '</td><td>' + row[1] + '</td><td>' + row[2] + '</td></tr>';
            total_sales = 0; 
            prev_splitted = splitted;
        }
        //handles old x reports if they're needed 
    }
    table += '</tbody></table>';
    $('#modal_table').html(table);
}

    xhr.open("PUT", "/manager/reports/xz_report", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}