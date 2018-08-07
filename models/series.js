const mongoose = require('mongoose');

// user schema
const seriesSchema = mongoose.Schema({
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
  number_of_seasons: {
    type: Number,
    required: true,
  },
  first_air_date: {
    type: String,
    required: false
  },
  next_episode_to_air: {
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

const Series = module.exports = mongoose.model('Series', seriesSchema);
