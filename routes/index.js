const express = require('express');
const router = express.Router();
const controllers = require('../controllers/controllers');

router.get('/', controllers.getHomePage);

router.get('/sign-up', controllers.getSignUpPage);

router.post('/sign-up', controllers.postSignUp);

router.post('/log-in', controllers.postLogIn);

router.get('/log-out', controllers.getLogOut);

module.exports = router;