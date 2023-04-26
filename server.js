const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();

const app = express();
const port = 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
            const totalPrice = req.body.price;
            //console.log(totalPrice)


            //ORDERS_SUMMARY INSERT
            
            query = "INSERT INTO orders_summary (order_id, employee_id, order_date, total_price) VALUES ($1, $2, $3, $4)"
            pool.query(query, [new_order_id, employee_id, timestamp, totalPrice], function(err, results) {
                if (err) throw err;
            
                console.log("Success")
            }) 
            
            const item = req.body.hiddenItem;
            const price = req.body.hiddenPrice;

            //ORDERS BY ITEMS INSERT
            
            query = "SELECT * FROM orders_by_item ORDER BY item_id DESC LIMIT 1;"
            pool.query(query) 
            .then(result => {
                var new_item_id = Number(result.rows[0].item_id)
                for (let i = 0; i < item.length; i++) {
                    new_item_id += 1;
                    console.log(new_item_id)

                    query = "INSERT INTO orders_by_item (item_id, order_id, menu_item_id, item_date, item_price) VALUES ($1, $2, $3, $4, $5);"
                    pool.query(query, [new_item_id, new_order_id, item[i], timestamp, price[i]], function(err, results) {
                        if (err) throw err;

                        console.log("Victory")
                    })
                } 
            })




            

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
