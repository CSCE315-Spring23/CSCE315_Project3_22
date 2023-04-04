const express = require("express");
const { Pool } = require('pg');
require('dotenv').config();
const port = process.env.port;

const passport = require('passport');
const {check, validationResult} = require('express-validator');
const session = require('express-session');
const {v4 : uuidv4} = require('uuid');

const app = express();
// app.use(express.static('public'));

const body_parser = require('body-parser');
app.use(body_parser.urlencoded({extended: false}));

const login_routes = require('./login/routes')
app.use('/', login_routes)

app.listen(port, () => console.log(`Listening on ${port}`));

