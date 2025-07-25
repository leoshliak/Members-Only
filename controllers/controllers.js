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
    renderWithLayout(res, 'pages/sign-up', { title: 'Sign Up' });
}

exports.postSignUp = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
     await queries.createUser(
      req.body.username,
      hashedPassword,
      req.body.name,
      req.body.surname,
      req.body.email
    );
    res.redirect('/');
  } catch (error) {
    return next(error);
  }
}

exports.postLogIn = (req, res) => {
  return passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/sign-up',
    failureFlash: true
  });
}


exports.getLogOut = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
}