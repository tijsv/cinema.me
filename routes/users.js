const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// bring in models
let User = require('../models/user');

// register form
router.get('/register', function(request, response){
  response.render('register');
});

// register process
router.post('/register', function(request, response){
  const name = request.body.name;
  const email = request.body.email;
  const username = request.body.username;
  const password = request.body.password;
  const password2 = request.body.password2;
  request.checkBody('name', 'Name is required').notEmpty();
  request.checkBody('email', 'Email is required').notEmpty();
  request.checkBody('email', 'Email is not valid').isEmail();
  request.checkBody('username', 'Username is required').notEmpty();
  request.checkBody('password', 'Password is required').notEmpty();
  request.checkBody('password2', 'Passwords do not match').equals(request.body.password);
  let errors = request.validationErrors();
  if(errors){
    response.render('register', {
      errors:errors
    });
  } else {
    let newUser = new User({
      name:name,
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
});


// login form
router.get('/login', function(request, response){
  response.render('login.pug');
})

// login process
router.post('/login', function(request, response, next){
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(request, response, next);
})

// Logout
router.get('/logout', function(request,response){
  request.logout();
  request.flash('success', 'You are logged out');
  response.redirect('/users/login');
});

module.exports = router;
