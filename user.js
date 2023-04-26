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
    console.log(req.session.cart)
    res.render('cart', {cart: req.session.cart});
});

// start web app and listen on port 3000
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
