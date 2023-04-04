import { Client } from "./node_modules/pg.js";
const express = require('express');
const dotenv = require('dotenv').config();

const app = express();
const port = 3000;

const client = new Client({
    user: process.env.PSQL_USER,
    password: process.env.PSQL_PASSWORD,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    port: process.env.PSQL_PORT,
    sql: {rejectUnauthorized: false}
});

process.on('SIGINT', function() {
    client.end;
    console.log("Application Successfully Shutdown");
    process.exit(0);
});

app.set("view engine", "ejs");

app.get('/', (req, res) => {
  client.query('SELECT * FROM menu', (error, results) => {
    if (error) {
      throw error;
    }
    res.render('menu', { menu: results });
  });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});





// client.connect(function (err) {
//     if (err) throw err;

//     var query = "SELECT * FROM menu;";
//     let html = '<table><tr><th>ID</th><th>Name</th></tr>';
//     client.query(query, function(err, results) {
//         if (err) throw err;
//         for(let i = 0; i < results.length; i++) {
//             html += '<tr><td>' + results[i].menu_item_id + '</td><td>' + results[i].category + '</td><td>' + results[i].price + '</td></tr>';
//             console.log(results[i].menu_item_id);
//             console.log(results[i].category);
//             console.log(results[i].price);
//         }
//         html += '</table>';
        
        
//         //console.log(results) //display menu
//         outputDiv.innerHTML = html;

    
//     })
//     })