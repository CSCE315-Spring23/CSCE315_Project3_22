/**
 * @module app
 * @requires express
 * @requires passport
 * @requires pg
 * @requires ejs
 * @requires uuid
 * @requires dotenv
 * @requires express-session
 * @requires path
 * @requires body-parser
 */

const express = require("express");
const { Pool } = require('pg');
require('dotenv').config();
const path = require('path');
const port = process.env.PORT;

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

/**
 * Imports the login router which handles login and redirect routes
 * @memberof module:app
 * @name login_routes
 * @type {express.Router}
 */
const login_routes = require('./login/routes')
app.use('/', login_routes)

/**
 * Imports the menu board router which loads the menu board page, which showcases different menu items and showing the weather
 * @memberof module:app
 * @name menu_board_routes
 * @type {express.Router}
 */
const menu_board_routes = require('./menu_board/routes')
app.use('/menu_board', menu_board_routes)

/**
 * Imports the inventory router which handles the inventory page on the manager side, allowing the manager to view, edit and update the inventory manually
 * @memberof module:app
 * @name inventory_routes
 * @type {express.Router}
 */
const inventory_routes = require('./manager/inventory/routes')
app.use('/manager/inventory', inventory_routes)

/**
 * Imports the menu router which handles the menu page on the manager side, allowing the manager to view, edit and update the menu manually
 * @memberof module:app
 * @name menu_routes
 * @type {express.Router}
 */
const menu_routes = require('./manager/menu/routes')
app.use('/manager/menu', menu_routes)

/**
 * Imports the reports router which handles routes for generating manager reports
 * @memberof module:app
 * @name reports_routes
 * @type {express.Router}
 */
const reports_routes = require('./manager/reports/routes')
app.use('/manager/reports', reports_routes)

/**
 * Imports the server router which handles the server page, allowing the server to efficiently place orders for a customer
 * @memberof module:app
 * @name server_routes
 * @type {express.Router}
 */
const server_routes = require('./server/routes')
app.use('/server', server_routes)


app.listen(port, () => console.log(`Listening on ${port}`));