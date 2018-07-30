// Node.js & Express From Scratch (Part 6 done)

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(process.env.MONGODB_URI || config.database, { useNewUrlParser: true });
var db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
})

// Check for db errors
db.on('error', function(error) {
  console.log(error);
});

// init app
const app = express();

// bring in models
let Movie = require('./models/movie');

// load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// express messages middleware
app.use(require('connect-flash')());
app.use(function(request, response, next){
  response.locals.messages = require('express-messages')(request, response);
  next();
})

// express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;
    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg : msg,
      value : value
    };
  }
}));

// passport config
require('./config/passport')(passport);
// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// enable global user variable
app.get('*', function(request, response, next){
  response.locals.user = request.user || null;
  next();
})

// home route
app.get('/', function(request, response) {
  Movie.find({}, function(error, movies){
    if(error){
      console.log(error);
    } else {
      response.render('index.pug', {
        title: 'cinema.me',
        movies: movies
      });
    }
  });
});

// route files
let movies = require('./routes/movies.js');
let users = require('./routes/users.js');
app.use('/movies', movies);
app.use('/users', users);

// start server
var server = app.listen(process.env.PORT || 3000, function() {
  var port = server.address().port;
  console.log('Server started on port', port, '...');
})
