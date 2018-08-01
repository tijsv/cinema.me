const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// bring in model
let User = require('../models/user.js');

router.get('/login', function(request, response) {
  if(request.user) {
    console.log('You are already logged in');
    request.flash('error', 'You are already logged in.');
    response.redirect('/');
  } else {
    response.render('./pages/login.ejs');
  }
})

router.get('/register', function(request, response) {
  if(request.user) {
    console.log('You are already logged in. Log out first to register a new account');
    request.flash('error', 'You are already logged in. Log out first to register a new account.');
    response.redirect('/');
  } else {
    response.render('./pages/register.ejs');
  }
})

// Logout
router.get('/logout', function(request,response){
  request.logout();
  request.flash('success', 'You are logged out.');
  response.redirect('/');
});

// register process
router.post('/register', function(request, response){
  const email = request.body.email;
  const username = request.body.username;
  const password = request.body.password;
  const password2 = request.body.password2;
  request.checkBody('email', 'Email is required').notEmpty();
  request.checkBody('email', 'Email is not valid').isEmail();
  request.checkBody('username', 'Username is required').notEmpty();
  request.checkBody('password', 'Password is required').notEmpty();
  request.checkBody('password2', 'Passwords do not match').equals(request.body.password);
  let errors = request.validationErrors();
  if(errors){
    response.render('pages/register', {
      errors:errors
    });
  } else {
    User.findOne({email: email}, function(error, user) {
      if(error) throw error
      if(user) {
        console.log('email in use');
        request.flash('error', "This email is already in use.");
        response.render('pages/register');
      } else {
        User.findOne({username: username}, function(error, user) {
          if(error) throw error
          if(user) {
            console.log('username in use');
            request.flash('error', "This username is already in use.");
            response.render('pages/register');
          } else {
            let newUser = new User({
              email:email,
              username:username,
              password:password
            });
            bcrypt.genSalt(10, function(error, salt){
              bcrypt.hash(newUser.password, salt, function(error, hash){
                if(error){
                  console.log(error);
                }
                newUser.password = hash;
                newUser.save(function(error){
                  if(error){
                    console.log(error);
                    return;
                  } else {
                    request.flash('success', 'You are now registered and can log in');
                    response.redirect('/users/login');
                  }
                })
              });
            })
          }
        })
      }
    })
  }
});

// login process
router.post('/login', function(request, response, next){
  passport.authenticate('local', {
    successRedirect: '/cinema',
    failureRedirect: '/users/login',
    failureFlash: true
  })(request, response, next);
})

module.exports = router;
