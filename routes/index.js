"use strict";

var Scene = require('../models/scene.js');
var RNode = require('../models/rNode.js');
var SNode = require('../models/sNode.js');
var Branch = require('../models/branch.js');
var TreeNodeMap = require('../models/treeNodeMap.js');
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

	console.log("Test Information: come to add scene controller!!!!");
	var uuid = req.body.uuid,
		name = req.body.name,
		treeNodeId = req.body.treeNodeId,
		scene = null,
		branch = null,
		data = null,
		nodeMap = {},
		sNode = null,
		rNode = null,
		treeNodeMap = null;

	// add scene
	scene = new Scene({
		'uuid': uuid,
		'name': name,
		'newestVersion': 0
	});
	if(req.body.isModel === true) {
		scene.isModel = true;
	}
	scene.save();
	// add master branch
	branch = new Branch({
		'sceneId': uuid,
		'name': 'master',
		'versionNum': "0",
		'desc': 'default branch'
	});
	branch.save();

	// add sNode
	data = {
		"uuid": uuid,
		"name": name,
		"type": "Scene",
		"matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
	};
	sNode = new SNode({
		"uuid" : uuid,
		"type" : "object",
		"data" : JSON.stringify(data),
		"versionNum" : 0,
		"children" : []
	});
	sNode.save();


	// add version 0

	nodeMap[uuid] = 0;
	rNode = new RNode({
		'sceneId': uuid,
		'versionNum': 0,
		'prevs': [],
		'nodeMap': JSON.stringify(nodeMap)
	});

	RNode.saveWithPath(rNode, function onEnd(err) {
		if(!err){
			console.log('rNode saved' );
		}
	});

	// add treeNodeMap
	treeNodeMap = new TreeNodeMap({
		"id": uuid,
		"nodeId": treeNodeId,
		"sceneId": uuid
	});
	treeNodeMap.save(function onEnd(err, treeNodeMap) {
        if(err){
        	console.log('ERROR: treeNodeMap add failed!!!!!')
        }
    });

	res.send({
		success: true,
		versionNum: 0,
		branch: 'master'
	});
};

exports.removeScene = function(req, res){
	revisionControl.removeScene(req, res);
};

exports.getAllScenes = function(req, res) {
	Scene.find({isModel: false}, function(err, scenes){
		res.send({
			'success': true,
			'scenes':scenes
		});
	});
};

