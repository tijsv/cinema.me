let mongoose = require('mongoose');

// movie schema
let movieSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  }
});

let Movie = module.exports = mongoose.model('Movie', movieSchema);
