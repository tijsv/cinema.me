var api_key = "e13c2a215ac12da642ab41538b30e620";

$(document).ready(function(){
  $('#header-logo').on('click', function(){
    window.location.href = "/";
  });
});

function resultSelected(Id, type) {
  window.location = '/cinema/screen/'+type+Id;
  return false;
}
