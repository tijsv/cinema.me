$(document).ready(function(){

  $('#header-logo').on('click', function(){
    window.location.href = "/";
  });

  $('.rate-button').on('click', function(){
    $('#rating').css('display', 'flex');
    generateRatingGrid();
  });

  var homeBackground = document.getElementById('home-background');
  if(homeBackground) {
    homeBackground.style.backgroundImage = 'url(' + homeBackground.dataset.img + ')';
  }
  var loginBackground = document.getElementById('login-background');
  if(loginBackground) {
    loginBackground.style.backgroundImage = 'url(' + loginBackground.dataset.img + ')';
  }
  var registerBackground = document.getElementById('register-background');
  if(registerBackground) {
    registerBackground.style.backgroundImage = 'url(' + registerBackground.dataset.img + ')';
  }
  var contentBackground = document.getElementById('content-background');
  if(contentBackground) {
    contentBackground.style.backgroundImage = 'url(' + contentBackground.dataset.img + ')';
  }
  var filterDiv = document.getElementById('filters');
  if(filterDiv) {
    var moviesDiv = document.getElementById('movies');
    var seriesDiv = document.getElementById('series');
    if(moviesDiv) {
      generateMovieFilters(filterDiv);
    } else if(seriesDiv) {
      generateSeriesFilters(filterDiv);
    }

  }

});

function filterMoviesByGenre(genre) {
  var filtersDiv = document.getElementById('filters');
  var filters = filtersDiv.dataset.filters.split(',');
  if(genre === "All" && filters[0] !== "All") {
    filters = ["All"];
  } else {
    var genreInFilters = false;
    for(i=0;i<filters.length;i++) {
      if(filters[i] === genre) {
        filters.splice(i, 1);
        genreInFilters = true;
      }
    }
    if(!genreInFilters) {
      if(filters[0] === "All" || filters[0] === "") {
        filters = [genre];
      } else {
        filters.push(genre);
      }
    }
  }
  filtersDiv.dataset.filters = filters;
  var allFilterElements = document.getElementsByClassName('filter');
  // console.log(allFilterElements);
  if(filters[0] === "All") {
    for(i=0;i<allFilterElements.length;i++) {
      allFilterElements[i].className = "filter selected";
    }
  } else {
    for(i=0;i<allFilterElements.length;i++) {
      if(filters.includes(allFilterElements[i].innerHTML)) {
        allFilterElements[i].className = "filter selected";
      } else {
        allFilterElements[i].className = "filter";
      }
    }
  }
  var movies = document.getElementsByClassName('movie');
  if(filters[0] === "All") {
    for(i=0;i<movies.length;i++) {
      movies[i].style.display = "block";
    }
  } else {
    for(i=0;i<movies.length;i++) {
      movies[i].style.display = "none";
      var movieGenres = movies[i].dataset.genres.split(',');
      for(j=0;j<movieGenres.length;j++) {
        if(filters.includes(movieGenres[j])) {
          movies[i].style.display = "block";
        }
      }
    }
  }
}

function generateMovieFilters(filterDiv) {
  var allgenresWithDuplicates = [];
  var allgenres = [];
  $('.movie').each(function() {
    var genres = $(this).attr('data-genres').split(',');
    allgenresWithDuplicates = allgenresWithDuplicates.concat(genres);
  })
  for(i=0;i<allgenresWithDuplicates.length;i++) {
    if(!allgenres.includes(allgenresWithDuplicates[i])) {
      allgenres.push(allgenresWithDuplicates[i]);
    }
  }
  var newLink = document.createElement('a');
  newLink.innerHTML = "All";
  newLink.className = 'filter selected';
  newLink.setAttribute('onclick', 'filterMoviesByGenre("All")');
  filterDiv.append(newLink);
  for(i=0;i<allgenres.length;i++) {
    var newLink = document.createElement('a');
    newLink.innerHTML = allgenres[i];
    newLink.className = 'filter selected';
    newLink.setAttribute('onclick', 'filterMoviesByGenre("' + allgenres[i] + '")');
    filterDiv.append(newLink);
  }
}

function filterSeriesByGenre(genre) {
  var filtersDiv = document.getElementById('filters');
  var filters = filtersDiv.dataset.filters.split(',');
  if(genre === "All" && filters[0] !== "All") {
    filters = ["All"];
  } else {
    var genreInFilters = false;
    for(i=0;i<filters.length;i++) {
      if(filters[i] === genre) {
        filters.splice(i, 1);
        genreInFilters = true;
      }
    }
    if(!genreInFilters) {
      if(filters[0] === "All" || filters[0] === "") {
        filters = [genre];
      } else {
        filters.push(genre);
      }
    }
  }
  filtersDiv.dataset.filters = filters;
  var allFilterElements = document.getElementsByClassName('filter');
  // console.log(allFilterElements);
  if(filters[0] === "All") {
    for(i=0;i<allFilterElements.length;i++) {
      allFilterElements[i].className = "filter selected";
    }
  } else {
    for(i=0;i<allFilterElements.length;i++) {
      if(filters.includes(allFilterElements[i].innerHTML)) {
        allFilterElements[i].className = "filter selected";
      } else {
        allFilterElements[i].className = "filter";
      }
    }
  }
  var series = document.getElementsByClassName('series');
  if(filters[0] === "All") {
    for(i=0;i<series.length;i++) {
      series[i].style.display = "block";
    }
  } else {
    for(i=0;i<series.length;i++) {
      series[i].style.display = "none";
      var seriesGenres = series[i].dataset.genres.split(',');
      for(j=0;j<seriesGenres.length;j++) {
        if(filters.includes(seriesGenres[j])) {
          series[i].style.display = "block";
        }
      }
    }
  }
}

function generateSeriesFilters(filterDiv) {
  var allgenresWithDuplicates = [];
  var allgenres = [];
  $('.series').each(function() {
    var genres = $(this).attr('data-genres').split(',');
    allgenresWithDuplicates = allgenresWithDuplicates.concat(genres);
  })
  for(i=0;i<allgenresWithDuplicates.length;i++) {
    if(!allgenres.includes(allgenresWithDuplicates[i])) {
      allgenres.push(allgenresWithDuplicates[i]);
    }
  }
  var newLink = document.createElement('a');
  newLink.innerHTML = "All";
  newLink.className = 'filter selected';
  newLink.setAttribute('onclick', 'filterSeriesByGenre("All")');
  filterDiv.append(newLink);
  for(i=0;i<allgenres.length;i++) {
    var newLink = document.createElement('a');
    newLink.innerHTML = allgenres[i];
    newLink.className = 'filter selected';
    newLink.setAttribute('onclick', 'filterSeriesByGenre("' + allgenres[i] + '")');
    filterDiv.append(newLink);
  }
}


function generateRatingGrid() {
  for(i=0;i<10;i++){
    var integerDiv = document.createElement('div');
    var integerDivBG = document.createElement('p');
    integerDivBG.innerHTML = i+1;
    integerDiv.className = 'rating-integer';
    for(j=0;j<10;j++){
      var decimalDiv = document.createElement('div');
      decimalDiv.className = 'rating-decimal';
      var decimalDivBG = document.createElement('p');
      if(i===9){
        decimalDivBG.innerHTML = '10';
        decimalDiv.dataset.score = 10;
      } else if(j===0) {
        decimalDivBG.innerHTML = (i+1);
        decimalDiv.dataset.score = (i+1);
      } else {
        decimalDivBG.innerHTML = (i+1) + '.' + (j);
        decimalDiv.dataset.score = (i+1) + (j/10);
      }
      decimalDiv.append(decimalDivBG);
      integerDiv.append(decimalDiv);
    }
    integerDiv.append(integerDivBG);
    document.getElementById('rating').append(integerDiv);
  }
  $('.rating-decimal').on('click', function(){
    var form = document.getElementById('rating-form');
    form.score.value = parseFloat($(this).attr("data-score"));
    form.submit();
  })
}

function resultSelected(Id, type) {
  window.location = '/cinema/screen/'+type+Id;
  return false;
}
