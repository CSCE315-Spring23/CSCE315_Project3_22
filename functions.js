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
        console.log("new order id " + new_order_id) //display new orderid
        

        for (let i = 0; i < 3; i++) {  //change to fit the order from customer
                                       //ITEM_ID DOES NOT UPDATE EACH LOOP FIND FIX
            
            query = "SELECT * FROM orders_by_item ORDER BY item_id DESC LIMIT 1;"
            client.query(query, function(err, results) {
                if (err) throw err;

                console.log("current item_id" + results.rows[0].item_id)
                let new_item_id = Number(results.rows[0].item_id) + 1
                new_item_id = new_item_id.toString()
                console.log("new item id" + new_item_id)

                var currDate = new Date()
                var timestamp = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate() + " " + currDate.getHours() + ":"  
                + currDate.getMinutes() + ":" 
                + currDate.getSeconds() + "." + currDate.getMilliseconds();
                console.log(timestamp)

                var item = "banana boat - 20"
                var price = "5.69"
                query = "INSERT INTO orders_by_item (item_id, order_id, menu_item_id, item_date, item_price) VALUES ($1, $2, $3, $4, $5)"
                client.query(query, [new_item_id, new_order_id, item, timestamp, price], function(err, results) {
                    if (err) throw err;

                    console.log("item inserted")
                    client.end();
                })
            })
            client.end()

            
        }
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