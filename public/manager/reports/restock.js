function restock_report() {
    var xhr = new XMLHttpRequest();
    xhr.onload = () => {
        var response = JSON.parse(xhr.response);
        var table = '<table><thead><tr><th>Product ID</th><th>Product Name</th><th>Quarter Max Quantity</th></tr></thead><tbody>';
        for (var i = 0; i < response.restock.length; i++) {
            table += '<tr>';
            table += '<td>' + response.restock[i].product_id + '</td>';
            table += '<td>' + response.restock[i].product_name + '</td>';
            table += '<td>' + response.restock[i].quarter_max_quantity + '</td>';
            table += '</tr>';
        }
        table += '</tbody></table>';
        $('#modal_table').html(table);
    }
    xhr.open("PUT", "/manager/reports/load_restock", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}
