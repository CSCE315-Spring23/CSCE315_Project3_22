// import statements
const express = require('express');
const { Pool } = require('pg');
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

// user home route
app.get("/", function(req, res) {
    // render html code and css styling
    res.render('user');
});

// route to get menu items
app.get("/menu-items", function(req, res) {
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

// route to get item ingredients
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

// route to get additives
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

// store cart information
app.post('/store-cart', (req, res) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }

    // Assuming req.body contains the cart data
    req.session.cart = req.body;
    res.sendStatus(200);
});

// render the cart page
app.get("/cart", function(req, res) {
    // render html code and css styling
    res.render('cart', {cart: req.session.cart});
});

// store cart information
app.post('/place-order', async (req, res) => {
    let cart = req.body;

    // orders_summary = order_id, employee_id, order_date, total_price
    // order_id - query the database to get the latest order_id
    // SELECT order_id FROM orders_summary ORDER BY order_id DESC limit 1;
    let order_id = await getLatestOrderId() + 1;
    // employee_id - random number 1-7
    let employee_id = Math.floor(Math.random() * 7) + 1;

    // order_date - get the current date
    var currDate = new Date()
    var timestamp = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate() + " " + currDate.getHours() + ":"  + currDate.getMinutes() + ":" + currDate.getSeconds() + "." + currDate.getMilliseconds();
    
    // total_price - loop through each item in the cart (located in req.body)
    let total_price = 0.00;
    cart.forEach(item => {
        total_price += parseFloat(item.price);
    });
    
    await update_order_summary(order_id, employee_id, timestamp, total_price);

    let item_id = await getLatestItemId() + 1;
    // Process each item in the cart
    for (let item of cart) {
        // Get the latest item_id
        let menu_item_id = item.name;
        let item_price = parseFloat(item.price);

        // Insert the item into orders_by_item
        await update_order_items(item_id, order_id, menu_item_id, timestamp, item_price);

        // Update the inventory for each ingredient in the item
        item.ingredients.forEach(async ingredient => {
            await updateInventory(ingredient, menu_item_id);
        });

        // Update the inventory for each additive in the item
        item.additives.forEach(async additive => {
            await updateAdditives(additive, item_id);
        });

        await update_straws_cups(menu_item_id);

        item_id += 1;
    }

    res.sendStatus(200);
});

// start web app and listen on port 3000
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

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

async function update_order_summary(order_id, employee_id, order_date, total_price) {
    query = "INSERT INTO orders_summary (order_id, employee_id, order_date, total_price) VALUES ($1, $2, $3, $4)"
    pool.query(query, [order_id, employee_id, order_date, total_price], function(err, results) {
        if (err) throw err;
    }) 
}

async function update_order_items(item_id, order_id, menu_item_id, item_date, item_price) {
    query = "INSERT INTO orders_by_item (item_id, order_id, menu_item_id, item_date, item_price) VALUES ($1, $2, $3, $4, $5);"
    pool.query(query, [item_id, order_id, menu_item_id, item_date, item_price], function(err, results) {
        if (err) throw err;
    })
}

async function updateInventory(product_name, menu_item_id) {
    let product_id = await getProductID(product_name);
    
    let quantity = await get_quantity(menu_item_id, product_id);

    let curr_quantity = await get_inv_quantity(product_name);

    let new_quantity = curr_quantity - quantity;

    await update_inv_quantity(product_name, new_quantity);
}

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

async function update_inv_quantity(product_name, new_quantity) {
    query = "UPDATE inventory SET quantity= $1 WHERE product_name= $2;"
    pool.query(query, [new_quantity, product_name], function(err, results) {
        if (err) throw err;
    })
}

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