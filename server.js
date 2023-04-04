const express = require('express');
const { Client } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
    user: "csce315331_team_22_master",
    password: "0000",
    host: "csce-315-db.engr.tamu.edu",
    database: "csce315331_team_22"
});

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    client.connect(function(err) {
        if (err) throw err;
        
        const query = "SELECT * FROM menu;";
        client.query(query, function(err, results) {
            if (err) throw err;

            res.render('index', { data: results.rows });
        });
    });
});

app.listen(port, function() {
    console.log(`Server listening on port ${port}`);
});
