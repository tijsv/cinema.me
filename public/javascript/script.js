$(document).ready(function(){
  $('#searchForm').on('submit', function(e){
    let searchText = $('#searchText').val()
    getMovies(searchText);
    e.preventDefault();
  })

  function getMovies(searchText){
    axios.get('http://www.omdbapi.com?s=' + searchText + '&apikey=6ce0a5e8')
    .then(function(response){
      console.log(response);
      let movies = response.data.Search;
      let output = "";
      $.each(movies, function(index, movie){
        output += `
          <div class="movie-item">
            <img src="${movie.Poster}">
            <h5>${movie.Title}</h5>
            <a onclick="movieSelected('${movie.imdbID}')" class="btn btn-primary" href="#">Movie details</a>
          </div>
        `;
      });
      $('#movies').html(output);
    })
    .catch(function(error){
      console.log(error);
    })
  }
});
