const express = require("express");
require('dotenv').config();

const { Pool } = require('pg');
const path = require('path');
const { exit } = require("process");

const router = express.Router();

// const body_parser = require('body-parser');
// router.use(body_parser.urlencoded({extended: true}));
router.use(express.json());

const pool = new Pool({
    user: process.env.db_username,
    host: process.env.db_host,
    database: process.env.db_name,
    password: process.env.db_pass,
    port: 5432,
    ssl: {rejectUnauthorized: false}
});

var menu = []
var menu_ingredients = []
var id_to_name = new Map();
var name_to_id = new Map();

var items = new Map();
var items2 = new Map();

router.get('/', function(req, res) {
    if (req.isAuthenticated()) {
        query1 = () => {
			return new Promise((resolve, reject) => {
				var query = "SELECT * FROM menu ORDER BY menu_item_id";
				pool.query(query, function(err, result) {
					if (err) return reject(err);
					for (let i = 0; i < result.rowCount; ++i) {
						menu.push(result.rows[i]);
						items.set(result.rows[i].menu_item_id, 1);
					}
					return resolve();
				});
			})
		}
		query2 = () => {
			return new Promise((resolve, reject) => {
				var query = "SELECT product_id, product_name FROM inventory ORDER BY product_id";
				pool.query(query, function(err, result) {
					if (err) return reject(err);
					for (let i = 0; i < result.rowCount; ++i) {
						id_to_name.set(result.rows[i].product_id, result.rows[i].product_name);
						name_to_id.set(result.rows[i].product_name, result.rows[i].product_id);
					}
					return resolve();
				});
			})
		}
		query3 = () => {
		  return new Promise((resolve, reject) => {
				var item_ingredients = [];
				var query = "SELECT menu_item_id,product_id,quantity FROM menu_item_ingredients ORDER BY menu_item_id";
				pool.query(query, function(err, result) {
					if (err) return reject(err);
					var curr_item = result.rows[0].menu_item_id;
					for (let i = 0; i < result.rowCount; ++i) {
						if (result.rows[i].menu_item_id != curr_item) {
							menu_ingredients.push(item_ingredients);
							items2.set(curr_item, 1);
							item_ingredients = [];
							curr_item = result.rows[i].menu_item_id;
						}
						item_ingredients.push(JSON.stringify({product_id: id_to_name.get(result.rows[i].product_id), quantity: result.rows[i].quantity}));
					}
					menu_ingredients.push(item_ingredients);
					items2.set(curr_item, 1);
					return resolve();
				});
		  })
		}
		async function sequential_queries() {
			const q1 = await query1();
			const q2 = await query2();
			const q3 = await query3();
	
			for (let [key, val] of items) {
				if (!items2.has(key)) {
					console.log('menu item ingredients missing ' + key);
					exit(0);
				}
			}
			res.render('menu', { menu: menu, menu_ingredients : menu_ingredients });
		}
		sequential_queries();
    }
    else {
        res.redirect('/');
    }
});

router.put("/update_ingredients", function(req, res) {
	var request = req.body;

	// update menu ingredients
	var item_ingredients = request.item_ingredients.filter((ingredient) => (JSON.parse(ingredient).product_id != "") && name_to_id.has(JSON.parse(ingredient).product_id));
	if (item_ingredients.length == 0) {
		res.send({menu : menu, menu_ingredients : menu_ingredients});
		return;
	}
	menu_ingredients[request.idx] = item_ingredients;
	// delete and refresh menu_item_ingredients table
	query1 = () => {
		return new Promise((resolve, reject) => {
			var query = "DELETE FROM menu_item_ingredients WHERE menu_item_id=$1";
			pool.query(query, [menu[request.idx].menu_item_id], function(err, result) {
				if (err) return reject(err);
				return resolve();
			});
		})
    }
    query2 = () => {
		return new Promise((resolve, reject) => {
			var query = "INSERT INTO menu_item_ingredients VALUES ";
			var values = []
			var count = 1;
			for (let i = 0; i < item_ingredients.length; ++i) {
				var item_ing = JSON.parse(item_ingredients[i]);
				if (item_ing.product_id == "") return reject(err);
				query += '(\'' + menu[request.idx].menu_item_id + '\',$' + count + ', $' + (count + 1) + '),';
				count += 2;
				values.push(name_to_id.get(item_ing.product_id));
				values.push(item_ing.quantity);
			}
			query = query.substring(0, query.length - 1);  // drop the last comma
			pool.query(query, values, function(err, result) {
				if (err) return reject(err);
				return resolve();
			});
		})
    }

    async function sequential_queries() {
		const q1 = await query1();
		const q2 = await query2();
		res.send({menu: menu, menu_ingredients: menu_ingredients});
    }
    sequential_queries();
});

router.put("/update_menu", function(req, res) {
    // req.body = {idx : x, menu_item_id : x, category : x, price : x}
    var row = req.body;
    // handle updates to values (menu_item_id, category and price)
    // handle adding rows
    // handle removing rows
    // load the product id : quantity column and handle updates to that

    if (row.idx == menu.length && row.menu_item_id != "") {  // new item, make sure menu_item_id is the value that was changed
		update_data = () => {
			return new Promise((resolve, reject) => {
				menu.push({menu_item_id: row.menu_item_id, category: 'None', price: '0.00'});
				var item_ingredients = [];
				item_ingredients.push(JSON.stringify({product_id: 'cups 20 oz', quantity: '1.0'}));
				menu_ingredients.push(item_ingredients);
				return resolve();
			})
		}
		update_menu = () => {
			return new Promise((resolve, reject) => {
				var query = "INSERT INTO menu VALUES ($1, 'None', 0)";
				pool.query(query, [row.menu_item_id], function(err, result) {
					if (err) return reject(err);
					return resolve();
				});
			})
		}
        update_menu_item_ingredients = () => {
			return new Promise((resolve, reject) => {
				var query2 = "INSERT INTO menu_item_ingredients VALUES (\'" + row.menu_item_id + "\', 77, 1.0)";
				pool.query(query2, function(err, result) {
					if (err) return reject(err);
					return resolve();
				});
			})
		}
		async function sequential_queries() {  // have to wait for them to finish because you can edit the item ingredients for a new product before its in the menu
			const q1 = await update_data();
			const q2 = await update_menu();
			const q3 = await update_menu_item_ingredients();

			res.send({menu : menu, menu_ingredients : menu_ingredients});
		}
		sequential_queries();
    }
    else if (row.menu_item_id == "" && row.idx != menu.length) {  // deleting item
		del1 = () => {
			return new Promise((resolve, reject) => {
				var query = "DELETE FROM menu_item_ingredients WHERE menu_item_id=$1";
				pool.query(query, [menu[row.idx].menu_item_id], function(err, result) {
					if (err) throw err;
					return resolve();
				});
			})
		}
		del2 = () => {
			return new Promise((resolve, reject) => {
				var query = "DELETE FROM menu WHERE menu_item_id=$1";
				pool.query(query, [menu[row.idx].menu_item_id], function(err, result) {
					if (err) throw err;
					return resolve();
				});
			})
		}
		async function sequential_delete() {
			const q1 = await del1();
			const q2 = await del2();

			menu.splice(row.idx, 1);
			menu_ingredients.splice(row.idx, 1);
			res.send({menu : menu, menu_ingredients : menu_ingredients});
		}
		sequential_delete();
    }
    else if (row.menu_item_id != "" && row.menu_item_id == menu[row.idx].menu_item_id && row.price != "" && row.category != "") {  // if not deleting, can't change the menu_item_id
		menu[row.idx] = {menu_item_id: row.menu_item_id, category: row.category, price: row.price};
        var query = "UPDATE menu SET category=$1, price=$2 WHERE menu_item_id=$3";
        pool.query(query, [row.category, row.price, row.menu_item_id], function(err, result) {
			if (err) throw err;
        });
		res.send({menu : menu, menu_ingredients : menu_ingredients});
    }
    else {
		res.send({menu : menu, menu_ingredients : menu_ingredients});
	}
});
  

module.exports = router