const express = require('express');
const router = express.Router();

router.get('/', function(request, response) {
  response.render('./pages/index.ejs');
})

module.exports = router;
