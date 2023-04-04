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

router.get('/', function(req, res) {
    const query = "SELECT * FROM menu;";
    pool.query(query, function(err, results) {
        if (err) throw err;

        res.render('menu', { menu: results.rows });
    });
});

module.exports = router