$(document).ready(function(){
  $('#header-logo').on('click', function(){
    window.location.href = "/";
  });
  $('.rate-button').on('click', function(){
    $('#rating').css('display', 'flex');
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
  });
});

function resultSelected(Id, type) {
  window.location = '/cinema/screen/'+type+Id;
  return false;
}
