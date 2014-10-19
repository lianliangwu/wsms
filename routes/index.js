"use strict";

var Scene = require('../models/scene.js');
var RNode = require('../models/rNode.js');
var revisionControl = require('./revisionControl.js');
var auth = require('../lib/route_enhancements');
var User = require('../models/user');
var fs = require('fs');

/*
 * GET home page.
 */


function saveScene(uuid, scene){
	Scene.findByUuid(uuid, function(err, scenes){
		console.log("scene.length: "+ scenes.length);
		if(scenes.length > 0){
			
			Scene.update({'uuid': uuid}, {'data': scene}, function(err, numberAffected, raw){
				if (err){
					console.log("err: fail to save scene "+ uuid);
				}
				console.log("scene saved "+ uuid);
			});
			return;
		}

		var newScene = new Scene({
			'uuid': uuid,
			'data': scene
		});
		console.log("newScene "+ newScene);
		newScene.save(function(err, scene){
			if(err){
				console.log("err: fail to save scene "+ uuid);
			}
			console.log(scene);
		});
	});
}

function removeScene(uuid, callback){
	//remove all versions
	RNode.getAllVersions(uuid, function(err, rNodes){
		rNodes.forEach(function(rNode){
			revisionControl.removeVersion();
		});
	});
	//remove scene
}

function loadScene(uuid, callback) {
	Scene.findByUuid(uuid, function(err, scenes){
		if(scenes.length > 0){
			callback&&callback(scenes[0]);
		}
	});
}

var myRequireUser = function() {

  // This generates standard express middleware with a signature of (req, res, next)
  return auth.requireUser({
    login_url: '/login', // optional, defaults to '/login'
    user_model: User                      // optional, defaults to mongoose.model('User')
  });
};

// app.get('/sharedScenes', myRequireUser(), function(req, res) {
//   res.status(200).send('Welcome, authenticated user!');
// });

exports.renderLogin = function(req, res){
    res.render('login');
};
exports.login = function(req, res) {
  auth.loginUser(req, res, {
    email: req.body.email,
    password: req.body.password,
    default_redirect: '/',
    user_model: User // optional, defaults to mongoose.model('User')
  }, function(err) {
    if(err) {
      if(err.type === 'AuthenticationFailure') {
        res.status(400).send('denied'); // or however you'd handle that
      } else {
        res.status(500).send('whoops');
      }
    }
  });
};

exports.index = function(req, res){
  res.render('index');
};

exports.saveScene = function(req, res){
	var uuid = req.body['uuid'];
	var scene = req.body['scene'];

	saveScene(uuid, scene);
	res.send({success: true});
};

exports.loadScene = function(req, res){
	var uuid = req.query['uuid'];

	loadScene(uuid, function(scene){
		res.send({
			'success': true,
			'scene':JSON.parse(scene.data)
		});
	});
};

exports.removeScene = function(req, res){
	var uuid = req.query['uuid'];

	removeScene(uuid, function(err){
		if(!err){
			res.send({
				'success': true
			});
		}
	});
};

exports.getAllScenes = function(req, res) {
	Scene.getAllScenes(function(err, scenes){
		res.send({
			'success': true,
			'scenes':scenes
		});
	});
};

