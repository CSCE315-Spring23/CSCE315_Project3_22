const { Client } = require('pg');

const client = new Client({
    user: "csce315331_team_22_master",
    password: "0000",
    host: "csce-315-db.engr.tamu.edu",
    database: "csce315331_team_22"
})

//const outputDiv = document.getElementById('output');

client.connect(function (err) {
    if (err) throw err;

    var query = "SELECT * FROM menu;";
    let html = '<table><tr><th>ID</th><th>Category</th><th>Price</th></tr>';
    client.query(query, function(err, results) {
        if (err) throw err;
        for(let i = 0; i < results.rows.length; i++) {
            html += '<tr><td>' + results.rows[i].menu_item_id + '</td><td>' + results.rows[i].category + '</td><td>' + results.rows[i].price + '</td></tr>';
        }
        html += '</table>';
        
        console.log(html);
        
    })
})
