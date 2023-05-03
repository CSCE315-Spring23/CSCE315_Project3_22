/**
 * Generate the restock report, counting the items in the inventory that need restocking and suggested quantities for refill
 *
 * @memberof module:manager/reports
 * @function
 * @name restock_report
 * @inner
 */
function restock_report() {
    var xhr = new XMLHttpRequest();
    xhr.onload = () => {
        var response = JSON.parse(xhr.response);
        var table = '<table style="border-collapse: collapse; border: 1px solid black;"><thead><tr style="background-color: #ddd;"><th style="padding: 10px; border: 1px solid black;">Product ID</th><th style="padding: 10px; border: 1px solid black;">Product Name</th><th style="padding: 10px; border: 1px solid black;">Quarter Max Quantity</th></tr></thead><tbody>';
        for (var i = 0; i < response.restock.length; i++) {
            table += '<tr>';
            table += '<td style="padding: 10px; border: 1px solid black;">' + response.restock[i].product_id + '</td>';
            table += '<td style="padding: 10px; border: 1px solid black;">' + response.restock[i].product_name + '</td>';
            table += '<td style="padding: 10px; border: 1px solid black;">' + response.restock[i].quarter_max_quantity + '</td>';
            table += '</tr>';
        }
        table += '</tbody></table>';
        $('#modal_table').html(table);
    }
    xhr.open("PUT", "/manager/reports/load_restock", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}
