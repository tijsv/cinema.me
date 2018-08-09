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

});

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
