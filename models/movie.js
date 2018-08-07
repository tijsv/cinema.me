const mongoose = require('mongoose');

// user schema
const movieSchema = mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  scores: [{ user_id: String, score: Number }],
  total_score: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    required: true
  },
  backdrop: {
    type: String,
    required: true
  },
  genres: [{ type: String }],
  release_date: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: true
  },
  imdb_id: {
    type: String,
    required: true
  }
});

const Movie = module.exports = mongoose.model('Movie', movieSchema);
