/**
 * The routes that handle generating each report for the manager.
 * @module manager/reports/routes
 * @requires express
 * @requires dotenv
 * @requires path
 * @requires pg
 * @requires process
 * @requires http
 */
const express = require("express");
require('dotenv').config();

const { Pool } = require('pg');
const path = require('path');
const { exit } = require("process");
const { get } = require("http");

const router = express.Router();

// const body_parser = require('body-parser');
// router.use(body_parser.urlencoded({extended: true}));
router.use(express.json());

/**
 * Initialize pool for accessing the database
 *
 * @memberof module:manager/reports/routes
 * @type {Pool}
 * @name pool
 * @inner
 */
const pool = new Pool({
    user: process.env.db_username,
    host: process.env.db_host,
    database: process.env.db_name,
    password: process.env.db_pass,
    port: 5432,
    ssl: {rejectUnauthorized: false}
});

/**
 * Render the reports page
 *
 * @memberof module:manager/reports/routes
 * @function
 * @name get/
 * @inner
 */
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('reports')
    }
    else {
        res.redirect('/')
    }
});

/**
 * Load the sells together report information. This report tells the manager what pairs of items sold most commonly together.
 *
 * @memberof module:manager/reports/routes
 * @function
 * @name put/sells_together
 * @inner
 */
router.put('/sells_together', (req, res) => {
    var start_date = req.body.startDate;
    var end_date = req.body.endDate;
    
    // mio - multi item orders (orders with multiple items)
    var mio_query = "SELECT DISTINCT order_id FROM (SELECT a.* FROM orders_by_item a JOIN (SELECT order_id, COUNT(*) " 
                            + "FROM orders_by_item GROUP BY order_id HAVING count(*) > 1) b ON a.order_id = b.order_id ORDER BY a.order_id) t " 
                            + "WHERE t.item_date between '" + start_date + "' and '" + end_date + "'";
    var qry = "SELECT menu_item_id FROM orders_by_item WHERE order_id=$1";

    mio_promise = () => {
		return new Promise((resolve, reject) => {
			pool.query(mio_query, function(err, result) {
				if (err) return reject(err);
				return resolve(result);
			});
		})
    }
    /**
     * Start the synchronous loop
     *
     * @memberof module:manager/reports/routes
     * @function
     * @name start
     * @inner
     */
    async function start() {
        const mios = await mio_promise();

        var pairs = {}
        /**
         * Loop synchronously through all orders with multiple items and count the occurences of each unique pair
         *
         * @memberof module:manager/reports/routes
         * @function
         * @name loop
         * @inner
         */
        var loop = function(idx) {
            if (idx < mios.rows.length) {
                mio_items_promise = () => {
                    return new Promise((resolve, reject) => {
                        pool.query(qry, [mios.rows[idx].order_id], (err, result) => {
                            if (err) return reject(err);
                            return resolve(result);
                        })
                    })
                }
                /**
                 * Generate a list of possible unique pairs, then check if the item has been counted already, if so, increment the count, otherwise add it to the map
                 *
                 * @memberof module:manager/reports/routes
                 * @function
                 * @name get_mio_items
                 * @inner
                 */
                async function get_mio_items() {
                    const mio_items = await mio_items_promise();
                    var item_names = [];
                    for (let i = 0; i < mio_items.rows.length; ++i) {
                        item_names.push(mio_items.rows[i].menu_item_id);
                    }
                    item_names.sort();
                    for (let j = 0; j < item_names.length - 1; ++j) {
                        for (let k = j + 1; k < item_names.length; ++k) {
                            var key = item_names[j] + item_names[k];
                            if (key in pairs) {
                                pairs[key].count += 1;
                            }
                            else {
                                pairs[key] = {item1 : item_names[j], item2 : item_names[k], count : 1};
                            }
                        }
                    }
                    loop(idx + 1);
                }
                get_mio_items();
            }
            else {
                var pairs_arr = [];
                for (const key in pairs) {
                    pairs_arr.push(pairs[key]);
                }
                // sort the output by count to show highest frequency at the top of the report
                pairs_arr = pairs_arr.sort((a, b) => {return b.count - a.count});
                res.send({pairs : pairs_arr});
            }
        }
        // have pairs
        loop(0);
    }
    start();
});

router.put('/load_restock', async (req, res) => {
    var restock_query = "SELECT product_id, product_name, 0.25 * MAX(quantity) AS quarter_max_quantity FROM inventory_snapshot WHERE snapshot_date >= '2022-12-02' AND snapshot_date <= '2023-01-01' GROUP BY product_id, product_name";

    try {
        const restock_report = await pool.query(restock_query);
        res.send({restock: restock_report.rows});
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});

/**

    PUT endpoint for retrieving all z_reports.

    @name module:routes/xz_report

    @param {Object} req - Express request object.

    @param {Object} res - Express response object.

    @throws {Error} 500 - Internal server error.

    @returns {Promise<void>} - Sends a JSON response with all z_reports.
    */
router.put('/xz_report', async (req, res) => {
    var xz_query = "SELECT * FROM z_reports";

    try {
        const xz_report = await pool.query(xz_query);
        res.send({xz: xz_report.rows});
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});


module.exports = router
