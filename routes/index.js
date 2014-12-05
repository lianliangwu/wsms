"use strict";

var Scene = require('../models/scene.js');
var RNode = require('../models/rNode.js');
var Branch = require('../models/branch.js');
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

exports.addScene = function(req, res){
	var uuid = req.body['uuid'],
		name = req.body['name'],
		scene = null,
		branch = null,
		rNode = null;

	// add scene
	scene = new Scene({
		'uuid': uuid,
		'name': name,
		'newestVersion': 0
	});
	scene.save();
	// add master branch
	branch = new Branch({
		'sceneId': uuid,
		'name': 'master',
		'versionNum': "0",
		'desc': 'default branch'
	});
	branch.save();
	// add 0 version
	rNode = new RNode({
		'sceneId': uuid,
		'versionNum': 0,
		'prevs': [],
		'nodeMap': {}
	});

	RNode.saveWithPath(rNode, function onEnd(err) {
		if(!err){
			console.log('rNode saved' );
		}
	});
	res.send({success: true});
};

exports.updateSceneByName = function (req, res) {

	Scene.findOne({'name' : req.body.name}, function onEnd(err, scene) {
		if (!err) {
			scene.privilege = req.body.privilege;
			
			scene.save(function onEnd(err) {
				if (!err) {
					res.send({success: true});
				}
			});
		}
	});
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

