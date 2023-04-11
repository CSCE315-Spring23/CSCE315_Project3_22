const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// create pool
const pool = new Pool ({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    password: process.env.PSQL_PASSWORD,
    port: process.env.PSQL_PORT,
    ssl: {rejectUnauthorized: false}
});

// add process hook to shutdown pool
process.on("SIGINT", function() {
    pool.end();
    console.log("Application successfully shutdown");
    process.exit(0);
});

// home route
app.get("/", function(req, res) {
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
app.get("/menu-items", function(req, res) {
    const category = req.query.category;

    let query;
    if (category == "featured") {
        // fetch the featured items (most selling)
        query = "SELECT menu_item_id, COUNT(menu_item_id) FROM orders_by_item GROUP BY menu_item_id ORDER BY COUNT(menu_item_id) DESC LIMIT 15;";
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

// start web app and listen on port 3000
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});