/*
const {Client} = require('pg');
const client = new Client({
    user: "csce315331_team_22_master",
    password: "0000",
    host: "csce-315-db.engr.tamu.edu",
    database: "csce315331_team_22"
})

client.connect()
.then(() => console.log("Connected Successfully"))
.then(() => client.query("SELECT * from inventory"))
.then(results => console.table(results.rows))
.catch(e => console.log)
.finally(() => client.end())
*/



const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();
console.log(process.env.PSQL_USER);
console.log(process.env.PSQL_HOST);
console.log(process.env.PSQL_DATABASE);
console.log(process.env.PSQL_PASSWORD);
console.log(process.env.PSQL_PORT);
//console.log(dotenv.error); // prints any errors that occurred during dotenv config
const path = require('path');

// Create express app
const app = express();
const port = 3000;

// Create pool
//console.log(process.env);

const pool = new Pool({
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT,
  ssl: { rejectUnauthorized: false }
});

// Add process hook to shutdown pool
process.on('SIGINT', function () {
  pool.end();
  console.log('Application successfully shutdown');
  process.exit(0);
});

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Set the view engine to ejs
app.set('view engine', 'ejs');

/*
app.get('/',(req,res) => {
    res.send('This is a test!');
});
*/

app.get('/', (req, res) => {
    const query = {
        text: 'SELECT * FROM inventory;'
    };
    pool.query(query)
        .then(query_res => {
            const data = {teammembers: query_res.rows};
            console.log(query_res.rows);
            res.render('Inventory', data);
        })
        .catch(err => {
            console.error('Error executing query', err.stack);
            res.send('Error');
        });
});

/*
app.get('/user', (req, res) => {
  const query = {
    text: 'SELECT * FROM inventory;'
  };
  pool.query(query)
    .then(query_res => {
      const data = { inventory: query_res.rows };
      console.log(query_res.rows);
      res.render('Inventory', data);
    })
    .catch(err => {
      console.error('Error executing query', err.stack);
      res.send('Error');
    });
});
*/
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});