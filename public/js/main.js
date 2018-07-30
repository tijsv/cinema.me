$(document).ready(function(){
  $('.delete-movie').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type:'DELETE',
      url:'/movies/'+id,
      success: function(response){
        alert('Deleting Movie');
        window.location.href='/';
      },
      error: function(error){
        console.log(error);
      }
    })
  });
});
