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

router.get('/login', passport.authenticate('google', {scope : ['email']}));
router.get('/oauth2/redirect/google',
    passport.authenticate('google', { failureRedirect: '/', failureMessage: true }),
    (req, res) => {
        res.redirect('/redirect');
    }
);

router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/redirect');
    }
    else {
        res.sendFile(path.normalize(__dirname + '/../views/index.html'));
    }
});

router.get('/redirect', (req, res) => {
    if (req.isAuthenticated()) {
        var email = req.user.email;
        var authorized_users = process.env.authorized_users.split(",");
        if (authorized_users.includes(email)) {
            // if (email == authorized_users[0]) {
            //     res.sendFile(path.normalize(__dirname + '/../views/redirect.html'));
            // }
            // else {
            //     res.redirect('/server');
            // }
            res.sendFile(path.normalize(__dirname + '/../views/redirect.html'));
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

router.get('/user_index', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.normalize(__dirname + '/../views/user_index.html'));
    }
    else {
        res.redirect('/');
    }
});

router.get('/manager', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('manager');
    }
    else {
        res.redirect('/');
    }
});

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
