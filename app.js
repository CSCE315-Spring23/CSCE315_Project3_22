const express = require("express");
const { Pool } = require('pg');
require('dotenv').config();
const path = require('path');
const port = process.env.port;

const passport = require('passport');
// const {check, validationResult} = require('express-validator');
const session = require('express-session');
const {v4 : uuidv4} = require('uuid');

const app = express();
app.set("view engine", "ejs");
app.set('views', './views')

const body_parser = require('body-parser');
app.use(body_parser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

const login_routes = require('./login/routes')
app.use('/', login_routes)

const menu_board_routes = require('./menu_board/routes')
app.use('/menu_board', menu_board_routes)

const inventory_routes = require('./manager/inventory/routes')
app.use('/manager/inventory', inventory_routes)

const menu_routes = require('./manager/menu/routes')
app.use('/manager/menu', menu_routes)

const reports_routes = require('./manager/reports/routes')
app.use('/manager/reports', reports_routes)

const server_routes = require('./server/routes')
app.use('/server', server_routes)


app.listen(port, () => console.log(`Listening on ${port}`));

