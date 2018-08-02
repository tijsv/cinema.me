var api_key = "e13c2a215ac12da642ab41538b30e620";

$(document).ready(function(){
  // script for search function
  $('#searchForm').on('submit', function(e){
    let searchText = $('#searchText').val()
    searchTMDB(searchText);
    e.preventDefault();
  });
  // make h1 in header clickable
  $('#header-logo').on('click', function(){
    window.location.href = "/";
  });
  // // get movie when on the screen page
  // if(window.location.pathname === '/cinema/screen') {
  //   getId();
  // }
  // show movies when on
  if(window.location.pathname === '/cinema') {
    let allMovies = document.getElementsByClassName('movie');
    let allSeries = document.getElementsByClassName('series');
    for(i=0;i<allMovies.length;i++) {
      getResultById(allMovies[i], "movie");
    }
    for(i=0;i<allSeries.length;i++) {
      getResultById(allSeries[i], "tv");
    }
  }
});

function resultSelected(Id, type) {
  sessionStorage.setItem('Id', Id);
  sessionStorage.setItem('type', type);
  if(window.location.href.indexOf("cinema/screen/") > -1) {
    window.location = '/cinema/screen/'+type+Id;
  } else {
    window.location = 'cinema/screen/'+type+Id;
  }
  return false;
}

function searchTMDB(searchText){
  console.log('searchTMDB started ...');
  var url = 'https://api.themoviedb.org/3/search/multi?api_key=' + api_key + '&language=en-US&query=' + searchText + '&page=1&include_adult=false&append_to_response=external_ids';
  var HTTPRequest = new XMLHttpRequest();
  HTTPRequest.open('GET', url, true);
  HTTPRequest.onload = function () {
    var data = JSON.parse(this.response);
    console.log(data);
    let results = data.results;
    let output = "";
    $.each(results, function(index, result){
      var poster = 'https://image.tmdb.org/t/p/w500';
      var title = "";
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
      output += `
        <div class="movie-item" onclick="resultSelected('${result.id}','${result.media_type}')">
          <img src="${poster}">
          <div class="text">
            <h5>${title}</h5>
            <p class="type">${result.media_type}</a>
          </div>
        </div>
      `;
    });
    $('#movies').html(output);
  }
  HTTPRequest.send();
}

// function getId(){
//   console.log('getId started ...');
//   let Id = sessionStorage.getItem('Id');
//   let type = sessionStorage.getItem('type');
//   let url = 'https://api.themoviedb.org/3/';
//   if(type=="movie"){
//     url += 'movie/' + Id + '?api_key=' + api_key + '&language=en-US';
//   } else if(type=="tv"){
//     url += 'tv/' + Id + '?api_key=' + api_key + '&language=en-US';
//   }
//   var HTTPRequest = new XMLHttpRequest();
//   HTTPRequest.open('GET', url, true);
//   HTTPRequest.onload = function () {
//     var result = JSON.parse(this.response);
//     console.log(result);
//     var poster = 'https://image.tmdb.org/t/p/w500';
//     var title = "";
//     var released = "";
//     if(result.poster_path) {
//       poster += result.poster_path;
//     } else {
//       poster = "https://m.media-amazon.com/images/M/MV5BYThkZTZlZWQtNjMzMy00NTlkLThhOTQtMTNiZTc2MTBlNzExXkEyXkFqcGdeQXVyNzI1MDI1NDU@._V1_SX300.jpg"
//     }
//     if(type=="movie"){
//       title = result.title;
//       released = result.release_date;
//     } else if(type=="tv"){
//       title = result.name;
//       released = result.first_air_date;
//     }
//     var genreString = "";
//     for(i=0;i<result.genres.length;i++){
//       if(i==0){
//         genreString += result.genres[i].name;
//       } else{
//         genreString += ', ' + result.genres[i].name;
//       }
//     }
//     let output = `
//       <div class="my-screen">
//         <img src="${poster}">
//         <div class="text">
//           <p class="title">${title}</p>
//           <p class="genre">${genreString}</p>
//           <p class="plot">${result.overview}</p>
//           <p class="released"><span>Released:</span> ${released}</p>
//           <form method="POST" action="/cinema/screen">
//             <input type="hidden" name="Id" value="${Id}"/>
//             <input type="hidden" name="type" value="${type}"/>
//             <input class="submit" type="submit" value="Add to list"/>
//           </form>
//         </div>
//       </div>
//       <img class="background" src="${poster}">
//     `;
//     $('#movie').html(output);
//   }
//   HTTPRequest.send();
// }

function getResultById(object, type){
  let Id = object.dataset.id;
  console.log('getResultById started ...');
  let url = 'https://api.themoviedb.org/3/';
  if(type=="movie"){
    url += 'movie/' + Id + '?api_key=' + api_key + '&language=en-US';
  } else if(type=="tv"){
    url += 'tv/' + Id + '?api_key=' + api_key + '&language=en-US';
  }
  var HTTPRequest = new XMLHttpRequest();
  HTTPRequest.open('GET', url, true);
  HTTPRequest.onload = function () {
    var result = JSON.parse(this.response);
    var poster = 'https://image.tmdb.org/t/p/w500';
    var title = "";
    if(result.poster_path) {
      poster += result.poster_path;
    } else {
      poster = "https://m.media-amazon.com/images/M/MV5BYThkZTZlZWQtNjMzMy00NTlkLThhOTQtMTNiZTc2MTBlNzExXkEyXkFqcGdeQXVyNzI1MDI1NDU@._V1_SX300.jpg"
    }
    if(type=="movie"){
      title = result.title;
    } else if(type=="tv"){
      title = result.name;
    }
    let output = `
      <div class="list-item" onclick="resultSelected('${result.id}','${type}')">
        <img src="${poster}">
        <div class="text">
          <h5>${title}</h5>
        </div>
      </div>
    `;
    object.innerHTML = output;
  }
  HTTPRequest.send();
}
