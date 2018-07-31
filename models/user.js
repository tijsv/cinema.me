const mongoose = require('mongoose');

// user schema
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cinema: {
    movies: {
      type: Array,
      required: false,
    },
    series: {
      type: Array,
      required: false,
    },
  }
});

const User = module.exports = mongoose.model('User', userSchema);
