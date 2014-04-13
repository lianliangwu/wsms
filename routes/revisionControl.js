var Scene = require('../models/scene.js');
var SNode = require('../models/sNode.js');
var RNode = require('../models/rNode.js');

var getSceneFromNodes = function(nodes, rootId) {
	var scene = {};
	var nodeMap = {};
	var geometries = [];
	var materials = [];
	var textures = [];

	//build nodeMap, geometries, materials and textures
	nodes.forEach(function each(e) {
		switch(e.type){
		case 'object':
			nodeMap[e.uuid] = e;
		break;
		case 'geometry':
			geometries.push(e);
		break;
		case 'material':
			materials.push(e);
		break;
		case 'texture':
			textures.push(e);
		break;
		default:
		break;
		}
		
	});
	//build object tree
	var buildObject = function(object) {
		var children = object.children;
		var i, l, tempObject, tempId;

		for (i = 0, l = children.length; i < l; i++) {
			tempId = children[i];
			tempObject = JSON.parse(nodeMap[tempId].data);
			buildObject(tempObject);
			children[i] = tempObject;
		}
	};

	scene.object = JSON.parse(nodeMap[rootId].data);
	buildObject(scene.object);

	scene.geometries = geometries;
	scene.materials = materials;
	scene.textures = textures;

	return scene;
};
var getNodesFromScene = function(scene) {
	var nodes = [];

	var addNode = function(node, type) {
		var sNode = {
			'uuid': node.uuid,
			'type': type,
			'children': node.children,
			'data': JSON.stringify(node)
		};

		nodes.push(sNode);
	};

	//translate scene tree into object nodes recursively
	var getObject = function(object) {
		var children = object.children;
		var i, l, tempId;

		for (i = 0, l = children.length; i < l; l++) {
			tempId = children[i].uuid;
			getObject(children[i]);
			children[i] = tempId;
		}

		addNode(object, 'object');
	};

	getObject(scene.object);

	scene.geometries.forEach(function each(e) {
		addNode(e, 'geometry');
	});
	scene.materials.forEach(function each(e) {
		addNode(e, 'material');
	});
	scene.textures.forEach(function each(e) {
		addNode(e, 'texture')
	});

	return nodes;
};

/**
 * update nodes in versionB with the right versionNum
 * return the delta nodes
 */
var diff = function(versionA, versionB, versionNum) {
	var mapA = {};
	var deltaNodes = [];

	var cmp = function(nodeA, nodeB) {
		var str1 = nodeA.data;
		var str2 = nodeB.data;

		return str1 === str2 ? true : false;
	};

	//build node map
	versionA.forEach(function each(e) {
		mapA[e.uuid] = e;
	});

	versionB.forEach(function each(e, index, array) {
		if(typeof mapA[e.uuid] === 'undefined'){
			e.versionNum = versionNum;
			deltaNodes.push(e);
		}else{
			if (!cmp(e, mapA[e.uuid])){
				e.versionNum = versionNum;
				deltaNodes.push(e);
			}else{
				e.versionNum = mapA[e.uuid].versionNum;
			}
		}
	});

	return deltaNodes;
};

var retrieveSceneNodes = function(sceneId, versionNum, callback) {
	var nodes = [];
	var count = 0;

	RNode.findOne({
		'sceneId': sceneId,
		'versionNum': versionNum
	},function onEnd(err, rNode) {
		var nodeMap = JSON.parse(rNode.nodeMap);

		for ( var uuid in nodeMap ) {
			if (nodeMap.hasOwnProperty(uuid)){
				count++;
				SNode.findOne({
					"uuid": uuid,
					"versionNum": nodeMap[uuid]
				}, function onEnd(err, node) {
					if (err){
						console.log("find snode err "+ err);
					}

					nodes.push(node);
					count--;

					if(count === 0){
						callback&&callback(nodes);
					}
				});
			}
		}
	});
};

exports.retrieve = function(req, res) {
	var versionNum = req.query.versionNum;
	var sceneId = req.query.sceneId;


	retrieveSceneNodes(sceneId, versionNum, function onEnd(err, nodes){
		var scene = getSceneFromNodes(nodes, sceneId);

		res.send({
			'success': true,
			'scene': scene
		});
	})
};

exports.commit = function(req, res) {
	var preVersion = req.body.preVersion;
	var scene = req.body.scene;
	var sceneId = req.body.sceneId;

	var nodes = getNodesFromScene(JSON.parse(scene));
	var deltaNodes, nodeMap = {};

	if (preVersion < 0){//first commit
		deltaNodes = nodes;

		//save scene info
		Scene.create({
			'uuid': sceneId,
			'newestVersion': 0
		}, function onEnd(err){
			if (err){
				console.log("add scene err "+ err);
			}
		});

		//save scene nodes
		deltaNodes.forEach(function each(node) {
			node.versionNum = 0;
			SNode.create(node, function onEnd(err){
				if (err){
					console.log("save SNode err! "+ err);
				}
			});
		});

		nodes.forEach(function each(node) {
			nodeMap[node.uuid] = node.versionNum;
		});

		//save version node
		RNode.create({
			'sceneId': sceneId,
			'versionNum': 0,
			'preVersions': [],
			'nodeMap': JSON.stringify(nodeMap)
		}, function onEnd(err) {
			if (err){
				console.log("add scene err "+ err);
			}
		});

		res.send({
			'success': true,
			'versionNum': 0
		});

	}else{
		Scene.find({'uuid':sceneId}, function onEnd(err, scene) {
			if (err){
				console.log("find scene err "+ err);
			}

			var versionNum = scene.newestVersion + 1;
			scene.newestVersion = versionNum;

			//save scene info
			scene.save();

			retrieveSceneNodes(sceneId, preVersion, function onEnd(preVersionNodes) {
				deltaNodes = diff(preVersionNodes, nodes, versionNum);

				//save scene nodes
				deltaNodes.forEach(function each(node) {
					SNode.create(node, function onEnd(err){
						if (err){
							console.log("save SNode err! "+ err);
						}
					});
				});	


				nodes.forEach(function each(node) {
					nodeMap[node.uuid] = node.versionNum;
				});

				//save version node
				RNode.create({
					'sceneId': sceneId,
					'versionNum': versionNum,
					'preVersions': [preVersion],
					'nodeMap': JSON.stringify(nodeMap)
				}, function onEnd(err) {
					if (err){
						console.log("add scene err "+ err);
					}
				});

				res.send({
					'success': true,
					'versionNum': versionNum
				});
			});

		});

	}
}
