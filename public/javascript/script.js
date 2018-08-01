$(document).ready(function(){
  // script for search function
  $('#searchForm').on('submit', function(e){
    let searchText = $('#searchText').val()
    getMovies(searchText);
    e.preventDefault();
  });

  // make h1 in header clickable
  $('#header-logo').on('click', function(){
    window.location.href = "/";
  });

  // get movie when on the my_screen page
  if(window.location.pathname === '/cinema/my_screen') {
    getMovie();
  }

  // show movies when on
  if(window.location.pathname === '/cinema') {
    let allMovies = document.getElementsByClassName('movie');
    let allSeries = document.getElementsByClassName('series');
    for(i=0;i<allMovies.length;i++) {
      getMovieById(allMovies[i]);
    }
    for(i=0;i<allSeries.length;i++) {
      getSeriesById(allSeries[i]);
    }
  }

});

function movieSelected(id) {
  sessionStorage.setItem('movieId', id);
  window.location = 'cinema/my_screen';
  return false;
}

function getMovies(searchText){
  console.log('getMovies started ...');
  axios.get('http://www.omdbapi.com?s=' + searchText + '&apikey=6ce0a5e8')
  .then(function(response){
    let movies = response.data.Search;
    let output = "";
    $.each(movies, function(index, movie){
      var moviePoster = movie.Poster;
      if (moviePoster=="N/A") { moviePoster = "https://m.media-amazon.com/images/M/MV5BYThkZTZlZWQtNjMzMy00NTlkLThhOTQtMTNiZTc2MTBlNzExXkEyXkFqcGdeQXVyNzI1MDI1NDU@._V1_SX300.jpg" };
      output += `
        <div class="movie-item" onclick="movieSelected('${movie.imdbID}')">
          <img src="${moviePoster}">
          <div class="text">
            <h5>${movie.Title}</h5>
            <a onclick="movieSelected('${movie.imdbID}')" class="add" href="#">Add ${movie.Type}</a>
          </div>
        </div>
      `;
    });
    $('#movies').html(output);
  })
  .catch(function(error){
    console.log(error);
  })
}

function getMovie(){
  let movieId = sessionStorage.getItem('movieId');
  axios.get('http://www.omdbapi.com?i=' + movieId + '&apikey=6ce0a5e8')
  .then(function(response){
    console.log(response);
    let movie = response.data;
    var moviePoster = movie.Poster;
    if (moviePoster=="N/A") { moviePoster = "https://m.media-amazon.com/images/M/MV5BYThkZTZlZWQtNjMzMy00NTlkLThhOTQtMTNiZTc2MTBlNzExXkEyXkFqcGdeQXVyNzI1MDI1NDU@._V1_SX300.jpg" };
    let output = `
      <div class="my-screen">
        <img src="${moviePoster}">
        <div class="text">
          <p class="title">${movie.Title}</p>
          <p class="genre">${movie.Genre}</p>
          <p class="plot">${movie.Plot}</p>
          <p class="director"><span>Director:</span> ${movie.Director}</p>
          <p class="writer"><span>Writer:</span> ${movie.Writer}</p>
          <p class="imdbrating"><span>imdbRating:</span> ${movie.imdbRating}</p>
          <p class="released"><span>Released:</span> ${movie.Released}</p>
          <p class="type"><span>Type:</span> ${movie.Type}</p>
          <form method="POST" action="/cinema/my_screen">
            <input type="hidden" name="Id" value="${movieId}"/>
            <input type="hidden" name="type" value="${movie.Type}"/>
            <input class="submit" type="submit" value="Add ${movie.Type}"/>
          </form>
        </div>
      </div>
    `;
    $('#movie').html(output);
  })
  .catch(function(error){
    console.log(error);
  })
}

function getMovieById(movieObject){
  let thisId = movieObject.dataset.id;
  axios.get('http://www.omdbapi.com?i=' + thisId + '&apikey=6ce0a5e8')
  .then(function(response){
    let movie = response.data;
    var moviePoster = movie.Poster;
    if (moviePoster=="N/A") { moviePoster = "https://m.media-amazon.com/images/M/MV5BYThkZTZlZWQtNjMzMy00NTlkLThhOTQtMTNiZTc2MTBlNzExXkEyXkFqcGdeQXVyNzI1MDI1NDU@._V1_SX300.jpg" };
    let output = `
    <div class="user-item">
      <img src="${moviePoster}">
      <div class="text">
        <h5>${movie.Title}</h5>
        <a onclick="movieSelected('${movie.imdbID}')" class="details" href="#">Movie details</a>
      </div>
    </div>
    `;
    movieObject.innerHTML = output;
  })
  .catch(function(error){
    console.log(error);
  })
}

function getSeriesById(seriesObject){
  let thisId = seriesObject.dataset.id;
  axios.get('http://www.omdbapi.com?i=' + thisId + '&apikey=6ce0a5e8')
  .then(function(response){
    let series = response.data;
    var seriesPoster = series.Poster;
    if (seriesPoster=="N/A") { seriesPoster = "https://m.media-amazon.com/images/M/MV5BYThkZTZlZWQtNjMzMy00NTlkLThhOTQtMTNiZTc2MTBlNzExXkEyXkFqcGdeQXVyNzI1MDI1NDU@._V1_SX300.jpg" };
    let output = `
    <img src="${seriesPoster}">
    <div class="text">
      <h5>${series.Title}</h5>
      <a onclick="movieSelected('${series.imdbID}')" class="details" href="#">Series details</a>
    </div>
    `;
    seriesObject.innerHTML = output;
  })
  .catch(function(error){
    console.log(error);
  })
}
