const queries = require('../db/queries.js');
const bcrypt = require("bcryptjs");
const passport = require('passport');
//const passport = require('passport');


function renderWithLayout(res, view, options = {}) {
  res.render(view, options, (err, html) => {
    if (err) throw err;
    res.render('layout', { ...options, body: html });
  });
}

exports.getHomePage = (req, res) => {
    renderWithLayout(res, 'pages/home', { title: 'Home', user: req.user });
}

exports.getSignUpPage = (req, res) => {
    renderWithLayout(res, 'pages/sign-up', { 
        title: 'Sign Up',
        messages: req.flash('error')
    });
}

exports.postSignUp = async (req, res, next) => {
  try {
     await queries.createUser(
      req.body.username,
      req.body.password,  // Send plain password, createUser will hash it
      req.body.name,
      req.body.surname,
      req.body.email
    );
    res.redirect('/');
  } catch (error) {
    return next(error);
  }
}

exports.postLogIn = (req, res, next) => {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    
    if (!user) { 
      req.flash('error', info.message);
      return res.redirect('/sign-up');
    }
    
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
};


exports.getLogOut = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
}