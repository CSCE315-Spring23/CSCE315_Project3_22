function xz_report() {

    // Send an AJAX request to the server to update the database
    var request = {}
    var xhr = new XMLHttpRequest();
    xhr.onload = () => {
        // menu, menu_ingredients
        var response = JSON.parse(xhr.response);
        var table = '<table><thead><tr><th>Report Type</th><th>Date</th><th>Total Sales</th></tr></thead><tbody>';
        for (var i = 0; i < response.pairs.length; i++) {
            table += '<tr>';
            table += '<td>' + "z report" + '</td>';
            table += '<td>' + response.xz.report_date + '</td>';
            table += '<td>' + response.xz.daily_sales + '</td>';
            table += '</tr>';
        }
        table += '</tbody></table>';
        $('#modal_table').html(table);
    }
    xhr.open("PUT", "/manager/reports/xz_report", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(request));
}