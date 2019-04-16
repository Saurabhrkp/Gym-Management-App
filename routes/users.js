/* eslint-disable new-cap */
const express = require('express');
const router = express.Router();
const passport = require('passport');

// Load User model
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/catalog',
    failureRedirect: '/users/login',
    // failureFlash: true,
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  // req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;