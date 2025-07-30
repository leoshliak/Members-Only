const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const pool = require('./db/pool.js');
require('dotenv').config();
const passport = require('passport');
const queries = require('./db/queries.js');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcryptjs");

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

app.use(session({
    store: new (require('connect-pg-simple')(session))({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true
    }),

    secret: process.env.FOO_COOKIE_SECRET || 'some secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 } // 2 weeks
}));

const flash = require('connect-flash');
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log('Attempting login for username:', username);
      const user = await queries.getUserByName(username);
      
      if (!user) {
        console.log('User not found');
        return done(null, false, { message: 'Incorrect username.' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(password, user.password);

      console.log('Password match:', isMatch);

      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      console.log('Login successful');
      return done(null, user);
    } catch (error) {
      console.error('Login error:', error);
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser( async (id, done) => {
    try {
        const user = await queries.getUserById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
})

const routes = require('./routes/index');
app.use('/', routes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})