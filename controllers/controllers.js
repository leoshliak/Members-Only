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

exports.getHomePage = async (req, res) => {
  try {
    const messages = await queries.getMessages();
    renderWithLayout(res, 'pages/home', { title: 'Home', user: req.user, messages: messages });
  } catch (error) {
    console.error('Error rendering home page:', error);
    res.status(500).send('Internal Server Error');
  }
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

exports.getNewMessagePage = (req, res) => {
  renderWithLayout(res, 'pages/new-message', {
    title: 'New Message',
    user: req.user
  });
}

exports.postNewMessage = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.redirect('/log-in');
    }

    const  title = req.body.title;
    const text = req.body.content;
    const dateAndTime = new Date();
    const writtenBy = req.user.username;
    const userId = req.user.id;

    await queries.addMessage(userId, title, text, dateAndTime, writtenBy);
    res.redirect('/'); // Redirect to home after adding message
  } catch (error) {
    console.error('Error adding message:', error);
    return next(error);
  }
}

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await queries.getMessages();
    renderWithLayout(res, 'pages/messages', {
      title: 'Messages',
      messages: messages,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return next(error);
  }
}

exports.getProfilePage = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await queries.getUserById(userId);
    const userMessages = await queries.getUserMessages(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    renderWithLayout(res, 'pages/profile', {
      title: 'Profile',
      user: user,
      currentUser: req.user,
      messages: userMessages,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return next(error);
  }
}

exports.updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id; // Get ID from URL parameter
    if (userId != req.user.id) {
      return res.status(403).send('Unauthorized');
    }
    
    const { username, first_name, last_name, email } = req.body;
    console.log('Updating profile with data:', req.body);

    await queries.updateUserData(userId, username, first_name, last_name, email);
    req.flash('success', 'Profile updated successfully');
    res.redirect(`/profile/${userId}`);
  } catch (error) {
    console.error('Error updating user profile:', error);
    req.flash('error', 'Error updating profile');
    return next(error);
  }
}

exports.deleteMessageAdmin = async (req, res, next) => {
  try {
    const messageId = req.params.id; 
    if (!req.user || !req.user.admin) {
      return res.status(403).send('Unauthorized');
    }
    await queries.deleteMessage(messageId);
    req.flash('success', 'Message deleted successfully');
    res.redirect('/messages'); 
  } catch (error) {
    console.error('Error deleting message:', error);
    req.flash('error', 'Error deleting message');
    return next(error);
  }
}

exports.deleteMessageOwn = async (req, res, next) => {
  try {
    const messageId = req.params.id; 
    const message = await queries.getMessageById(messageId);
    
    console.log('User ID:', req.user.id);
    console.log('Message written by ID:', message.written_by_id);
    console.log('Deleting message with ID:', messageId);
    
    if (parseInt(req.user.id) !== parseInt(message.written_by_id)) {
      return res.status(403).send('Not your message');
    }
    
    await queries.deleteMessage(messageId);
    req.flash('success', 'Message deleted successfully');
    res.redirect('/profile/' + req.user.id); 
  } catch (error) {
    console.error('Error deleting message:', error);
    req.flash('error', 'Error deleting message');
    return next(error);
  }
}