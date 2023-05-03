/**
* Express router for handling inventory management routes
* @module inventoryRouter
*/
const express = require("express");


var bodyParser = require('body-parser');
require('dotenv').config();

const passport = require('passport');
const session = require('express-session');
const {v4 : uuidv4} = require('uuid');
const { Pool } = require('pg');
const path = require('path');

const router = express.Router();

const body_parser = require('body-parser');
router.use(passport.initialize());
router.use(body_parser.urlencoded({extended: false}));
const pool = new Pool({
    user: process.env.db_username,
    host: process.env.db_host,
    database: process.env.db_name,
    password: process.env.db_pass,
    port: 5432,
    ssl: {rejectUnauthorized: false}
});

router.use(express.static('/public/styles'));

/**
* An endpoint that retrieves the inventory data from the database and renders it using the 'Inventory' view.
* @memberof module:inventoryRouter
* @name get/
* @param {Object} req - The request object
* @param {Object} res - The response object
* @param {Function} next - The next middleware function
*/
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        const query = {
            text: 'SELECT * FROM inventory;'
        };
        pool.query(query)
            .then(query_res => {
                const data = {teammembers: query_res.rows};
                //console.log(query_res.rows);
                res.render('Inventory', data);
            })
            .catch(err => {
                console.error('Error executing query', err.stack);
                res.send('Error');
            });
    }
    else {
        res.redirect('/');
    }
});

router.use(bodyParser.json());

/**
* An endpoint for updating the inventory data in the database.
* @memberof module:inventoryRouter
* @name put/route/update
* @param {Object} req - The request object
* @param {Object} res - The response object
* @param {Function} next - The next middleware function
*/
router.put('/route/update/:pufID/:ptu/:rpID/:ptA', (req, res) => {
  const removedProductIDs = JSON.parse(req.params.rpID);
  const productsToUpdate = JSON.parse(req.params.ptu);
  const productsToAdd = JSON.parse(req.params.ptA);
  const pufID = req.params.pufID;
    
  // do something with the data...
    
  //console.log(pufID);
  //console.log(productsToAdd);
  
  const updateQueries = [];

  for(let i = 0; i < productsToUpdate.length; i++){
    const query = {
      text: 'UPDATE inventory SET product_name = $1, quantity = $2 WHERE product_id = $3',
      values: [productsToUpdate[i].name, productsToUpdate[i].quantity, productsToUpdate[i].id]
    };

    updateQueries.push(pool.query(query));
  }

  for(let i = 0; i < productsToAdd.length; i++){
    const query = {
      text: 'INSERT INTO inventory (product_id, product_name, quantity) VALUES ($1, $2, $3)',
      values: [productsToAdd[i].id, productsToAdd[i].name, productsToAdd[i].quantity]
    };

    updateQueries.push(pool.query(query));
  }

  for(let i = 0; i < removedProductIDs.length; i++){
    const query2 = {
      text: 'UPDATE inventory SET quantity = -1 WHERE product_id = $1',
      values: [removedProductIDs[i]]
    };

    updateQueries.push(pool.query(query2));
  }
  
  Promise.all(updateQueries)
    .then(() => {
      res.send('Successfully updated inventory');
    })
    .catch(err => {
      console.error('Error executing update queries', err.stack);
      res.send('Error updating inventory');
    });

});

module.exports = router