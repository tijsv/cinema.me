const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/tmdbapikey');
const api_key = process.env.TMDB_API_KEY || config.tmdbapikey;

// user model
let User = require('../models/user');

router.get('/', function(request, response) {
  if(!request.user) {
    console.log('You have to log in first');
    request.flash('error', 'You have to log in first');
    response.redirect('/');
  } else {
    let movieArray = [];
    var movieCounter = 0;
    let movieIdArray = request.user.cinema.movies;
    if(movieIdArray.length===0) {
      movieIdArray.push(17473);
    }
    for(i=0;i<movieIdArray.length;i++) {
      getResultById(movieIdArray[i], "movie", function(returnValue) {
        movieArray.push(returnValue);
        movieCounter++;
        if(movieCounter===movieIdArray.length) {
          let seriesArray = [];
          var seriesCounter = 0;
          let seriesIdArray = request.user.cinema.series;
          if(seriesIdArray.length===0) {
            seriesIdArray.push(1892);
          }
          for(i=0;i<seriesIdArray.length;i++) {
            getResultById(seriesIdArray[i], "tv", function(returnValue) {
              seriesArray.push(returnValue);
              seriesCounter++;
              if(seriesCounter===seriesIdArray.length) {
                response.render('./pages/cinema.ejs', {
                  movieArray: movieArray,
                  seriesArray: seriesArray
                });
              }
            });
          }
        }
      });
    }
  }
})

router.get('/search/:string', function(request, response){
  if(!request.user) {
    console.log('You have to log in first');
    request.flash('error', 'You have to log in first');
    response.redirect('/');
  }
  const searchText = request.params.string;
  // console.log(searchText);
  var url = 'https://api.themoviedb.org/3/search/multi?api_key=' + api_key + '&language=en-US&query=' + searchText + '&page=1&include_adult=false&append_to_response=external_ids';
  axios.get(url)
  .then(resp => {
    let results = resp.data.results;
    // console.log(results);
    let resultArray = [];
    for(i=0;i<results.length;i++){
      let result = results[i];
      var poster = 'https://image.tmdb.org/t/p/w500';
      var title = "";
      var id = result.id;
      var type = result.media_type;
      if(result.poster_path) {
        poster += result.poster_path;
      } else {
        poster = "https://m.media-amazon.com/images/M/MV5BYThkZTZlZWQtNjMzMy00NTlkLThhOTQtMTNiZTc2MTBlNzExXkEyXkFqcGdeQXVyNzI1MDI1NDU@._V1_SX300.jpg"
      }
      if(result.media_type=="movie"){
        title = result.title;
      } else if(result.media_type=="tv"){
        title = result.name;
      }
      array = [id, type, poster, title];
      resultArray.push(array);
    }
    response.render('./pages/search.ejs', {
      resultArray: resultArray
    });
  })
  .catch(error => {
    console.log(error);
  });
})

router.post('/search', function(request, response){
  if(!request.user) {
    console.log('You have to log in first');
    request.flash('error', 'You have to log in first');
    response.redirect('/');
  }
  response.redirect('/cinema/search/'+request.body.search);
})

router.get('/screen/:typeid', function(request, response) {
  if(!request.user) {
    console.log('You have to log in first');
    request.flash('error', 'You have to log in first');
    response.redirect('/');
  } else {
    let Id = request.params.typeid.match(/\d+/g).map(Number)[0].toString();
    let type = request.params.typeid.replace(/[0-9]/g, '');
    let url = 'https://api.themoviedb.org/3/';
    if(type=="movie"){
      url += 'movie/' + Id + '?api_key=' + api_key + '&language=en-US&append_to_response=videos';
    } else if(type=="tv"){
      url += 'tv/' + Id + '?api_key=' + api_key + '&language=en-US';
    }
    axios.get(url)
    .then(resp => {
      let result = resp.data;
      // console.log(result);
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
      var trailer = "https://www.youtube.com/watch?v=";
      if(type==="movie"){
        var notrailer = true;
        for(t=0;t<result.videos.results.length;t++){
          if(result.videos.results[t].type==="Trailer"){
            trailer += result.videos.results[t].key;
            notrailer = false;
            break;
          }
        }
        if(notrailer){
          if(result.videos.results.length>=1){
            trailer += result.videos.results[0].key;
          } else {
            trailer = "https://www.youtube.com/watch?v=tfMTHIwTUXA";
          }
        }
      }
      response.render('./pages/screen.ejs', {
        title: title,
        poster: poster,
        genreString: genreString,
        released: released,
        type: type,
        plot: plot,
        Id: Id,
        trailer: trailer
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
        request.flash('success', 'Successfully added to list');
        response.redirect('/cinema');
      }
    })
  }
})

router.post('/screen/:typeid/delete', function(request, response){
  if(!request.user._id){
    response.status(500).send();
  }
  let Id = request.body.Id;
  let type = request.body.type;
  let user = request.user;
  if(type==="tv"){
    user.cinema.series.remove(Id);
  } else if(type==="movie"){
    user.cinema.movies.remove(Id);
  }
  let query = {_id:request.user._id};
  // console.log('start updating user ...')
  User.update(query, user, function(error){
    if(error){
      console.log(error);
    } else {
      request.flash('success', 'Successfully removed from list');
      response.redirect('/cinema');
    }
  });
  // console.log('user updated');
})

function getResultById(Id, type, callback) {
  // console.log('getResultById started ...');
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
    if(result.poster_path) {
      poster += result.poster_path;
    } else {
      poster = "https://m.media-amazon.com/images/M/MV5BYThkZTZlZWQtNjMzMy00NTlkLThhOTQtMTNiZTc2MTBlNzExXkEyXkFqcGdeQXVyNzI1MDI1NDU@._V1_SX300.jpg"
    }
    if(type=="movie"){
      title = result.title;
    } else if(type=="tv"){
      title = result.name;
    }
    let array = [Id, type, poster, title];
    callback(array);
  })
  .catch(error => {
    console.log(error);
  });
}

module.exports = router;
