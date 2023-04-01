const express = require("express");
require('dotenv').config();
const port = process.env.port;

const passport = require('passport');
const {check, validationResult} = require('express-validator');
var login_validate = [check('username', 'Username must be an email').isEmail()];
const session = require('express-session');
const ensure_login = require('connect-ensure-login');
const {v4 : uuidv4} = require('uuid');

// require('routes.js')(app);
const app = express();
app.use(express.static('public'));

const body_parser = require('body-parser');
app.use(passport.initialize());
app.use(body_parser.urlencoded({extended: false}));
app.use(session({
    genid: function(req) {
        return uuidv4();
    },
    secret: '29842asSAFW@#$Afsfa3@$!',
    resave: false,
    saveUninitialized: true,
    cookie : {maxAge: 60 * 60 * 1000}
}));
app.use(passport.authenticate('session'));

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

app.get('/login', passport.authenticate('google'));
app.get('/oauth2/redirect/google',
    passport.authenticate('google', { failureRedirect: '/', failureMessage: true }),
    (req, res) => {
        res.redirect('/redirect');
    }
);

app.get('/', (req, res) => {
    console.log('home screen');
    if (req.isAuthenticated()) {
        res.redirect('/redirect');
    }
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/redirect', (req, res) => {
    console.log('redirect screen');
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + '/public/redirect.html');
    }
    else {
        res.redirect('/');
    }
});

app.get('/menu_board', (req, res) => {
    console.log('menu_board');
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + '/public/menu_board.html');
    }
    else {
        res.redirect('/');
    }
});

app.post('/logout', function(req, res, next){
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
app.listen(port, () => console.log(`Listening on ${port}`));

