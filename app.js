const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const app = express();
const port = 8080;

// connect to the database
mongoose.connect(process.env.MONGODB_URI || config.database, { useNewUrlParser: true });
var db = mongoose.connection;

// set the view engine to ejs and use expressLayouts
app.set('view engine', 'ejs');
app.use(expressLayouts);

// declare static files folder name
app.use(express.static(__dirname + "/public"));

// ---------- MIDDLEWARE ---------- //

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

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

// import passport config file after initializing
app.use(passport.initialize());
app.use(passport.session());
// config file with localStrategy
require('./config/passport.js')(passport);

// enable global user variable
app.get('*', function(request, response, next){
  response.locals.user = request.user || null;
  next();
})

// declare the routes
let home = require('./routes/home.js');
let users = require('./routes/users.js');
app.use('/', home);
app.use('/users', users);

app.listen(port, function(){
  console.log('Server is running on port', port, '...');
});
