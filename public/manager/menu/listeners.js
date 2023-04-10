function load_item_ingredients_modal(button) {
	// console.log('in modal');
	// console.log(button.dataset.ingredients);
	var item_ingredients = button.dataset.ingredients.split(',');
	var temp = []
	for (let i = 0; i < item_ingredients.length; i += 2) {
		temp.push(JSON.parse(item_ingredients[i] + ',' + item_ingredients[i + 1]));
	}
	item_ingredients = temp;

	var ingredients_table = '<table><thead><tr><th>Ingredient ID</th><th>Quantity (oz)</th></tr></thead><tbody>';

	// Loop through the data and generate a row for each ingredient
	for (var i = 0; i < item_ingredients.length; i++) {
		ingredients_table += '<tr>';
		ingredients_table += '<td onclick="edit_ingredient_cell(this)">' + item_ingredients[i].product_id + '</td>';
		ingredients_table += '<td onclick="edit_ingredient_cell(this)">' + item_ingredients[i].quantity + '</td>';
		ingredients_table += '</tr>';
	}
	ingredients_table += '<tr>';
	ingredients_table += '<td onclick="edit_ingredient_cell(this)">New ID</td>';
	ingredients_table += '<td onclick="edit_ingredient_cell(this)">New Quantity</td>';
	ingredients_table += '</tr>';

	ingredients_table += '</tbody></table>';

	// Append the table HTML to the placeholder div
	$('#modal_table').html(ingredients_table);
	document.querySelector('#modal_table').dataset.idx = button.closest('tr').rowIndex;
}

function edit_ingredient_cell(cell) {
	// take into account - menu_ingredients array already has array for ingredients, just need to add and remove items from it, no pushing to menu_ingredients
	// const ing_row = cell.parentElement;
	// console.log('ing_row in edit ingredient cell');
	// console.log(ing_row);
	const ing_table = cell.closest('tbody');

	// Create an input field with the current cell content
	var input = document.createElement("input");
	input.type = "text";
	input.value = cell.innerHTML;
	
	// Replace the cell content with the input field
	cell.innerHTML = "";
	cell.appendChild(input);
	input.focus();
	
	// When the input field loses focus, send an AJAX request to the server to update the database
	input.addEventListener("blur", function() {
		// Update the cell content with the new value
		var newValue = input.value;
		cell.innerHTML = newValue;

		var request = {}
		request.idx = document.querySelector('#modal_table').dataset.idx - 1;  // this rowIndex starts at 1 not 0
		var item_ingredients = []

		// all rows except placeholder row
		for (let i = 0; i < ing_table.children.length - 1; ++i) {
			var product_id = ing_table.children[i].children[0].innerHTML;
			var quantity = ing_table.children[i].children[1].innerHTML;
			item_ingredients.push(JSON.stringify({product_id: product_id, quantity: quantity}));
		}

		// if placeholder row for new values was edited
		var product_id = ing_table.children[ing_table.children.length - 1].children[0].innerHTML;
		var quantity = ing_table.children[ing_table.children.length - 1].children[1].innerHTML;
		if (!(product_id == "New ID" && quantity == "New Quantity")) {
			item_ingredients.push(JSON.stringify({product_id: product_id, quantity: '0'}));
		}
		request.item_ingredients = item_ingredients;
		// Get the new cell content

		// Send an AJAX request to the server to update the database
		var xhr = new XMLHttpRequest();
		xhr.onload = () => {
			// menu, menu_ingredients
			var response = JSON.parse(xhr.response);

			var ing_button = document.querySelector('[id="' + response.menu[request.idx].menu_item_id + '"]').children[3].children[0];
			ing_button.dataset.ingredients = join(response.menu_ingredients[request.idx]);
			load_item_ingredients_modal(ing_button);
		}
		xhr.open("PUT", "/manager/menu/update_ingredients", true);
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.send(JSON.stringify(request));
	});
	
		// When the Enter key is pressed, trigger the blur event to save the new cell content
	input.addEventListener("keydown", function(event) {
		if (event.key === 'Enter') {
			input.blur();
		}
	});
}

function join(arr) {
	var str = '';
	for (let i = 0; i < arr.length - 1; ++i) {
		str += arr[i] + ',';
	}
	str += arr[arr.length - 1];
	return str;
}

function edit_menu_cell(cell) {
	const table_row = cell.closest('tr');

	// Create an input field with the current cell content
	var input = document.createElement("input");
	input.type = "text";
	input.value = cell.innerHTML;
	
	// Replace the cell content with the input field
	cell.innerHTML = "";
	cell.appendChild(input);
	input.focus();
	
	// When the input field loses focus, send an AJAX request to the server to update the database
	input.addEventListener("blur", function() {
		// Update the cell content with the new value
		var newValue = input.value;
		cell.innerHTML = newValue;

		var row = {}
		row.idx = table_row.rowIndex - 1;  // this rowIndex starts at 1 not 0
		row.menu_item_id = table_row.cells[0].innerHTML;
		row.category = table_row.cells[1].innerHTML;
		row.price = table_row.cells[2].innerHTML;
		// Get the new cell content

		// Send an AJAX request to the server to update the database
		var xhr = new XMLHttpRequest();
		xhr.onload = () => {
			// menu, menu_ingredients
			var response = JSON.parse(xhr.response);
			// console.log(JSON.parse(xhr.response));
			var menu = response.menu;
			var menu_ingredients = response.menu_ingredients;
			var updated_table = "";
			for (let i = 0; i < menu.length; ++i) {
				updated_table += '<tr id="' + menu[i].menu_item_id + '">';
				updated_table += '<td onclick="edit_menu_cell(this)">' + menu[i].menu_item_id + '</td>';
				updated_table += '<td onclick="edit_menu_cell(this)">' + menu[i].category + '</td>';
				updated_table += '<td onclick="edit_menu_cell(this)">' + menu[i].price + '</td>';
				updated_table += '<td><button data-toggle="modal" data-target="#ingredientsModal" onclick="load_item_ingredients_modal(this)" class="btn btn-width bkgrnd-cyan">Edit</button></td>';
				updated_table += '</tr>';
			}
			updated_table += '<tr id="">';
			updated_table += '<td onclick="edit_menu_cell(this)"></td>';
			updated_table += '<td onclick="edit_menu_cell(this)"></td>';
			updated_table += '<td onclick="edit_menu_cell(this)"></td>';
			updated_table += '<td><button class="btn btn-width bkgrnd-cyan">Edit</button></td>';
			updated_table += '</tr>';

			$('#menu_table').html("");
			document.querySelector('#menu_table').innerHTML = updated_table;
			for (let i = 0; i < menu.length; ++i) {
				var ing_button = document.querySelector('[id="' + menu[i].menu_item_id + '"]').children[3].children[0];
				ing_button.dataset.ingredients = join(menu_ingredients[i]);
			}
		}
		xhr.open("PUT", "/manager/menu/update_menu", true);
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.send(JSON.stringify(row));
	});
	
		// When the Enter key is pressed, trigger the blur event to save the new cell content
	input.addEventListener("keydown", function(event) {
		if (event.key === 'Enter') {
			input.blur();
		}
	});
}
  