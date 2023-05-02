// import statements
const express = require('express');
const {Pool} = require('pg');
const dotenv = require('dotenv').config();
const session = require('express-session');
const bodyParser = require('body-parser');

// create the express web app and set port no
const app = express();
const port = 3000;

// set up session
app.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.json());

// create connection pool
const pool = new Pool ({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    password: process.env.PSQL_PASSWORD,
    port: process.env.PSQL_PORT,
    ssl: {rejectUnauthorized: false}
});


/**
 * User home route that renders the user view.
 *
 * @function
 * @name homeRoute
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {undefined}
 */
app.get("/", function(req, res) {
    res.render('user');
});


/**
 * Route handler for retrieving menu items from the database.
 *
 * @function
 * @name menuItemsRouteHandler
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.get("/menu-items", function(req, res) {
    const category = req.query.category;

    let query;
    if (category == "featured") {
        // fetch the featured items (top 10 most selling)
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


/**
 * Route handler for retrieving the ingredients for a menu item from the database.
 *
 * @function
 * @name itemIngredientsRouteHandler
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.get("/item-ingredients", function(req, res) {
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
 * Route handler for retrieving a list of 8 additives from the database for a user to choose from.
 *
 * @function
 * @name additivesRouteHandler
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.get("/additives", function(req, res) {
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
 * Route handler for retrieving the price of a menu item from the database.
 *
 * @function
 * @name itemPriceRouteHandler
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.get("/item-price", function(req, res) {
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


/**
 * Route handler for storing cart information that was generated from the home page.
 *
 * @function
 * @name storeCartRouteHandler
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.post('/store-cart', (req, res) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }

    req.session.cart = req.body;
    res.sendStatus(200);
});


/**
 * Route handler for rendering the cart page with the cart information stored in the session.
 *
 * @function
 * @name cartPageRouteHandler
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.get("/cart", function(req, res) {
    res.render('cart', {cart: req.session.cart});
});


/**
 * Route handler for updating the database upon every new order.
 *
 * @async
 * @function
 * @name placeOrderRouteHandler
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.post('/place-order', async (req, res) => {
    let cart = req.body;

    // set up information for queries
    let order_id = await getLatestOrderId() + 1;
    let employee_id = Math.floor(Math.random() * 7) + 1;

    var currDate = new Date()
    var timestamp = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate() + " " + currDate.getHours() + ":"  + currDate.getMinutes() + ":" + currDate.getSeconds() + "." + currDate.getMilliseconds();
    
    let total_price = 0.00;
    cart.forEach(item => {
        total_price += parseFloat(item.price);
    });
    
    // update the orders_summary table
    await update_order_summary(order_id, employee_id, timestamp, total_price);

    // get information for updating orders_by_item as well as inventory and additives
    let item_id = await getLatestItemId() + 1;
    for (let item of cart) {
        let menu_item_id = item.name;
        let item_price = parseFloat(item.price);

        // update orders_by_item table
        await update_order_items(item_id, order_id, menu_item_id, timestamp, item_price);

        // update the inventory for each ingredient in the item
        for (let i = 0; i < item.ingredients.length; i++) {
            const ingredient = item.ingredients[i];
            await updateInventory(ingredient, menu_item_id);
        }

        // update the inventory for each additive in the item
        item.additives.forEach(async additive => {
            await updateAdditives(additive, item_id);
        });

        // update straws and cups in the database
        await update_straws_cups(menu_item_id);

        item_id += 1;
    }
    
    res.sendStatus(200);
});


/**
 * Starts the web app and listens on the specified port.
 *
 * @function
 * @name startServer
 * @param {number} port - The port number to listen on.
 * @returns {void}
 */
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


/**
 * Retrieves the latest order ID from the database.
 *
 * @async
 * @function
 * @name getLatestOrderId
 * @returns {Promise<number>} The latest order ID.
 */
async function getLatestOrderId() {
    let order_id = -1;

    let query;
    query = "SELECT order_id FROM orders_summary ORDER BY order_id DESC limit 1;";
    await pool.query(query)
    .then(result => {
        order_id = parseFloat(result.rows[0].order_id);
    })
    .catch(err => {
        console.error(err);
    });

    return order_id;
}


/**
 * Retrieves the latest item ID from the orders_by_item table in the database.
 *
 * @async
 * @function
 * @name getLatestItemId
 * @returns {Promise<number>} The latest item ID.
 */
async function getLatestItemId() {
    let item_id = -1;

    let query;
    query = "SELECT item_id FROM orders_by_item ORDER BY item_id DESC limit 1;";
    await pool.query(query)
    .then(result => {
        item_id = parseFloat(result.rows[0].item_id);
    })
    .catch(err => {
        console.error(err);
    });

    return item_id;
}


/**
 * Updates the orders_summary table in the database with the given order information.
 *
 * @async
 * @function
 * @name updateOrderSummary
 * @param {number} order_id - The ID of the order.
 * @param {number} employee_id - The ID of the employee who fulfilled the order.
 * @param {string} order_date - The date and time the order was placed.
 * @param {number} total_price - The total price of the order.
 * @returns {void}
 */
async function update_order_summary(order_id, employee_id, order_date, total_price) {
    query = "INSERT INTO orders_summary (order_id, employee_id, order_date, total_price) VALUES ($1, $2, $3, $4)"
    pool.query(query, [order_id, employee_id, order_date, total_price], function(err, results) {
        if (err) throw err;
    }) 
}


/**
 * Updates the orders_by_item table in the database with the given order item information.
 *
 * @async
 * @function
 * @name updateOrderItems
 * @param {number} item_id - The ID of the order item.
 * @param {number} order_id - The ID of the order.
 * @param {number} menu_item_id - The ID of the menu item.
 * @param {string} item_date - The date and time the item was ordered.
 * @param {number} item_price - The price of the item.
 * @returns {void}
 */
async function update_order_items(item_id, order_id, menu_item_id, item_date, item_price) {
    query = "INSERT INTO orders_by_item (item_id, order_id, menu_item_id, item_date, item_price) VALUES ($1, $2, $3, $4, $5);"
    pool.query(query, [item_id, order_id, menu_item_id, item_date, item_price], function(err, results) {
        if (err) throw err;
    })
}


/**
 * Updates the inventory in the database for the given product and menu item.
 *
 * @async
 * @function
 * @name updateInventory
 * @param {string} product_name - The name of the product in the inventory to update.
 * @param {number} menu_item_id - The ID of the menu item to update the inventory for.
 * @returns {void}
 */
async function updateInventory(product_name, menu_item_id) {
    let product_id = await getProductID(product_name);
    
    let quantity = await get_quantity(menu_item_id, product_id);

    let curr_quantity = await get_inv_quantity(product_name);

    let new_quantity = curr_quantity - quantity;

    await update_inv_quantity(product_name, new_quantity);
}


/**
 * Updates the inventory and item_additives tables in the database for the given additive and order item.
 *
 * @async
 * @function
 * @name updateAdditives
 * @param {string} additive - The name of the additive to update.
 * @param {number} item_id - The ID of the order item to update the additives for.
 * @returns {void}
 */
async function updateAdditives(additive, item_id) {
    let product_id = await getProductID(additive);

    let curr_quantity = await get_inv_quantity(additive);

    // decrement inventory
    await update_inv_quantity(additive, curr_quantity - 3);

    // insert into item_additives
    query = "INSERT INTO item_additives(item_id, product_id, additive_price, additive_quantity) VALUES ($1, $2, 0.99, 3.0)"
    pool.query(query, [item_id, product_id], function(err, results) {
        if (err) throw err;
    });
}


/**
 * Gets the ID of the product with the given name from the inventory table in the database.
 *
 * @async
 * @function
 * @name getProductID
 * @param {string} product_name - The name of the product to get the ID for.
 * @returns {number} The ID of the product with the given name.
 */
async function getProductID(product_name) {
    let product_id = -1;

    let query;
    query = "SELECT product_id FROM inventory WHERE product_name= $1;";
    await pool.query(query, [product_name])
    .then(result => {
        product_id = result.rows[0].product_id;
    })
    .catch(err => {
        console.error(err);
    });

    return product_id;
}


/**
 * Gets the quantity of the product with the given ID used in the menu item with the given ID from the menu_item_ingredients table in the database.
 *
 * @async
 * @function
 * @name get_quantity
 * @param {number} menu_item_id - The ID of the menu item to get the quantity for.
 * @param {number} product_id - The ID of the product to get the quantity for.
 * @returns {number} The quantity of the product with the given ID used in the menu item with the given ID.
 */
async function get_quantity(menu_item_id, product_id) {
    let quantity = -1;

    let query;
    query = "SELECT quantity FROM menu_item_ingredients WHERE menu_item_id= $1 AND product_id= $2;";
    await pool.query(query, [menu_item_id, product_id])
    .then(result => {
        quantity = result.rows[0].quantity;
    })
    .catch(err => {
        console.error(err);
    });

    return quantity;
}


/**
 * Gets the current quantity of the product with the given name from the inventory table in the database.
 *
 * @async
 * @function
 * @name get_inv_quantity
 * @param {string} product_name - The name of the product to get the quantity for.
 * @returns {number} The current quantity of the product with the given name.
 */
async function get_inv_quantity(product_name) {
    let quantity = -1;

    let query;
    query = "SELECT quantity FROM inventory WHERE product_name= $1;";
    await pool.query(query, [product_name])
    .then(result => {
        quantity = result.rows[0].quantity;
    })
    .catch(err => {
        console.error(err);
    });

    return quantity;
}


/**
 * Updates the current quantity of the product with the given name in the inventory table in the database to the given new quantity.
 *
 * @async
 * @function
 * @name update_inv_quantity
 * @param {string} product_name - The name of the product to update the quantity for.
 * @param {number} new_quantity - The new quantity to set for the product.
 */
async function update_inv_quantity(product_name, new_quantity) {
    query = "UPDATE inventory SET quantity= $1 WHERE product_name= $2;"
    pool.query(query, [new_quantity, product_name], function(err, results) {
        if (err) throw err;
    })
}


/**
 * Updates the inventory for cups and straws based on the size of the menu item.
 *
 * @async
 * @function
 * @name update_straws_cups
 * @param {string} menu_item_id - The id of the menu item to update the inventory for.
 */
async function update_straws_cups(menu_item_id) {
    // update cups
    let size = menu_item_id.substr(-2);
    if (size == "20") {
        query = "UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 77;"
        pool.query(query, function(err, results) {
            if (err) throw err;
        })
    }
    else if (size == "32") {
        query = "UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 78;"
        pool.query(query, function(err, results) {
            if (err) throw err;
        })
    }
    else {
        query = "UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 79;"
        pool.query(query, function(err, results) {
            if (err) throw err;
        })
    }

    // update straws
    query = "UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 80;"
    pool.query(query, function(err, results) {
        if (err) throw err;
    })
}