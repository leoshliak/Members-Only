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
        messages: req.flash('error'),
        user: req.user
    });
}

exports.getLogInPage = (req, res) => {
    renderWithLayout(res, 'pages/log-in', {}, {
        title: 'Log In' } );
  }

  exports.getMembershipPage = (req, res) => {
    renderWithLayout(res, 'pages/membership', {
        title: 'Membership',
        user: req.user
    })
  }

exports.postMembership = async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.redirect('/log-in');
        }

        // Validate that user typed "*"
        const memberInput = req.body['member-input'];
        if (memberInput !== '*') {
            req.flash('error', 'You must type "*" to become a member!');
            return res.redirect('/membership');
        }

        const userId = req.user.id; 
        console.log('Changing membership status for user ID:', userId);
        await queries.changeMembershipStatus(userId, true);
        res.redirect('/'); // Redirect to home after updating
    } catch (error) {
        console.error('Error changing membership status:', error);
        return next(error);
    }
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