function sells_together_report() {
	// console.log('in modal');
	// console.log(button.dataset.ingredients);

    // Send an AJAX request to the server to update the database
    var request = {}
    var xhr = new XMLHttpRequest();
    xhr.onload = () => {
        // menu, menu_ingredients
        var response = JSON.parse(xhr.response);
        var table = '<table><thead><tr><th>Item 1</th><th>Item 2</th><th>Count</th></tr></thead><tbody>';
        for (var i = 0; i < response.pairs.length; i++) {
            table += '<tr>';
            table += '<td>' + response.pairs[i].item1 + '</td>';
            table += '<td>' + response.pairs[i].item2 + '</td>';
            table += '<td>' + response.pairs[i].count + '</td>';
            table += '</tr>';
        }
        table += '</tbody></table>';
        $('#modal_table').html(table);
    }
    xhr.open("PUT", "/manager/reports/sells_together", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(request));
}

