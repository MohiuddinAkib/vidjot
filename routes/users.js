const express = require('express'),
  router = express.Router(),
  userDebug = require('debug')('app:user routes'),
  User = require('../models/User'),
  registerUserValidation = require('../validations/register-user-validation'),
  loginUserValidation = require('../validations/login-user-validation'),
  passport = require('passport');

// User login route
router.get('/login', (req, res) => {
  res.render('users/login', {
    page_title: 'Login',
    loginPage: true
  });
});

// User register route
router.get('/register', (req, res) => {
  res.render('users/register', {
    page_title: 'Register',
    registerPage: true
  });
});

// Store user
router.post('/register', (req, res) => {
  // Validate input
  const { errors, isValid, values } = registerUserValidation(req.body);
  if (!isValid) {
    const { name, email, password, password_confirmation } = req.body;
    res.render('users/register', {
      page_title: 'Register',
      registerPage: true,
      errors,
      name,
      email,
      password,
      password_confirmation
    });
  } else {
    // Extract keys
    const { name, email, password } = values;
    // Check if user alredy exists
    User.findOne({ email })
      .exec()
      .then(user => {
        if (user) {
          req.flash('error_msg', 'User already exists');
          res.redirect('/users/register');
        } else {
          //  Init user
          const user = new User({ name, email, password });
          // Hash password
          user.hashPassword(() => {
            user
              .save()
              .then(() => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => userDebug('User registration error', err));
          });
        }
      })
      .catch(err =>
        userDebug('Fetching user to check if email already exists error', err)
      );
  }
});

// Sign in user
router.post('/login', (req, res, next) => {
  // Validate input
  const { errors, isValid } = loginUserValidation(req.body);
  if (!isValid) {
    const { email, password } = req.body;
    res.render('users/login', {
      page_title: 'Login',
      loginPage: true,
      errors,
      email,
      password
    });
  } else {
    passport.authenticate('local', {
      successRedirect: '/ideas',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  }
});

// Sign out user
router.get('/logout', (req, res) => {
  req.logOut();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
