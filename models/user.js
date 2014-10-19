var mongoose = require('mongoose');
var auth = require('../lib/model_enhancements');

var userSchema = new mongoose.Schema({
  email: String,
  hashed_password: String,
  salt: String
});

auth.makeAuthable(userSchema);
var User = mongoose.model('User', userSchema);

module.exports = User;