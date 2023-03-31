const {Client} = require('pg')
const client = new Client({
    user: "csce315331_team_22_master",
    password: "0000",
    host: "csce-315-db.engr.tamu.edu",
    database: "csce315331_team_22"
})

client.connect(function (err) {
    if (err) throw err;

    var query = "SELECT * FROM orders_by_item ORDER BY order_id DESC LIMIT 1;"
    client.query(query, function(err, results) {
        if (err) throw err;

        console.log(results.rows[0].order_id) //display last orderid
        let new_order_id = Number(results.rows[0].order_id) + 1
        new_order_id = new_order_id.toString()
        console.log(new_order_id) //display new orderid

        
    })
})


/*
var results = await client.query("SELECT order_id FROM orders_summary ORDER BY order_id DESC LIMIT 1;")
const  order_id = results.rows[0].order_id + 1

results = client.query("SELECT item_price FROM orders_by_item WHERE order_id = $1")
var total_price = 0;
for (let i = 0; i < results.rows.length; i++) {
    total_price += results.rows[i].item_price
}

var query = "INSERT INTO orders_summary (order_id, employee_id, order_date, total_price VALUES ($1, $2, $3, $4)" */