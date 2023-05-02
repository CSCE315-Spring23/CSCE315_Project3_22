/**
 * The routes for loading the menu board items, then refreshing the items and sending them to the frontend
 * @module menu_board/routes
 * @requires express
 * @requires dotenv
 * @requires path
 * @requires pg
 * @requires process
 */
const express = require("express");
require('dotenv').config();

const { Pool } = require('pg');
const path = require('path');
const { exit } = require("process");

const router = express.Router();

// const body_parser = require('body-parser');
// router.use(body_parser.urlencoded({extended: true}));
router.use(express.json());

/**
 * Initialize pool for accessing the database
 *
 * @memberof module:menu_board/routes
 * @type {Pool}
 * @name pool
 * @inner
 */
const pool = new Pool({
    user: process.env.db_username,
    host: process.env.db_host,
    database: process.env.db_name,
    password: process.env.db_pass,
    port: 5432,
    ssl: {rejectUnauthorized: false}
});

/**
 * Array holding menu items like {menu_item_id: 'item', category: 'drink', price: 5.00}
 *
 * @memberof module:menu_board/routes
 * @type {Array}
 * @name menu
 * @inner
 */
menu = [];  // array of menu items, without size specifier, each is a row straight from the query
/**
 * Parallel array to menu holding arrays of menu item ingredients like {product_id: 0, quantity: 3.4}
 *
 * @memberof module:menu_board/routes
 * @type {Array}
 * @name menu_ingredients
 * @inner
 */
menu_ingredients = [];  // array corresponding to menu itmes, each idx is an array of ingredients by text name for respective menu item. items in same order as menu array
/**
 * Array holding the indices of the items to display on the menu board, updated by update_display_items()
 *
 * @see {update_display_items}
 * @memberof module:menu_board/routes
 * @type {Array}
 * @name menu_ingredients
 * @inner
 */
display_items = Array(4); display_items.fill(0);

/**
 * The product ids for cups and straws, which are ignored when generating the descriptions for items
 *
 * @memberof module:menu_board/routes
 * @type {Map}
 * @name ignored_ingredients
 * @inner
 */
var ignored_ingredients = new Map([  // keys are product ids not to add to ingredients (straws/cups), value doesn't matter, just checking membership
    ['77', 1],
    ['78', 1],
    ['79', 1],
    ['80', 1]
])

/**
 * Maps the smoothie category to an image for that category
 *
 * @memberof module:menu_board/routes
 * @type {Object}
 * @name category_to_img
 * @inner
 */
var category_to_img = {
    'be well': 1,
    'enjoy a treat': 2,
    'feel energized': 3,
    'get fit': 5,
    'manage weight': 6
}

var items = new Map();
/**
 * Map from product_id to product name
 *
 * @memberof module:menu_board/routes
 * @type {Map}
 * @name id_to_name
 * @inner
 */
var id_to_name = new Map();
/**
 * Map from product name to product_id
 *
 * @memberof module:menu_board/routes
 * @type {Map}
 * @name name_to_id
 * @inner
 */
var name_to_id = new Map();

/**
 * Generate new items to view on the menu board randomly, unique from the ones currently displayed
 *
 * @memberof module:menu_board/routes
 * @function
 * @name update_display_items
 * @inner
 */
function update_display_items() {
    var already_displayed = new Map();
    for (var i = 0; i < display_items.length; ++i) {
        already_displayed.set(display_items[i], 1);
    }
    var idx = 0;
    while (idx < display_items.length) {
        var candidate = Math.floor(Math.random() * menu.length);
        if (!already_displayed.has(candidate)) {
            display_items[idx] = candidate;
            already_displayed.set(candidate, 1);
            ++idx;
        }
    }
}

/**
 * Load the menu items, item ingredients and the product ids/names. Ignore ignored_ingredients and snacks
 *
 * @memberof module:menu_board/routes
 * @function
 * @name get/
 * @inner
 */
router.get('/', function(req, res) {
    /**
     * Query the database for menu items and store in menu
     *
     * @memberof module:menu_board/routes
     * @function
     * @name query1
     * @inner
     */
    query1 = () => {
        return new Promise((resolve, reject) => {
            var query = "SELECT * FROM menu ORDER BY menu_item_id";
            pool.query(query, function(err, result) {
                if (err) return reject(err);
                for (let i = 0; i < result.rowCount; ++i) {
                    var menu_item = result.rows[i].menu_item_id;
                    if (result.rows[i].category == 'snacks') continue;  // snacks, menu board will ignore those
                    menu_item = menu_item.substring(0, menu_item.length - 5);  // only unique items, not different sizes
                    if (!items.has(menu_item)) {
                        result.rows[i].menu_item_id = menu_item;
                        menu.push(result.rows[i]);
                        items.set(menu_item, 1);
                    }
                }
                return resolve();
            });
        })
    }
    /**
     * Query the database for product_ids and product names and store in id_to_name and name_to_id
     *
     * @memberof module:menu_board/routes
     * @function
     * @name query2
     * @inner
     */
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
    /**
     * Query the database for item ingredients for all menu items and store in item_ingredients. Ignore snacks, ignored ingredients and equivalent items with different size markers.
     *
     * @memberof module:menu_board/routes
     * @function
     * @name query3
     * @inner
     */
    query3 = () => {
    return new Promise((resolve, reject) => {
            var item_ingredients = [];
            var query = "SELECT menu_item_id,product_id FROM menu_item_ingredients ORDER BY menu_item_id";
            pool.query(query, function(err, result) {
                if (err) return reject(err);
                var curr_item = result.rows[0].menu_item_id;
                for (let i = 0; i < result.rowCount - 1; ++i) {
                    // duplicate or snack, skip over it
                    var row_item = result.rows[i].menu_item_id;
                    if ((row_item.at(-1) != '0' && row_item.at(-1) != '2') || items.has(row_item.substring(0, row_item.length - 5)) || ignored_ingredients.has(result.rows[i].product_id)) continue;

                    if (row_item != curr_item && item_ingredients.length == 0) {
                        curr_item = row_item;
                    }
                    else if (row_item != curr_item) {
                        menu_ingredients.push(item_ingredients);
                        items.set(row_item.substring(0, row_item.length - 5), 1);
                        item_ingredients = [];
                        curr_item = row_item;
                    }
                    if (items.has(row_item.substring(0, row_item.length - 5))) continue;
                    item_ingredients.push(id_to_name.get(result.rows[i].product_id));

                }
                // account for last ingredient
                if (item_ingredients.length != 0) menu_ingredients.push(item_ingredients);
                return resolve();
            });
    })
    }
    /**
     * Execute query1, query2 and query3 sequentially then render the menu board. Call update_display_items() to refresh the items on the board
     *
     * @memberof module:menu_board/routes
     * @function
     * @name sequential_queries
     * @inner
     */
    async function sequential_queries() {
        const q1 = await query1();
        const q2 = await query2();
        items.clear();  // clear for reuse in query3
        const q3 = await query3();

        update_display_items();
        res.render('menu_board', { menu: menu, menu_ingredients: menu_ingredients, display_items: display_items, category_to_img: category_to_img});
    }
    sequential_queries();
    // if (req.isAuthenticated()) {
        
    // }
    // else {
    //     res.redirect('/');
    // }
})

/**
 * Generate new items to view on the menu board randomly, unique from the ones currently displayed, then refresh the page
 *
 * @memberof module:menu_board/routes
 * @function
 * @name put/refresh_items
 * @inner
 */
router.put('/refresh_items', (req, res) => {
    update_display_items();
    res.send({menu: menu, menu_ingredients: menu_ingredients, display_items: display_items, category_to_img: category_to_img});
})

module.exports = router