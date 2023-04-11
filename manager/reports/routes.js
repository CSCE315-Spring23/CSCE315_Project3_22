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

const pool = new Pool({
    user: process.env.db_username,
    host: process.env.db_host,
    database: process.env.db_name,
    password: process.env.db_pass,
    port: 5432,
    ssl: {rejectUnauthorized: false}
});

router.get('/', (req, res) => {
    res.render('reports')
    // if (req.isAuthenticated()) {
    //     res.render('reports')
    // }
    // else {
    //     res.redirect('/')
    // }
});

router.put('/sells_together', (req, res) => {
    // mio - multi item orders (orders with multiple items)
    var mio_query = "SELECT DISTINCT order_id FROM (SELECT a.* FROM orders_by_item a JOIN (SELECT order_id, COUNT(*) " 
                            + "FROM orders_by_item GROUP BY order_id HAVING count(*) > 1) b ON a.order_id = b.order_id ORDER BY a.order_id) t " 
                            + "WHERE t.item_date between '2022-12-31' and '2023-03-25'";
    var qry = "SELECT menu_item_id FROM orders_by_item WHERE order_id=$1";

    mio_promise = () => {
		return new Promise((resolve, reject) => {
			pool.query(mio_query, function(err, result) {
				if (err) return reject(err);
				return resolve(result);
			});
		})
    }
    async function start() {
        const mios = await mio_promise();

        var pairs = {}
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
                pairs_arr = pairs_arr.sort((a, b) => {return b.count - a.count});
                res.send({pairs : pairs_arr});
            }
        }
        // have pairs
        loop(0);
    }
    start();
});



// JTable table = new JTable();
// DefaultTableModel model = new DefaultTableModel();
// model.addColumn("Item 1");
// model.addColumn("Item 2");
// model.addColumn("Count");

// // Fill in generating your report and adding to the report frame

// //Initialize an Array of Pairs
// ArrayList<OrderPair> order_pairs = new ArrayList<OrderPair>();  

// //Initialize variables to iterate through the rows of query
// int prev_order_id = 0;
// int curr_order_id = 0;
// String prev_item = "";
// String curr_item = "";

// try {  //The Query

//     //Time stamp to get date range 
//     SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
//     String userDateInput = JOptionPane.showInputDialog(null, "Please enter a start date (YYYY-MM-DD):");
//     java.util.Date parsedDate = dateFormat.parse(userDateInput);
//     // Timestamp timestamp = new java.sql.Timestamp(parsedDate.getTime());
//     Timestamp from = new Timestamp(parsedDate.getTime());
//     userDateInput = JOptionPane.showInputDialog(null, "Please enter an end date (YYYY-MM-DD):");
//     parsedDate = dateFormat.parse(userDateInput);
//     Timestamp to = new Timestamp(parsedDate.getTime());

//     //Connection to database and query to get orders within a time frame
//     Connection conn = null;
//     conn = DriverManager.getConnection("jdbc:postgresql://csce-315-db.engr.tamu.edu/csce315331_team_22","csce315331_team_22_master", "0000");
//     // String selectQuery = "SELECT * FROM orders_by_item WHERE item_date between '?' and '?'";
//     // selects unique order_ids for orders that have more than order_item in them
//     String selectQuery = "SELECT DISTINCT order_id FROM (SELECT a.* FROM orders_by_item a JOIN (SELECT order_id, COUNT(*) " 
//                             + "FROM orders_by_item GROUP BY order_id HAVING count(*) > 1) b ON a.order_id = b.order_id ORDER BY a.order_id) t " 
//                             + "WHERE t.item_date between ? and ?";
//     PreparedStatement selectStmt = conn.prepareStatement(selectQuery);
//     selectStmt.setTimestamp(1, from);
//     selectStmt.setTimestamp(2, to);
//     ResultSet multi_item_orders = selectStmt.executeQuery();

//     HashMap<String, OrderPair> pairs = new HashMap<String, OrderPair>();

//     String qry = "SELECT menu_item_id FROM orders_by_item WHERE order_id=?";
//     PreparedStatement get_item_names = conn.prepareStatement(qry);
//     //iterates through the unique order ids for orders with multiple items
//     while (multi_item_orders.next()) {
//         get_item_names.setInt(1, multi_item_orders.getInt("order_id"));
//         ResultSet mio_items = get_item_names.executeQuery();  // multi item orders (mio) items

//         // number of possible pairs = (n(n+1) / 2) - n == n choose 2
//         ArrayList<String> item_names = new ArrayList<String>();
//         while (mio_items.next()) {
//             item_names.add(mio_items.getString("menu_item_id"));
//         }
//         // sort by anything, here item names, so that when coming up with pairs, they appear in the same order every time
//         // so that they can be used to access the hash map
//         Collections.sort(item_names);
//         for (int i = 0; i < item_names.size() - 1; ++i) {
//             for (int j = i + 1; j < item_names.size(); ++j) {
//                 // if the pair is already in there
//                 String key = item_names.get(i) + item_names.get(j);
//                 if (pairs.containsKey(key)) {
//                     pairs.get(key).count++;
//                 }
//                 else {
//                     pairs.put(key, new OrderPair(item_names.get(i), item_names.get(j)));
//                 }
//             }
//         }
//     }
//     // convert hash map to array list for sorting by frequency (count)
//     ArrayList<OrderPair> final_pairs = new ArrayList<OrderPair>(pairs.values());
//     Collections.sort(final_pairs, Collections.reverseOrder());
//     for (OrderPair pr : final_pairs) {
//         model.addRow(new Object[]{pr.item1, pr.item2, pr.count});
//     }



module.exports = router
