/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

let Schema = mongoose.Schema;

const UserSchema = Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
