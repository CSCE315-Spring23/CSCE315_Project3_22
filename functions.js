import { Client } from 'pg';

const client = new Client({
    user: "csce315331_team_22_master",
    password: "0000",
    host: "csce-315-db.engr.tamu.edu",
    database: "csce315331_team_22"
})
const outputDiv = document.getElementById('output');

client.connect(function (err) {
    if (err) throw err;

    var query = "SELECT * FROM menu;";
    let html = '<table><tr><th>ID</th><th>Name</th></tr>';
    client.query(query, function(err, results) {
        if (err) throw err;
        for(let i = 0; i < results.length; i++) {
            html += '<tr><td>' + results[i].menu_item_id + '</td><td>' + results[i].category + '</td><td>' + results[i].price + '</td></tr>';
        }
        html += '</table>';
        
        
        //console.log(results) //display menu

        
    })
    outputDiv.innerHTML = html;
})