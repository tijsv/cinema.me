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
});

function getMovies(searchText){
  axios.get('http://www.omdbapi.com?s=' + searchText + '&apikey=6ce0a5e8')
  .then(function(response){
    // console.log(response);
    let movies = response.data.Search;
    let output = "";
    $.each(movies, function(index, movie){
      var moviePoster = movie.Poster;
      if (moviePoster=="N/A") { moviePoster = "https://m.media-amazon.com/images/M/MV5BYThkZTZlZWQtNjMzMy00NTlkLThhOTQtMTNiZTc2MTBlNzExXkEyXkFqcGdeQXVyNzI1MDI1NDU@._V1_SX300.jpg" };
      output += `
        <div class="movie-item">
          <img src="${moviePoster}">
          <div class="text-on-top">
            <h5>${movie.Title}</h5>
            <a onclick="movieSelected('${movie.imdbID}')" class="details" href="#">Movie details</a>
            <a onclick="movieSelected('${movie.imdbID}')" class="add" href="#">Add movie</a>
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
