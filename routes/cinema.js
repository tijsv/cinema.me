const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/tmdbapikey');
const api_key = process.env.TMDB_API_KEY || config.tmdbapikey;
// user model
let User = require('../models/user.js');
let Movie = require('../models/movie.js');
let Series = require('../models/series.js');

router.get('/', function(request, response) {
  if(!request.user) {
    console.log('You have to log in first');
    request.flash('error', 'You have to log in first');
    response.redirect('/');
  } else {
    let movieArray = [];
    let movieCounter = 0;
    let movieIdArray = request.user.cinema.movies;
    if(movieIdArray.length===0) {
      movieIdArray.push(17473); // The Room
    }
    let seriesArray = [];
    let seriesCounter = 0;
    let seriesIdArray = request.user.cinema.series;
    if(seriesIdArray.length===0) {
      seriesIdArray.push(1892); // The Fresh Prince of Bel-Air
    }
    for(i=0;i<movieIdArray.length;i++) {
      Movie.findOne({id:movieIdArray[i]}, function(error, movie) {
        if(error) { throw error }
        if(movie) {
          var resultArray = [movie.id, "movie", movie.poster, movie.title];
          movieArray.push(resultArray);
          movieCounter++;
          if(movieCounter===movieIdArray.length) {
            for(j=0;j<seriesIdArray.length;j++) {
              Series.findOne({id:seriesIdArray[j]}, function(error, series) {
                if(error) { throw error }
                if(series) {
                  var resultArray = [series.id, "tv", series.poster, series.title];
                  seriesArray.push(resultArray);
                  seriesCounter++;
                  if(seriesCounter===seriesIdArray.length) {
                    response.render('./pages/cinema.ejs', {
                      movieArray: movieArray,
                      seriesArray: seriesArray
                    });
                  }
                } else {
                  console.log('Impossible. If a series is in your list, it also got added to the series collection.');
                  request.flash('error', 'One or more of your listed series are not in the database. This should never happen. Contact the dev');
                  // response.redirect('/');
                }
              })
            }
          }
        } else {
          console.log('Impossible. If a movie is in your list, it also got added to the movies collection.');
          request.flash('error', 'One or more of your listed movies are not in the database. This should never happen. Contact the dev');
          // response.redirect('/');
        }
      })

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
    let id = request.params.typeid.match(/\d+/g).map(Number)[0].toString();
    let type = request.params.typeid.replace(/[0-9]/g, '');
    let total_score = "No score yet";
    let user_rating = "Not rated yet";
    let url = 'https://api.themoviedb.org/3/';
    if(type == "movie") {
      url += 'movie/' + id + '?api_key=' + api_key + '&language=en-US&append_to_response=videos';
      Movie.findOne({id: id}, function(error, movie) {
        if(error) throw error
        if(movie) {
          if(movie.scores.length !== 0) {
            for(i=0;i<movie.scores.length;i++) {
              if(movie.scores[i].user_id == request.user._id) {
                user_rating = 'Your rating:<br><span>' + movie.scores[i].score + '</span>';
              }
            }
            total_score = 'Total score:<br><span>' + Math.floor(parseFloat(movie.total_score)*10)/10 + '</span>';
          }
        }
      })
    } else if(type == "tv") {
      url += 'tv/' + id + '?api_key=' + api_key + '&language=en-US&append_to_response=videos,external_ids';
      Series.findOne({id: id}, function(error, series) {
        if(error) throw error
        if(series) {
          if(series.scores.length !== 0) {
            for(i=0;i<series.scores.length;i++) {
              if(series.scores[i].user_id == request.user._id) {
                user_rating = 'Your rating:<br><span>' + series.scores[i].score + '</span>';
              }
            }
            total_score = 'Total score:<br><span>' + Math.floor(parseFloat(series.total_score)*10)/10 + '</span>';
          }
        }
      })
    }
    axios.get(url)
    .then(resp => {
      let result = resp.data;
      // console.log(result);
      if(type=="movie") {
        var movieInfo = getMovie(result);
        // console.log(movieInfo);
        // [id, type, title, poster, backdrop, genres, genreString, release_date, status, imdb_id, plot, trailer]
        response.render('./pages/screen_movie.ejs', {
          id: movieInfo[0],
          type: movieInfo[1],
          title: movieInfo[2],
          poster: movieInfo[3],
          backdrop: movieInfo[4],
          genres: movieInfo[5],
          genreString: movieInfo[6],
          release_date: movieInfo[7],
          status: movieInfo[8],
          imdb_id: movieInfo[9],
          plot: movieInfo[10],
          trailer: movieInfo[11],
          total_score: total_score,
          user_rating: user_rating
        });
      } else if (type=="tv") {
        var seriesInfo = getSeries(result);
        // console.log(seriesInfo);
        // [id, type, title, poster, backdrop, genres, genreString, number_of_seasons, first_air_date, next_episode_to_air, status, imdb_id, plot, trailer]
        response.render('./pages/screen_series.ejs', {
          id: seriesInfo[0],
          type: seriesInfo[1],
          title: seriesInfo[2],
          poster: seriesInfo[3],
          backdrop: seriesInfo[4],
          genres: seriesInfo[5],
          genreString: seriesInfo[6],
          number_of_seasons: seriesInfo[7],
          first_air_date: seriesInfo[8],
          next_episode_to_air: seriesInfo[9],
          status: seriesInfo[10],
          imdb_id: seriesInfo[11],
          plot: seriesInfo[12],
          trailer: seriesInfo[13],
          total_score: total_score,
          user_rating: user_rating
        });
      }
    })
    .catch(error => {
      console.log(error);
    });
  }
})

router.post('/screen/:typeid', function(request, response) {
  const id = request.body.id;
  const type = request.body.type;
  let user = request.user;
  if(type != "movie" && type != "tv"){
    request.flash('error', 'You can only add a movie or a series to your list');
    response.redirect('/cinema/screen/'+type+id);
    return;
  } else {
    if(type == "movie") {
      const title = request.body.title;
      const poster = request.body.poster;
      const backdrop = request.body.backdrop;
      const genres = request.body.genres.split(',');
      const release_date = request.body.release_date;
      const status = request.body.status;
      const imdb_id = request.body.imdb_id;
      const query = {id:id};
      Movie.findOne(query, function(error, movie) {
        if(error) { throw error };
        // if no such movie in the db, add it
        if(!movie) {
          let newMovie = new Movie({
            id:id,
            scores:[],
            total_score:null,
            title:title,
            poster:poster,
            backdrop:backdrop,
            genres:genres,
            release_date:release_date,
            status:status,
            imdb_id:imdb_id
          });
          newMovie.save(function(error){
            if(error) { console.log(error); return;
            } else {
              console.log('First user to add this movie, so it got added to the database (collection: movies).');
            }
          })
        // if this movie is already in the database, update some information
        } else if(movie) {
          movie.title = title;
          movie.poster = poster;
          movie.backdrop = backdrop;
          movie.genres = genres;
          movie.release_date = release_date;
          movie.status = status;
          Movie.update(query, movie, function(error) {
            if(error) { console.log(error); return;
            } else {
              console.log('This movie was already in the database. Some data got updated.');
            }
          })
        }
      })
      // update the list of movies of this user
      if(!(user.cinema.movies.includes(id))) {
        user.cinema.movies.push(id);
      } else {
        request.flash('error', 'I\'ll be back... This movie is already in your list. (THIS SHOULD NEVER SHOW UP, CONTACT THE DEV)');
        response.redirect('/cinema/screen/'+type+id);
        return;
      }
    } else if(type == "tv") {
      const title = request.body.title;
      const poster = request.body.poster;
      const backdrop = request.body.backdrop;
      const genres = request.body.genres.split(',');
      const number_of_seasons = request.body.number_of_seasons;
      const first_air_date = request.body.first_air_date;
      const next_episode_to_air = request.body.next_episode_to_air;
      const status = request.body.status;
      const imdb_id = request.body.imdb_id;
      const query = {id:id};
      Series.findOne(query, function(error, series) {
        if(error) { throw error };
        // if no such movie in the db, add it
        if(!series) {
          let newSeries = new Series({
            id:id,
            scores:[],
            total_score:null,
            title:title,
            poster:poster,
            backdrop:backdrop,
            genres:genres,
            number_of_seasons:number_of_seasons,
            first_air_date:first_air_date,
            next_episode_to_air:next_episode_to_air,
            status:status,
            imdb_id:imdb_id
          });
          newSeries.save(function(error){
            if(error) { console.log(error); return;
            } else {
              console.log('First user to add this series, so it got added to the database (collection: series).');
            }
          })
        // if this series is already in the database, update some information
        } else if(series) {
          series.title = title;
          series.poster = poster;
          series.backdrop = backdrop;
          series.genres = genres;
          series.number_of_seasons = number_of_seasons;
          series.first_air_date = first_air_date;
          series.next_episode_to_air = next_episode_to_air;
          series.status = status;
          Series.update(query, series, function(error) {
            if(error) { console.log(error); return;
            } else {
              console.log('This series was already in the database. Some data got updated.');
            }
          })
        }
      })
      // update the list of series of this user
      if(!(user.cinema.series.includes(id))) {
        user.cinema.series.push(id);
      } else {
        request.flash('error', 'I\'ll be back... This series is already in your list. (THIS SHOULD NEVER SHOW UP, CONTACT THE DEV)');
        response.redirect('/cinema/screen/'+type+id);
        return;
      }
    }
    // update this user in the database and redirect
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
  let id = request.body.id;
  let type = request.body.type;
  let user = request.user;
  let type_id = type+id;
  if(type==="tv"){
    user.cinema.series.remove(id);
    Series.findOne({id: id}, function(error, series) {
      if(error) throw error
      if(series) {
        for(i=0;i<series.scores.length;i++) {
          if(series.scores[i].user_id == request.user._id) {
            if(series.scores.length === 1) {
              series.total_score = null;
            } else {
              series.total_score = series.total_score*series.scores.length;
              series.total_score = series.total_score - parseFloat(series.scores[i].score);
              series.total_score = series.total_score/(series.scores.length-1);
            }
            series.scores[i].remove();
            let query = {_id:series._id};
            Series.update(query, series, function(error){
              if(error){
                console.log(error);
              }
            });
          }
        }
      }
    })
  } else if(type==="movie"){
    user.cinema.movies.remove(id);
    Movie.findOne({id: id}, function(error, movie) {
      if(error) throw error
      if(movie) {
        for(i=0;i<movie.scores.length;i++) {
          if(movie.scores[i].user_id == request.user._id) {
            if(movie.scores.length === 1) {
              movie.total_score = null;
            } else {
              movie.total_score = movie.total_score*movie.scores.length;
              movie.total_score = movie.total_score - parseFloat(movie.scores[i].score);
              movie.total_score = movie.total_score/(movie.scores.length-1);
            }
            movie.scores[i].remove();
            let query = {_id:movie._id};
            Movie.update(query, movie, function(error){
              if(error){
                console.log(error);
              }
            });
          }
        }
      }
    })
  }
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
  const id = request.body.id;
  const type = request.body.type;
  const score = request.body.score;
  const type_id = type + id;
  if(type == "movie") {
    Movie.findOne({id: id}, function(error, movie) {
      if(error) throw error
      if(movie) {
        var isRatedByUser = false;
        for(i=0;i<movie.scores.length;i++) {
          if(movie.scores[i].user_id == request.user._id) {
            console.log('this user already rated this movie');
            movie.total_score = movie.total_score*movie.scores.length;
            movie.total_score = movie.total_score - parseFloat(movie.scores[i].score);
            movie.scores[i].score = score;
            movie.total_score = parseFloat(movie.total_score)+parseFloat(score);
            movie.total_score = movie.total_score/movie.scores.length;
            let query = {_id:movie._id};
            Movie.update(query, movie, function(error){
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
          let newRating = movie;
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
              request.flash('success', 'Thanks for rating this movie');
              response.redirect('/cinema/screen/'+type_id);
            }
          })
        }
      }
    })
  } else if(type == "tv") {
    Series.findOne({id: id}, function(error, series) {
      if(error) throw error
      if(series) {
        var isRatedByUser = false;
        for(i=0;i<series.scores.length;i++) {
          if(series.scores[i].user_id == request.user._id) {
            console.log('this user already rated this series');
            series.total_score = series.total_score*series.scores.length;
            series.total_score = series.total_score - parseFloat(series.scores[i].score);
            series.scores[i].score = score;
            series.total_score = parseFloat(series.total_score)+parseFloat(score);
            series.total_score = series.total_score/series.scores.length;
            let query = {_id:series._id};
            Series.update(query, series, function(error){
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
          let newRating = series;
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
              request.flash('success', 'Thanks for rating this series');
              response.redirect('/cinema/screen/'+type_id);
            }
          })
        }
      }
    })
  }
})

function getSeries(series) {
  var id = series.id.toString();
  var type = "tv";
  var title = series.name;
  var poster = 'https://image.tmdb.org/t/p/w500';
  if(series.poster_path) {
    poster += series.poster_path;
  } else {
    poster = "https://m.media-amazon.com/images/M/MV5BYThkZTZlZWQtNjMzMy00NTlkLThhOTQtMTNiZTc2MTBlNzExXkEyXkFqcGdeQXVyNzI1MDI1NDU@._V1_SX300.jpg"
  }
  var backdrop = 'https://image.tmdb.org/t/p/original';
  if(series.backdrop_path) {
    backdrop += series.backdrop_path;
  } else {
    backdrop += '/mX7mlE1kaGohnSVDMSTlrvisYf7.jpg';
  }
  var genres = [];
  for(i=0;i<series.genres.length;i++) {
    var splitGenres = [];
    if(series.genres[i].name.indexOf('&')>=0) {
      splitGenres = series.genres[i].name.split(' & ');
      genres = genres.concat(splitGenres);
    } else {
      genres.push(series.genres[i].name);
    }
  }
  for(i=0;i<genres.length;i++) {
    for(j=0;j<genres.length;j++) {
      if(genres[i] == genres[j] && i!==j) {
        genres.splice(i, 1);
      }
    }
  }
  var genreString = "";
  for(i=0;i<genres.length;i++) {
    if(i===0) {
      genreString += genres[i];
    } else {
      genreString += ", " + genres[i];
    }
  }
  var number_of_seasons = series.number_of_seasons;
  var first_air_date = series.first_air_date;
  var next_episode_to_air = series.next_episode_to_air;
  var status = series.status;
  var imdb_id = series.external_ids.imdb_id;
  var plot = series.overview;
  var trailer = "";
  var trailer = "https://www.youtube.com/watch?v=";
  var notrailer = true;
  for(t=0;t<series.videos.results.length;t++){
    if(series.videos.results[t].type==="Trailer"){
      trailer += series.videos.results[t].key;
      notrailer = false;
      break;
    }
  }
  if(notrailer){
    if(series.videos.results.length>=1){
      trailer += series.videos.results[0].key;
    } else {
      trailer = "https://www.youtube.com/watch?v=tfMTHIwTUXA";
    }
  }
  var arrayToReturn = [id, type, title, poster, backdrop, genres, genreString, number_of_seasons, first_air_date, next_episode_to_air, status, imdb_id, plot, trailer];
  return arrayToReturn;
}

function getMovie(movie) {
  var id = movie.id.toString();
  var type = "movie";
  var title = movie.title;
  var poster = 'https://image.tmdb.org/t/p/w500';
  if(movie.poster_path) {
    poster += movie.poster_path;
  } else {
    poster = "https://m.media-amazon.com/images/M/MV5BYThkZTZlZWQtNjMzMy00NTlkLThhOTQtMTNiZTc2MTBlNzExXkEyXkFqcGdeQXVyNzI1MDI1NDU@._V1_SX300.jpg"
  }
  var backdrop = 'https://image.tmdb.org/t/p/original';
  if(movie.backdrop_path) {
    backdrop += movie.backdrop_path;
  } else {
    backdrop += '/mX7mlE1kaGohnSVDMSTlrvisYf7.jpg';
  }
  var genres = [];
  for(i=0;i<movie.genres.length;i++) {
    var splitGenres = [];
    if(movie.genres[i].name.indexOf('&')>=0) {
      splitGenres = movie.genres[i].name.split(' & ');
      genres = genres.concat(splitGenres);
    } else {
      genres.push(movie.genres[i].name);
    }
  }
  for(i=0;i<genres.length;i++) {
    for(j=0;j<genres.length;j++) {
      if(genres[i] == genres[j] && i!==j) {
        genres.splice(i, 1);
      }
    }
  }
  var genreString = "";
  for(i=0;i<genres.length;i++) {
    if(i===0) {
      genreString += genres[i];
    } else {
      genreString += ", " + genres[i];
    }
  }
  var release_date = movie.release_date;
  var status = movie.status;
  var imdb_id = movie.imdb_id;
  var plot = movie.overview;
  var trailer = "https://www.youtube.com/watch?v=";
  var notrailer = true;
  for(t=0;t<movie.videos.results.length;t++){
    if(movie.videos.results[t].type==="Trailer"){
      trailer += movie.videos.results[t].key;
      notrailer = false;
      break;
    }
  }
  if(notrailer){
    if(movie.videos.results.length>=1){
      trailer += movie.videos.results[0].key;
    } else {
      trailer = "https://www.youtube.com/watch?v=tfMTHIwTUXA";
    }
  }
  var arrayToReturn = [id, type, title, poster, backdrop, genres, genreString, release_date, status, imdb_id, plot, trailer];
  return arrayToReturn;
}

module.exports = router;
