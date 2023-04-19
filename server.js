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

// server route
app.get("/server", function(req, res) {
    res.render('server');
});

// user route
app.get("/user", function(req, res) {
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


app.post("/", (req, res) => {

    /**
     * ORDER SUMMARY UPDATE
    */ 
        var query = "SELECT * FROM orders_summary ORDER BY order_id DESC LIMIT 1;";
        pool.query(query)
        .then (result => {
    
            //New Order ID
            let new_order_id = Number(result.rows[0].order_id) + 1
            new_order_id = new_order_id.toString()
            console.log(new_order_id)
    
    
            //Timestamp
            var currDate = new Date()
            var timestamp = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate() + " " + currDate.getHours() + ":"  
            + currDate.getMinutes() + ":" 
            + currDate.getSeconds() + "." + currDate.getMilliseconds();
            console.log(timestamp)
    
    
            //Employee ID
            var employee_id = Math.floor((Math.random() * 6) + 1)
            console.log(employee_id)
    
    
            //Total Price
            let total_price = "22.73"  //Fix Total Price to fetch from ejs
    
            //for loop to iterate through order summary
            //query sql to get most recent item_id and incremenmt
            //get timestamp
            //get menu_item_id and price and insert into sql
                
        })
        
    });
    
    

// start web app and listen on port 3000
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});