const express = require("express");
require('dotenv').config();

const passport = require('passport');
const session = require('express-session');
const {v4 : uuidv4} = require('uuid');
const path = require('path');

const router = express.Router();

const body_parser = require('body-parser');
router.use(passport.initialize());
router.use(body_parser.urlencoded({extended: false}));
router.use(session({
    genid: function(req) {
        return uuidv4();
    },
    secret: '29842asSAFW@#$Afsfa3@$!',
    resave: false,
    saveUninitialized: true,
    cookie : {maxAge: 60 * 60 * 1000}
}));
router.use(passport.authenticate('session'));

var GoogleStrategy = require('passport-google-oauth20');

passport.use(new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: 'http://localhost:3000/oauth2/redirect/google',
    scope: [ 'profile' ],
    state: true
  },
    function verify(accessToken, refreshToken, profile, cb) {
        return cb(null, {name: profile.displayName});
    }
));

router.get('/login', passport.authenticate('google'));
router.get('/oauth2/redirect/google',
    passport.authenticate('google', { failureRedirect: '/', failureMessage: true }),
    (req, res) => {
        res.redirect('/redirect');
    }
);

router.get('/', (req, res) => {
    console.log('home screen');
    if (req.isAuthenticated()) {
        res.redirect('/redirect');
    }
    res.sendFile(path.normalize(__dirname + '/../views/index.html'));
});

router.get('/redirect', (req, res) => {
    console.log('redirect screen');
    if (req.isAuthenticated()) {
        res.sendFile(path.normalize(__dirname + '/../views/redirect.html'));
    }
    else {
        res.redirect('/');
    }
});

router.get('/menu_board', (req, res) => {
    console.log('menu_board');
    if (req.isAuthenticated()) {
        res.sendFile(path.normalize(__dirname + '/../views/menu_board.html'));
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
        cb(null, JSON.stringify(user));  //{ id: user.id, username: user.username, name: user.name }
    });
});
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, JSON.parse(user));
    });
});


module.exports = router
