"use strict";

var Scene = require('../models/scene.js');
var RNode = require('../models/rNode.js');
var revisionControl = require('./revisionControl.js');
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

exports.index = function(req, res){
    res.cookie("username", res.locals.currentUser.username);
    res.cookie("email", res.locals.currentUser.email);
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

