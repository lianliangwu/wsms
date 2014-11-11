"use strict";

var auth = require('../lib/route_enhancements');
var User = require('../models/user');

exports.login = function(req, res) {
  auth.loginUser(req, res, {
    email: req.body.email,
    password: req.body.password,
    user_model: User // optional, defaults to mongoose.model('User')
  }, function(err) {
    if(err) {
      if(err.type === 'AuthenticationFailure') {
        res.status(400).send('denied'); // or however you'd handle that
      } else {
        res.status(500).send('whoops');
      }
    }
    res.send({success: true});
  });
};

exports.createUser = function (req, res) {
    var user = new User({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            password_repeat: req.body.password
        });

    user.save(function onEnd(err) {
      if(err){
        res.status(400).send('whoops'); 
      }
      res.status(200).send("Add Success!");
    });
};

exports.requireUser = function () {

  // This generates standard express middleware with a signature of (req, res, next)
  return auth.requireUser({
    login_url: '/login', // optional, defaults to '/login'
    user_model: User    // optional, defaults to mongoose.model('User')
  });
};