/**
 * The routes for handling login and user authentication using Google Oauth.
 * @module login/routes
 * @requires express
 * @requires passport
 * @requires uuid
 * @requires dotenv
 * @requires express-session
 * @requires path
 * @requires body-parser
 */

const express = require("express");
require('dotenv').config();

const passport = require('passport');
const session = require('express-session');
const {v4 : uuidv4} = require('uuid');
const path = require('path');

const router = express.Router();

const body_parser = require('body-parser');
router.use(body_parser.urlencoded({extended: false}));
router.use(passport.initialize());
/**
 * Initialize google oauth session with random ID and secret from Google cloud
 *
 * @memberof module:login/routes
 * @function
 * @name use/session
 * @inner
 */
router.use(session({
    genid: function(req) {
        return uuidv4();
    },
    secret: '29842asSAFW@#$Afsfa3@$!',
    resave: false,
    saveUninitialized: true,
    cookie : {maxAge: 60 * 60 * 1000}
}));
router.use(passport.authenticate('session', {session: true}));

var GoogleStrategy = require('passport-google-oauth20');

/**
 * Initialize the authentication strategy used by passport to a GoogleStrategy with clientID and clientSecret from .env file. 
 *
 * @memberof module:login/routes
 * @function
 * @name use/GoogleStrategy
 * @inner
 */
passport.use(new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: '/oauth2/redirect/google',
    scope: [ 'profile' ],
    state: true
  },
    function verify(accessToken, refreshToken, profile, cb) {
        return cb(null, {email: profile._json.email});
    }
));

/**
 * Initialize login route to google using passport
 *
 * @memberof module:login/routes
 * @function
 * @name get/login
 * @inner
 */
router.get('/login', passport.authenticate('google', {scope : ['email']}));

/**
 * Callback route, after successful google login, authenticates user and if successful, redirects appropriately, otherwise redirects back to the login page
 *
 * @memberof module:login/routes
 * @function
 * @name get/oauth2/redirect/google
 * @inner
 */
router.get('/oauth2/redirect/google',
    passport.authenticate('google', { failureRedirect: '/', failureMessage: true }),
    (req, res) => {
        res.redirect('/redirect');
    }
);

/**
 * Home route with a login button, or if already logged in, sends the user to the redirect route
 * 
 * @memberof module:login/routes
 * @function
 * @name get/
 * @inner
 */
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/redirect');
    }
    else {
        res.sendFile(path.normalize(__dirname + '/../views/index.html'));
    }
});


/**
 * The redirect route, which sends the manager to the redirect page, for entering the different views, and the servers to the server page
 * 
 * @memberof module:login/routes
 * @function
 * @name get/redirect
 * @inner
 */
router.get('/redirect', (req, res) => {
    if (req.isAuthenticated()) {
        var email = req.user.email;
        var authorized_users = process.env.authorized_users.split(",");
        if (authorized_users.includes(email)) {
            if (email == authorized_users[0]) {
                res.sendFile(path.normalize(__dirname + '/../views/redirect.html'));
            }
            else {
                res.redirect('/server');
            }
        }
        else {
            req.logout(function(err) {
                if (err) { return next(err); }
                res.redirect('/');
            });
        }
    }
    else {
        res.redirect('/');
    }
});

/**
 * Redirect to the user home page for placing new orders
 * 
 * @memberof module:login/routes
 * @function
 * @name get/user_index
 * @inner
 */
router.get('/user_index', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.normalize(__dirname + '/../views/user_index.html'));
    }
    else {
        res.redirect('/');
    }
});

/**
 * Redirect to the manager view, for viewing the inventory, menu and reports
 * 
 * @memberof module:login/routes
 * @function
 * @name get/manager
 * @inner
 */
router.get('/manager', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('manager');
    }
    else {
        res.redirect('/');
    }
});

/**
 * Logout and redirect to the login page
 * 
 * @memberof module:login/routes
 * @function
 * @name post/logout
 * @inner
 */
router.post('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, user);
    });
});
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

module.exports = router