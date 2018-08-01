const express = require('express');
const router = express.Router();

// user model
let User = require('../models/user');

router.get('/', function(request, response) {
  if(!request.user) {
    console.log('You have to log in first');
    request.flash('error', 'You have to log in first');
    response.redirect('/');
  } else {
    response.render('./pages/cinema.ejs');
  }
})

router.get('/my_screen', function(request, response) {
  if(!request.user) {
    console.log('You have to log in first');
    request.flash('error', 'You have to log in first');
    response.redirect('/');
  } else {
    response.render('./pages/my_screen.ejs');
  }
})

router.post('/my_screen', function(request, response) {
  const Id = request.body.Id;
  const type = request.body.type;
  if(type == "episode"){
    request.flash('error', 'You cannot add one episode to your list. Select your favorite series instead!');
    response.redirect('my_screen');
    return;
  } else {
    let user = request.user;
    if(type == "movie"){
      if(!(user.cinema.movies.includes(Id))) {
        user.cinema.movies.push(Id);
      } else {
        request.flash('error', 'I\'ll be back... This movie is already in your list');
        response.redirect('my_screen');
        return;
      }
    } else if(type == "series"){
      if(!(user.cinema.series.includes(Id))) {
        user.cinema.series.push(Id);
      } else {
        request.flash('error', 'I\'ll be back... This series is already in your list');
        response.redirect('my_screen');
        return;
      }
    }
    let query = {_id:request.user._id}
    User.update(query, user, function(error){
      if(error){
        console.log(error);
        return;
      } else {
        request.flash('success', 'Successfully added');
        response.redirect('my_screen');
      }
    })
  }

})

module.exports = router;
