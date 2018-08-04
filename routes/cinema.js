const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/tmdbapikey');
const api_key = process.env.TMDB_API_KEY || config.tmdbapikey;
// user model
let User = require('../models/user');
let Rating = require('../models/rating.js');

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
      movieIdArray.push(17473); // the room
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
  var url = 'https://api.themoviedb.org/3/search/multi?api_key=' + api_key + '&language=en-US&query=' + searchText + '&page=1&include_adult=false&append_to_response=external_ids';
  axios.get(url)
  .then(resp => {
    let results = resp.data.results;
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
    let total_score = "No score yet";
    let user_rating = "Not rated yet";
    Rating.findOne({type_id: request.params.typeid}, function(error, rating) {
      if(error) throw error
      if(rating) {
        for(i=0;i<rating.scores.length;i++) {
          if(rating.scores[i].user_id == request.user._id) {
            user_rating = 'Your rating:<br><span>' + rating.scores[i].score + '</span>';
          }
        }
        total_score = 'Total score:<br><span>' + rating.total_score + '</span>';
      }
    })
    let url = 'https://api.themoviedb.org/3/';
    if(type=="movie"){
      url += 'movie/' + Id + '?api_key=' + api_key + '&language=en-US&append_to_response=videos';
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
        trailer: trailer,
        total_score: total_score,
        user_rating: user_rating
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
  let type_id = type+Id;
  if(type==="tv"){
    user.cinema.series.remove(Id);
  } else if(type==="movie"){
    user.cinema.movies.remove(Id);
  }
  Rating.findOne({type_id: type_id}, function(error, rating) {
    if(error) throw error
    if(rating) {
      for(i=0;i<rating.scores.length;i++) {
        if(rating.scores[i].user_id == request.user._id) {
          rating.total_score = rating.total_score*rating.scores.length;
          rating.total_score = rating.total_score - parseFloat(rating.scores[i].score);
          rating.total_score = rating.total_score/(rating.scores.length-1);
          rating.scores[i].remove();
          let query = {_id:rating._id};
          if(rating.scores.length==0){
            Rating.findByIdAndRemove(query, function(error){
              if(error){
                console.log(error);
              }
            });
          } else {
            Rating.update(query, rating, function(error){
              if(error){
                console.log(error);
              }
            });
          }
        }
      }
    }
  })
  let query = {_id:request.user._id};
  User.update(query, user, function(error){
    if(error){
      console.log(error);
    } else {
      request.flash('success', 'Successfully removed from list');
      response.redirect('/cinema');
    }
  });
})

router.post('/screen/:typeid/rating', function(request, response){
  if(!request.user._id){
    response.status(500).send();
  }
  const Id = request.body.Id;
  const type = request.body.type;
  const score = request.body.score;
  const type_id = type + Id;
  Rating.findOne({type_id: type_id}, function(error, rating) {
    if(error) throw error
    if(rating) {
      console.log('already a rating for this item');
      var isRatedByUser = false;
      for(i=0;i<rating.scores.length;i++) {
        if(rating.scores[i].user_id == request.user._id) {
          console.log('this user already rated this item');
          rating.total_score = rating.total_score*rating.scores.length;
          rating.total_score = rating.total_score - parseFloat(rating.scores[i].score);
          rating.scores[i].score = score;
          rating.total_score = parseFloat(rating.total_score)+parseFloat(score);
          rating.total_score = rating.total_score/rating.scores.length;
          let query = {_id:rating._id};
          Rating.update(query, rating, function(error){
            if(error){
              console.log(error);
            } else {
              request.flash('success', 'This was already rated by you. We changed your score regardless.');
              response.redirect('/cinema/screen/'+type_id);
            }
          });
          isRatedByUser = true;
        }
      }
      if(!isRatedByUser){
        let newRating = rating;
        newRating.scores.push({
          user_id: request.user._id,
          score: score,
        })
        newRating.total_score = newRating.total_score*(newRating.scores.length-1);
        newRating.total_score = parseFloat(newRating.total_score)+parseFloat(score);
        newRating.total_score = newRating.total_score/newRating.scores.length;
        newRating.save(function(error){
          if(error){
            console.log(error);
            return;
          } else {
            request.flash('success', 'Thanks for rating this item');
            response.redirect('/cinema/screen/'+type_id);
          }
        })
      }
    } else {
      console.log('no rating yet for this item');
      let newRating = new Rating({
        type_id:type_id,
        scores:[
          {
            user_id: request.user._id,
            score: score
          }
        ],
        total_score: score
      });
      newRating.save(function(error){
        if(error){
          console.log(error);
          return;
        } else {
          request.flash('success', 'Thank you for rating this item');
          response.redirect('/cinema/screen/'+type_id);
        }
      })
    }
  })

})

function getResultById(Id, type, callback) {
  let url = 'https://api.themoviedb.org/3/';
  if(type=="movie"){
    url += 'movie/' + Id + '?api_key=' + api_key + '&language=en-US';
  } else if(type=="tv"){
    url += 'tv/' + Id + '?api_key=' + api_key + '&language=en-US';
  }
  axios.get(url)
  .then(resp => {
    let result = resp.data;
    // console.log(result);
    var poster = 'https://image.tmdb.org/t/p/w300';
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
