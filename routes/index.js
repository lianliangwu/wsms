"use strict";

var Scene = require('../models/scene.js');
var RNode = require('../models/rNode.js');
var Branch = require('../models/branch.js');
var revisionControl = require('./revisionControl.js');
var fs = require('fs');

/*
 * GET home page.
 */


function removeScene(uuid, callback){
	//remove all versions
	RNode.getAllVersions(uuid, function(err, rNodes){
		rNodes.forEach(function(rNode){
			revisionControl.removeVersion();
		});
	});
	//remove scene
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
	// add version 0
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
	res.send({
		success: true,
		versionNum: 0,
		branch: 'master'
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

