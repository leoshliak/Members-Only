const express = require('express');
const router = express.Router();
const controllers = require('../controllers/controllers');

router.get('/', controllers.getHomePage);

router.get('/sign-up', controllers.getSignUpPage);

router.post('/sign-up', controllers.postSignUp);

router.get('/log-in', controllers.getLogInPage);

router.post('/log-in', controllers.postLogIn);

router.get('/log-out', controllers.getLogOut);

router.get('/membership', controllers.getMembershipPage);

router.post('/membership', controllers.postMembership);

router.get('/new-message', controllers.getNewMessagePage);

router.post('/new-message', controllers.postNewMessage);

router.get('/messages', controllers.getMessages);

router.get('/profile/:id', controllers.getProfilePage);

router.post('/profile/:id', controllers.updateUserProfile);

module.exports = router;