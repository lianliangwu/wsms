"use strict";

var auth = require('../lib/route_enhancements');
var User = require('../models/user');
var Group = require('../models/group');

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

exports.createGroup = function (req, res) {
  //create group
  var group = new Group();
  group.name = req.body.name;
  group.creator = req.body.username;

  //save group
  group.save(function onEnd(err) {
    if (!err){
      console.log("new group created!");
    }
  });
};

exports.removeGroup = function (req, res) {
  Group.findOneAndRemove({'name': req.body.name}, function onEnd(err, group) {
    if (!err) {
      console.log("group " + group.name + " is removed!");
    }
  });
};

exports.addUserToGroup = function (req, res) {
  Group.find({'name': req.body.groupName}, function onEnd(err, group) {
    if (!err) {
      if (group.users.indexOf(req.body.userName) < 0) {
        group.users.push(req.body.userName);
        group.save();
      }
    }
  });
};

exports.removeUserFromGroup = function (req, res) {
  Group.find({'name': req.body.groupName}, function onEnd(err, group) {
    if (!err) {
      var index = group.users.indexOf(req.body.userName);
      if (index >= 0) {
        group.users.splice(index, 1);
        group.save();
      }
    }
  });
};
