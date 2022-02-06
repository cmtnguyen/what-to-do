const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const users = require('../controllers/users');

router.route('/signup')
    .get(users.renderSignUp)
    .post(wrapAsync(users.signUpUser))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser)

router.get('/logout', users.logoutUser)

module.exports = router;