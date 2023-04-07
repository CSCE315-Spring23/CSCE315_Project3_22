const express = require("express");
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

router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
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
    }
    else {
        res.redirect('/');
    }
});

module.exports = router