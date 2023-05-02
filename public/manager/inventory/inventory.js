/**
 * Sorts the rows of a table in ascending order by the first column,
 * ignoring rows where the quantity in the third column is -1.
 */
function sort_table(){
    // Get the table element
    var table = document.querySelector('table');
            
    // Get the rows of the table
    var rows = Array.from(table.querySelectorAll('tr'));

    // Remove the header row from the array
    rows.shift();

    // Sort the rows by the first column in ascending order
    rows.sort(function(a, b) {
        var aId = parseInt(a.cells[0].textContent);
        var bId = parseInt(b.cells[0].textContent);
        return aId - bId;
    });

    // Remove the old rows from the table
    table.querySelector('tbody').innerHTML = '';

    // Add the sorted rows back to the table, ignoring rows with quantity = -1
    rows.forEach(function(row) {
        var quantity = parseInt(row.cells[2].textContent);
        if (quantity !== -1) {
            table.querySelector('tbody').appendChild(row);
        }
    });
}

/**
 * Adds a click event listener to a table body, and highlights the clicked row.
 */
function table_highlight(){
    // Get a reference to the table body
    var tableBody = document.querySelector('tbody');
  
    // Add an event listener to the table body
    tableBody.addEventListener('click', function(event) {
    // Check if the clicked element is a table cell
    if (event.target.tagName === 'TD') {
        // Get a reference to the clicked row
        var clickedRow = event.target.parentElement;

        // Remove the highlight class from all rows
        tableBody.querySelectorAll('tr').forEach(function(row) {
            row.classList.remove('highlight');
        });

        // Add the highlight class to the clicked row
        clickedRow.classList.add('highlight');
    }
    });
}

/**
 * Adds a row to a table when a button is clicked.
 *
 * @param {number} nextProductID - The ID to use for the next row.
 */
function addRow(nextProductID){
    // Get a reference to the table body
    var tableBody = document.querySelector('tbody');
        
    // Get a reference to the "Add Row" button
    var addRowBtn = document.querySelector('#addRowBtn');

    // Keep track of the next product ID to use
    //var nextProductID = 1;

    // Add an event listener to the "Add Row" button
    addRowBtn.addEventListener('click', function() {
        // Create a new row
        var newRow = document.createElement('tr');

        // Insert the cells for the row
        newRow.innerHTML = '<td>' + nextProductID + '</td><td contenteditable="true"></td><td contenteditable="true"></td>';

        // Append the row to the table
        tableBody.appendChild(newRow);

        // Increment the product ID for the next row
        nextProductID++;
    });

}

/**
 * Removes a row from a table when a button is clicked, and returns an array of
 * the removed product IDs.
 *
 * @returns {array} The array of removed product IDs.
 */
function removeRow(){
    // Get a reference to the table body
    var tableBody = document.querySelector('tbody');
                  
    // Get a reference to the "Remove Row" button
    var removeRowBtn = document.querySelector('#removeRowBtn');
  
    // Keep track of the selected row
    var selectedRow = null;
  
    // Keep track of the removed product IDs
    var removedProductIDs = [];
  
    // Add an event listener to the table body to handle row selection
    tableBody.addEventListener('click', function(event) {
      // Get a reference to the clicked row
      var clickedRow = event.target.parentNode;
  
      // Deselect the previously selected row
      if (selectedRow !== null) {
        selectedRow.classList.remove('table-primary');
      }
  
      // Select the clicked row
      clickedRow.classList.add('table-primary');
      selectedRow = clickedRow;
    });
  
    // Add an event listener to the "Remove Row" button
    removeRowBtn.addEventListener('click', function() {
      // Check that a row is selected
      if (selectedRow !== null) {
        // Get the product ID of the selected row
        var productID = selectedRow.cells[0].textContent;
  
        // Remove the selected row from the table
        tableBody.removeChild(selectedRow);
  
        // Add the removed product ID to the list
        removedProductIDs.push(productID);
  
        // Deselect the selected row
        selectedRow.classList.remove('table-primary');
        selectedRow = null;
      }
    });

    return removedProductIDs;
}

/**
*
* Sends an AJAX request to update the products in the database with the current data in the table.
*
* @param {number} preUpdateFinalID - The last product ID before any updates are made.
* 
* @param {Array} removedProductIDs - An array of product IDs that have been removed from the table.
*/
function update(preUpdateFinalID, removedProductIDs){
    $(document).ready(function() {
        $("#updateBtn").click(function() {

          var productsToUpdate = [];
          var productsToAdd = [];
          $('table tbody tr').each(function() {
              const id = $(this).children().eq(0).text().trim();
              const name = $(this).children().eq(1).text().trim();
              const quantity = parseInt($(this).children().eq(2).text().trim());

              if (!isNaN(quantity)) {
                  if (id > preUpdateFinalID && name != '') {
                      productsToAdd.push({ id , name, quantity });
                  } else {
                      productsToUpdate.push({ id, name, quantity });
                  }
              }
          });
          const temp = JSON.stringify(productsToUpdate);
          const temp2 = JSON.stringify(removedProductIDs);
          const temp3 = JSON.stringify(productsToAdd);
          //console.log(temp);
          $.ajax({
              type: "PUT",
              url: "route/update/" + preUpdateFinalID + "/" + encodeURIComponent(temp) + "/" + encodeURIComponent(temp2) + "/" + encodeURIComponent(temp3),
              data: JSON.stringify({
                  pufID: preUpdateFinalID,
                  ptu: temp,
                  rpID: temp2,
                  ptA: temp3
                  
              }),
              contentType: "app/json",

              success: function(data) {
                  //console.log(data);
              },
              error: function(xhr, status, error) {
                  console.error(error);
              }
          });
        });
    });
}