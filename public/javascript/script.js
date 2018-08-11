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
    generateFilters(filterDiv);
  }

});

function filterByGenre(genre) {
  // wat moet dit doen:
  // check filters. if hasClass('clicked'), then add genre to filterGenres
  // filter movies on any of the filterGenres
  // default moeten alle genres geselecteerd zijn (dus allemaal class .clicked)
  // all button toevoegen
  var filters = $('.filter');
  for(i=0;i<filters.length;i++) {
    if(filters[i].innerHTML===genre){
      filters[i].classList.toggle('clicked');
    }
  }
  $('.movie').each(function() {
    if($(this).css('display')=='none') {
      $(this).toggle();
    }
    var genres = $(this).attr('data-genres').split(',');
    if(!genres.includes(genre)) {
      $(this).toggle();
    }
  })
}

function generateFilters(filterDiv) {
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
  for(i=0;i<allgenres.length;i++) {
    var newLink = document.createElement('a');
    newLink.innerHTML = allgenres[i];
    newLink.className = 'filter';
    newLink.setAttribute('onclick', 'filterByGenre("' + allgenres[i] + '")');
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
