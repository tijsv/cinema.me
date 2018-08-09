const express = require('express');
const router = express.Router();

router.get('/', function(request, response) {
  let arrayOfBackdrops = [
    "https://image.tmdb.org/t/p/original/ns0IojuqJe24AHTxe8RVcWJUCDM.jpg",
    "https://image.tmdb.org/t/p/original/7mgKeg18Qml5nJQa56RBZO7dIu0.jpg",
    "https://image.tmdb.org/t/p/original/A30ZqEoDbchvE7mCZcSp6TEwB1Q.jpg",
    "https://image.tmdb.org/t/p/original/h5jqLrIv1tlszezv2UEWq9KBuoj.jpg",
    "https://image.tmdb.org/t/p/original/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg"
  ];
  let random = Math.floor(Math.random()*arrayOfBackdrops.length);
  let randomBackdrop = arrayOfBackdrops[random];
  response.render('./pages/index.ejs', {
    randomBackdrop: randomBackdrop
  });
})

module.exports = router;
