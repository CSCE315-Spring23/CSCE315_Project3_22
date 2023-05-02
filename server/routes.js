/**
<<<<<<< HEAD
 * This file handles the connection between the PSQL database and the Server-Side Client 
 * @module server/server
 * @requires express
 * @requires passport
 * @requires uuid
 * @requires dotenv
 * @requires express-session
 * @requires path
 * @requires body-parser
 */

const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();

const app = express();
const port = 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const router = express.Router();
// router.set('view engine', 'ejs');
// app.use(express.static('public'));

// create pool
=======
 * The routes that handle loading the manager menu and updates to the menu and menu item ingredients.
 * @module manager/menu/routes
 * @requires express
 * @requires dotenv
 * @requires path
 * @requires pg
 * @requires process
 * @requires body-parser
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
 * @memberof module:manager/menu/routes
 * @type {Pool}
 * @name pool
 * @inner
 */
>>>>>>> origin/server-user-ui-adam
const pool = new Pool({
    user: process.env.db_username,
    host: process.env.db_host,
    database: process.env.db_name,
    password: process.env.db_pass,
    port: 5432,
    ssl: {rejectUnauthorized: false}
});
<<<<<<< HEAD
=======


>>>>>>> origin/server-user-ui-adam
// add process hook to shutdown pool
process.on("SIGINT", function() {
    pool.end();
    console.log("Application successfully shutdown");
    process.exit(0);
});

<<<<<<< HEAD
<<<<<<<< HEAD:server/routes.js
// home route
router.get("/", function(req, res) {
    // load menu items by category
    pool.query("SELECT menu_item_id, COUNT(menu_item_id) FROM orders_by_item GROUP BY menu_item_id ORDER BY COUNT(menu_item_id) DESC LIMIT 15;")
    .then(result => {
        let menu_set = new Set();
        for (let i = 0; i < result.rowCount; i++) {
            // get the actual name of item and add it to the menu set
            let item_name = result.rows[i].menu_item_id;
            menu_set.add(item_name.substring(0, item_name.length - 5));
        }

        const data = {featured_items: menu_set}
        res.render('server', data);
    })
});

// route to get menu items
router.get("/menu-items", function(req, res) {
========
=======

>>>>>>> origin/server-user-ui-adam
/**
 * Routes to the Server Side
 * 
 * @memberof module:server/server
 * @function
 * @name server/server
 * @inner
 */
<<<<<<< HEAD
app.get("/server", function(req, res) {
=======
router.get("/server", function(req, res) {
>>>>>>> origin/server-user-ui-adam
    res.render('server');
});

/**
 * Routes to the User Side
 * 
 * @memberof module:server/server
 * @function
 * @name server/user
 * @inner
 */
<<<<<<< HEAD
app.get("/user", function(req, res) {
=======
router.get("/user", function(req, res) {
>>>>>>> origin/server-user-ui-adam
    query = "SELECT menu_item_id, COUNT(menu_item_id) FROM orders_by_item GROUP BY menu_item_id ORDER BY COUNT(menu_item_id) DESC LIMIT 10;";
        pool.query(query)
        .then(result => {
            res.json(result.rows);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: "Error fetching menu items"});
        });
});

/**
 * Get Menu Items to Display
 * 
 * @memberof module:server/server
 * @function
 * @name server/menu-items
 * @inner
 */
<<<<<<< HEAD
app.get("/menu-items", function(req, res) {
>>>>>>>> origin/server-user-ui-adam:server.js
=======
router.get("/menu-items", function(req, res) {
>>>>>>> origin/server-user-ui-adam
    const category = req.query.category;

    let query;
    if (category == "featured") {
        // fetch the featured items (most selling)
        query = "SELECT menu_item_id, COUNT(menu_item_id) FROM orders_by_item GROUP BY menu_item_id ORDER BY COUNT(menu_item_id) DESC LIMIT 10;";
        pool.query(query)
        .then(result => {
            res.json(result.rows);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: "Error fetching menu items"});
        });
    }
    else {
        // fetch menu items based on the category
        query = "SELECT * FROM menu WHERE category = $1;";
        pool.query(query, [category])
        .then(result => {
            res.json(result.rows);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: "Error fetching menu items"});
        });
    }
});

<<<<<<< HEAD
<<<<<<<< HEAD:server/routes.js
router.get("/smoothie-price", (req, res) => {
    const { name } = req.query;
========
=======
>>>>>>> origin/server-user-ui-adam
/**
 * Update Order Tables and Inventory
 * 
 * @memberof module:server/server
 * @function
 * @name server/
 * @inner
 */
<<<<<<< HEAD
app.post("/", (req, res) => {
>>>>>>>> origin/server-user-ui-adam:server.js
=======
router.post("/", (req, res) => {
>>>>>>> origin/server-user-ui-adam

    let cart = req.body;
    console.log(cart)
    

    /**
     * ORDER SUMMARY UPDATE
    */ 
    var query = "SELECT * FROM orders_summary ORDER BY order_id DESC LIMIT 1;";
    pool.query(query)
    .then (result => {

        //New Order ID
        let new_order_id = Number(result.rows[0].order_id) + 1
        new_order_id = new_order_id.toString()
        //console.log(new_order_id)


        //Timestamp
        var currDate = new Date()
        var timestamp = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate() + " " + currDate.getHours() + ":"  
        + currDate.getMinutes() + ":" 
        + currDate.getSeconds() + "." + currDate.getMilliseconds();
        //console.log(timestamp)


        //Employee ID
        var employee_id = Math.floor((Math.random() * 6) + 1)
        //console.log(employee_id)


        //Total Price
        var totalPrice = 0
        cart.forEach(item => {
            totalPrice += Number(item.price)
        })
        //console.log(totalPrice)


        //ORDERS_SUMMARY INSERT
        
        query = "INSERT INTO orders_summary (order_id, employee_id, order_date, total_price) VALUES ($1, $2, $3, $4)"
        pool.query(query, [new_order_id, employee_id, timestamp, totalPrice], function(err, results) {
            if (err) throw err;
        
            console.log("Success")
        }) 
        


        //ORDERS BY ITEMS INSERT
        
        query = "SELECT * FROM orders_by_item ORDER BY item_id DESC LIMIT 1;"
        pool.query(query) 
        .then(result => {
            var new_item_id = Number(result.rows[0].item_id)
            for (let i = 0; i < cart.length; i++) {
                new_item_id += 1;
                //console.log(new_item_id)
                //console.log(cart[i].name)
                //console.log(cart[i].price)

                query = "INSERT INTO orders_by_item (item_id, order_id, menu_item_id, item_date, item_price) VALUES ($1, $2, $3, $4, $5);"
                pool.query(query, [new_item_id, new_order_id, cart[i].name, timestamp, cart[i].price], function(err, results) {
                    if (err) throw err;

                    console.log("Victory")
                })

                //INVENTORY UPDATE
                
                cart[i].ingredients.forEach(ingredient => {
                    var productID = ""
                    var quantity = 0;
                    var remaining_quantity = 0;
                    query = "SELECT product_id FROM inventory WHERE product_name= $1;"
                    pool.query(query, [ingredient], function(err, results) {
                        productID = results.rows[0].product_id
                        //console.log(productID)

                        query = "SELECT quantity FROM menu_item_ingredients WHERE menu_item_id= $1 AND product_id= $2;"
                        pool.query(query, [cart[i].name, productID], function(err, results) {
                            quantity = results.rows[0].quantity;
                            //console.log(quantity)

                            query = "SELECT quantity FROM inventory WHERE product_name = $1;"
                            pool.query(query, [ingredient], function(err, results) {
                                remaining_quantity = results.rows[0].quantity
                                //console.log(remaining_quantity)

                                query = query = "UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2"
                                pool.query(query, [quantity, productID], function(err, results) {
                                    console.log("success")
                                })
                            })
                        })
                    })

                    
                })

                cart[i].additives.forEach(additive => {
                    var productID = ''
                    var quantity = 0

                    query = "SELECT product_id, quantity FROM inventory WHERE product_name= $1;"
                    pool.query(query, [additive], function(err, results) {
                        productID = results.rows[0].product_id
                        quantity = results.rows[0].quantity
                        
                        query = "UPDATE inventory SET quantity= $1 WHERE product_name= $2;"
                        pool.query(query, [quantity-3, additive], function(err, results) {
                            //console.log("success")
                        })

                        query = "INSERT INTO item_additives(item_id, product_id, additive_price, additive_quantity) VALUES ($1, $2, 0.99, 3.0)"
                        pool.query(query, [new_item_id, productID], function(err, results) {
                            console.log("success")
                        })
                    })
                })
            }
        })        
    })     
});
    
    
/**
 * Gets Item Ingredients to Display
 * 
 * @memberof module:server/server
 * @function
 * @name server/item-ingredients
 * @inner
 */
<<<<<<< HEAD
app.get("/item-ingredients", function(req, res) {
=======
router.get("/item-ingredients", function(req, res) {
>>>>>>> origin/server-user-ui-adam
    const menu_item_id = req.query.menu_item_id;

    let query;
    query = "SELECT i.product_name FROM menu_item_ingredients m JOIN inventory i ON m.product_id = i.product_id WHERE m.menu_item_id = $1;";
    pool.query(query, [menu_item_id])
    .then(result => {
        res.json(result.rows);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: "Error fetching menu items"});
    });
});

/**
 * Gets Additives to Add to Menu Items
 * 
 * @memberof module:server/server
 * @function
 * @name server/additives
 * @inner
 */
<<<<<<< HEAD
app.get("/additives", function(req, res) {
=======
router.get("/additives", function(req, res) {
>>>>>>> origin/server-user-ui-adam
    let query;
    query = "SELECT * FROM additives LIMIT 8;";
    pool.query(query)
    .then(result => {
        res.json(result.rows);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: "Error fetching menu items"});
    });
});


/**
 * Gets Item Price to Display
 * 
 * @memberof module:server/server
 * @function
 * @name server/
 * @inner
 */
<<<<<<< HEAD
app.get("/item-price", function(req, res) {
=======
router.get("/item-price", function(req, res) {
>>>>>>> origin/server-user-ui-adam
    const menu_item_id = req.query.menu_item_id;

    let query;
    query = "SELECT menu_item_id, price FROM menu WHERE menu_item_id = $1";
    pool.query(query, [menu_item_id])
    .then(result => {
        res.json(result.rows);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: "Error fetching menu items"});
    });
});

<<<<<<< HEAD
app.get("/item-price", function(req, res) {
=======
router.get("/item-price", function(req, res) {
>>>>>>> origin/server-user-ui-adam
    const menu_item_id = req.query.menu_item_id;

    let query;
    query = "SELECT menu_item_id, price FROM menu WHERE menu_item_id = $1";
    pool.query(query, [menu_item_id])
    .then(result => {
        res.json(result.rows);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: "Error fetching menu items"});
    });
});

<<<<<<< HEAD
<<<<<<<< HEAD:server/routes.js
module.exports = router
========

// start web app and listen on port 3000
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
>>>>>>>> origin/server-user-ui-adam:server.js
=======
module.exports = router
>>>>>>> origin/server-user-ui-adam
