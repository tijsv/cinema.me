const express = require('express');
const router = express.Router();

// article model
let Movie = require('../models/movie');
// user model
let User = require('../models/user');

// add route
router.get('/add', ensureAuthenticated, function(request, response) {
  response.render('add_movie.pug', {
    title: 'Add Movie'
  });
});

// add submit POST route
router.post('/add', function(request, response){
  request.checkBody('title','Title is required').notEmpty(); // with express-validator
  // request.checkBody('author','Author is required').notEmpty(); // with express-validator
  request.checkBody('body','Body is required').notEmpty(); // with express-validator

  // get errors
  let errors = request.validationErrors();
  if(errors){
    response.render('add_movie', {
      title:'Add Movie',
      errors: errors
    });
  } else{
    let movie = new Movie();
    movie.title = request.body.title;
    movie.author = request.user._id;
    movie.body = request.body.body;
    movie.save(function(error){
      if(error){
        console.log(error);
        return;
      } else {
        request.flash('success','Movie Added');
        response.redirect('/');
      }
    });
  }
})

// load edit form
router.get('/edit/:id', ensureAuthenticated, function(request, response){
  Movie.findById(request.params.id, function(error, movie) {
    if(movie.author != request.user._id) {
      request.flash('danger', 'Not Authorized to edit');
      response.redirect('/');
    } else {
      response.render('edit_movie.pug', {
        title:'Edit movie',
        movie: movie
      });
    }
  });
})

// update submit POST route
router.post('/edit/:id', function(request, response){
  let movie = {};
  movie.title = request.body.title;
  movie.author = request.body.author;
  movie.body = request.body.body;

  let query = {_id:request.params.id}
  Movie.update(query, movie, function(error){
    if(error){
      console.log(error);
      return;
    } else {
      request.flash('success', 'Movie Updated');
      response.redirect('/');
    }
  });
})

router.delete('/:id', function(request, response){
  if(!request.user._id){
    response.status(500).send();
  }
  let query = {_id:request.params.id}
  Movie.findById(request.params.id, function(error, movie){
    if(movie.author != request.user._id){
      response.status(500).send();
    } else {
      Movie.remove(query, function(error){
        if(error){
          console.log(error);
        }
        response.send('Succes');
      })
    }
  })  
});

// get single movie
router.get('/:id', function(request, response){
  Movie.findById(request.params.id, function(error, movie) {
    User.findById(movie.author, function(error, user){
      response.render('movie.pug', {
        movie: movie,
        author: user.username
      });
    });
  });
})

// access control
function ensureAuthenticated(request, response, next){
  if(request.isAuthenticated()){
    return next();
  } else {
    request.flash('danger', 'Please login first');
    response.redirect('/users/login');
  }
}

module.exports = router;
