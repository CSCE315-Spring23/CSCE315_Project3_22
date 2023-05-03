
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
//     var xhr = new XMLHttpRequest();
//     const today = new Date();    
//     const year = today.getFullYear(); // get the year (yyyy)
//     const month = ('0' + (today.getMonth() + 1)).slice(-2); // get the month (mm)
//     const day = ('0' + today.getDate()).slice(-2); // get the day (dd)
//     const formattedDate = `${year}-${month}-${day}`;
    
//     xhr.onload = () => {
//         // menu, menu_ingredients
//         var response = JSON.parse(xhr.response);
//         var table = '<table><thead><tr><th>Report Type</th><th>Date</th><th>Total Sales</th></tr></thead><tbody>';
//         for (var i = 0; i < response.xz.length; i++) {
//             table += '<tr>';
//             response.xz.length
//             if (formattedDate === response.xz._date.toString() && today.getHours() < 17) {
//                 table += '<td>' + "x report" + '</td>';
//             }
//             else {
//                 table += '<td>' + "z report" + '</td>';
//             }
//             table += '<td>' + response.xz.report_date + '</td>';
//             table += '<td>' + response.xz.daily_sales + '</td>';
//             table += '</tr>';
//         }
//         table += '</tbody></table>';
//         $('#modal_table').html(table);
//     }
//     xhr.open("PUT", "/manager/reports/xz_report", true);
//     xhr.setRequestHeader("Content-type", "application/json");
//     xhr.send();
// }
    var xhr = new XMLHttpRequest();
    var table = '<table style="border-collapse: collapse; border: 1px solid black; margin-top:10px; margin-left:auto; margin-right:auto"><thead><tr style="background-color: #ddd;"><th style="padding: 10px; border: 1px solid black;">Report Type </th><th style="padding: 10px; border: 1px solid black;"> Date </th><th style="padding: 10px; border: 1px solid black;"> Total Sales </th></tr></thead><tbody>';
    var total_sales = 0;

    xhr.onload = () => { 
    var response = JSON.parse(xhr.response);
    var prev_splitted = response.xz[0].order_date.split('T')[0];
    for (var i = 1; i < response.xz.length; i++) {
        var splitted = response.xz[i].order_date.split('T')[0];
        var row = [];
        var myobj = new Date();
        var formattedDate = myobj.getFullYear() + "-" + ('0' + (myobj.getMonth() + 1)).slice(-2) + "-" + ('0' + myobj.getDate()).slice(-2);
        //handles old z reports 
        total_sales += parseFloat(response.xz[i].total_price);
        if (prev_splitted !== splitted) {
            if (response.xz[i].order_date.split('T')[0] === formattedDate && myobj.getHours() < 17) {
                row.push("x report");
            }
            else {
                row.push("z report");
            }
            row.push(prev_splitted);
            row.push(parseFloat(total_sales).toFixed(2));
            table += '<tr><td style="padding: 10px; border: 1px solid black;">' + row[0] + '</td><td style="padding: 10px; border: 1px solid black;">' + row[1] + '</td><td style="padding: 10px; border: 1px solid black;">' + row[2] + '</td></tr>';
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