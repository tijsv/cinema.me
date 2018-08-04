const mongoose = require('mongoose');

// user schema
const ratingSchema = mongoose.Schema({
  type_id: {
    type: String,
    required: true
  },
  scores: [{ user_id: String, score: Number }],
  total_score: {
    type: String,
    required: true
  }
});

const Rating = module.exports = mongoose.model('Rating', ratingSchema);
