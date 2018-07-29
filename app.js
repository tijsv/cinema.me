// Node.js & Express From Scratch (Part 6 done)

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/cinemame');
var db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
})

// Check for db errors
db.on('error', function(error) {
  console.log(error);
});

// init app
const app = express();

// bring in models
let Movie = require('./models/movie');

// load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// home route
app.get('/', function(request, response) {
  Movie.find({}, function(error, movies){
    if(error){
      console.log(error);
    } else {
      response.render('index.pug', {
        title: 'cinema.me',
        movies: movies
      });
    }
  });
});

// get single movie
app.get('/movie/:id', function(request, response){
  Movie.findById(request.params.id, function(error, movie) {
    response.render('movie.pug', {
      movie: movie
    });
  });
})

// add route
app.get('/movies/add', function(request, response) {
  response.render('add_movie.pug', {
    title: 'add movie'
  });
});

// add submit POST route
app.post('/movies/add', function(request, response){
  let movie = new Movie();
  movie.title = request.body.title;
  movie.author = request.body.author;
  movie.body = request.body.body;
  movie.save(function(error){
    if(error){
      console.log(error);
      return;
    } else {
      response.redirect('/');
    }
  });
})

// start server
app.listen(3000, function() {
  console.log('Server started on port 3000...');
})
