const {Client} = require('pg')
const client = new Client({
    user: "csce315331_team_22_master",
    password: "0000",
    host: "csce-315-db.engr.tamu.edu",
    database: "csce315331_team_22"
})

client.connect(function (err) {
    if (err) throw err;

    var query = "SELECT * FROM menu;"
    client.query(query, function(err, results) {
        if (err) throw err;
        for(let i = 0; i < results.length; i++) {
            html += '<tr><td>' + results[i].menu_item_id + '</td><td>' + results[i].category + '</td><td>' + results[i].price + '</td></tr>';
        }
        html += '</table>';
        
        //console.log(results) //display menu

        
    })
})