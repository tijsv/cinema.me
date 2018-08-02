const express = require('express');
const router = express.Router();
const axios = require('axios');
var api_key = "e13c2a215ac12da642ab41538b30e620";

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

router.get('/screen/:typeid', function(request, response) {
  if(!request.user) {
    console.log('You have to log in first');
    request.flash('error', 'You have to log in first');
    response.redirect('/');
  } else {
    let Id = request.params.typeid.match(/\d+/g).map(Number)[0].toString();
    let type = request.params.typeid.replace(/[0-9]/g, '');
    console.log(Id, type);
    let url = 'https://api.themoviedb.org/3/';
    if(type=="movie"){
      url += 'movie/' + Id + '?api_key=' + api_key + '&language=en-US';
    } else if(type=="tv"){
      url += 'tv/' + Id + '?api_key=' + api_key + '&language=en-US';
    }
    axios.get(url)
    .then(resp => {
      let result = resp.data;
      var poster = 'https://image.tmdb.org/t/p/w500';
      var title = "";
      var released = "";
      if(result.poster_path) {
        poster += result.poster_path;
      } else {
        poster = "https://m.media-amazon.com/images/M/MV5BYThkZTZlZWQtNjMzMy00NTlkLThhOTQtMTNiZTc2MTBlNzExXkEyXkFqcGdeQXVyNzI1MDI1NDU@._V1_SX300.jpg"
      }
      if(type=="movie"){
        title = result.title;
        released = result.release_date;
      } else if(type=="tv"){
        title = result.name;
        released = result.first_air_date;
      }
      var genreString = "";
      for(i=0;i<result.genres.length;i++){
        if(i==0){
          genreString += result.genres[i].name;
        } else{
          genreString += ', ' + result.genres[i].name;
        }
      }
      var plot = result.overview;
      response.render('./pages/screen.ejs', {
        title: title,
        poster: poster,
        genreString: genreString,
        released: released,
        type: type,
        plot: plot,
        Id: Id
      });
    })
    .catch(error => {
      console.log(error);
    });
  }
})

router.post('/screen/:typeid', function(request, response) {
  const Id = request.body.Id;
  const type = request.body.type;
  if(type != "movie" && type != "tv"){
    request.flash('error', 'You can only add a movie or a series to your list');
    response.redirect('/cinema/screen/'+type+Id);
    return;
  } else {
    let user = request.user;
    if(type == "movie"){
      if(!(user.cinema.movies.includes(Id))) {
        user.cinema.movies.push(Id);
      } else {
        request.flash('error', 'I\'ll be back... This movie is already in your list');
        response.redirect('/cinema/screen/'+type+Id);
        return;
      }
    } else if(type == "tv"){
      if(!(user.cinema.series.includes(Id))) {
        user.cinema.series.push(Id);
      } else {
        request.flash('error', 'I\'ll be back... This series is already in your list');
        response.redirect('/cinema/screen/'+type+Id);
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
        response.redirect('/cinema');
      }
    })
  }

})

module.exports = router;
