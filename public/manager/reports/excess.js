/**
 * Send a PUT request to load the excess report for a given timestamp and display the result in a modal table.
 *
 * @memberof module:manager/reports
 * @function
 * @name excess_report
 * @inner
 */
function excess_report() {
    var timestamp = document.getElementById("timestamp").value;

    var xhr = new XMLHttpRequest();
    xhr.onload = () => {
        var response = JSON.parse(xhr.response);
        var table = '<table style="border-collapse: collapse; border: 1px solid black;"><thead><tr style="background-color: #ddd;"><th style="padding: 10px; border: 1px solid black;">Product ID</th><th style="padding: 10px; border: 1px solid black;">Quantity Name</th><th style="padding: 10px; border: 1px solid black;">Timestamp Quantity</th><th style="padding: 10px; border: 1px solid black;">Current Quantity</th></tr></thead><tbody>';
        for (var i = 0; i < response.excess.length; i++) {
            if( ((response.excess[i].timestamp_q - response.excess[i].quantity) > 0) && ((response.excess[i].timestamp_q - response.excess[i].quantity) < .1 * response.excess[i].timestamp_q) || (response.excess[i].timestamp_q - response.excess[i].quantity) == 0){
                table += '<tr>';
                table += '<td style="padding: 10px; border: 1px solid black;">' + response.excess[i].product_id + '</td>';
                table += '<td style="padding: 10px; border: 1px solid black;">' + response.excess[i].product_name + '</td>';
                table += '<td style="padding: 10px; border: 1px solid black;">' + response.excess[i].timestamp_q + '</td>';
                table += '<td style="padding: 10px; border: 1px solid black;">' + response.excess[i].quantity + '</td>';
                table += '</tr>';
            }
        }
        table += '</tbody></table>';
        $('#modal_table3').html(table);
    };
    xhr.open("PUT", "/manager/reports/load_excess", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ time_stamp: timestamp }));
}
/**
 * Set the default timestamp value to the current date and attach an event listener to the timestamp input field to trigger the excess report.
 *
 * @memberof module:manager/reports
 * @function
 * @name find_and_set_timestamp
 * @inner
 */
function find_and_set_timestamp(){
    // Get the current date
    var currentDate = new Date();

    
    // Format the dates as strings in the format "yyyy-mm-dd"
    var currentDateStr = currentDate.toISOString().slice(0, 10);
    
    // Set the default values for the start and end date fields
    document.getElementById("timestamp").value = currentDateStr;

    // Get the date input fields
    var timestampInput = document.getElementById("timestamp");

    // Add event listeners to the date input fields
    timestampInput.addEventListener("change", excess_report);
}