/*
 * wzhscript 2014.4.18
**/
var Scene = require('../models/scene.js');
var SNode = require('../models/sNode.js');
var RNode = require('../models/rNode.js');
var maps = ['map', 'bumpMap', 'lightMap', 'normalMap', 'specularMap', 'envMap'];

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
			geometries.push(JSON.parse(e.data));
		break;
		case 'material':
			materials.push(JSON.parse(e.data));
		break;
		case 'texture':
			textures.push(JSON.parse(e.data));
		break;
		default:
		break;
		}
		
	});
	//build object tree
	var buildObject = function(object) {
		var children = object.children;
		var i, l, tempObject, tempId;

		if(typeof children !== 'undefined'){
			for (i = 0, l = children.length; i < l; i++) {
				tempId = children[i];
				tempObject = JSON.parse(nodeMap[tempId].data);
				buildObject(tempObject);
				children[i] = tempObject;
			}			
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
		if(typeof object.children !== 'undefined'){
			var children = object.children;
			var i, l, tempId;

			for (i = 0, l = children.length; i < l; i++) {
				tempId = children[i].uuid;
				getObject(children[i]);
				children[i] = tempId;
			}	
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

/**
 * retrieve all the nodes according to nodeMap
 */
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
						callback&&callback(null, nodes);
					}
				});
			}
		}
	});
};

var threeWayMerge = function(nodesA, nodesB, nodesC, callback) {
	var nodeMapA = {}, nodeMapB = {}, nodeMapC = {};
	var nodesD = [];
	var ids = [];
	var infoMap = {};
	var currentLog;

	var nodeCmp = function(nodeA, nodeB) {
		var str1 = nodeA.data;
		var str2 = nodeB.data;

		return str1 === str2 ? true : false;
	};	
	var valueCmp = function(keyA, keyB){
		var str1 = keyA + "";
		var str2 = keyB + "";

		return str1 === str2 ? true : false;
	};

	var dependencyMerge = function(nodeA, nodeB, nodeC, nodeD) {
		var refMapA, refMapB, refMapC;
		var childrenA = nodeA.children;
		var childrenB = nodeB.children;
		var childrenC = nodeC.children;
		var childrenD = nodeD.children;

		//check if the subgraph has been modified, comparing with version C 
		var checkModified = function(nodeMap, uuid) {
			if(nodeCmp(nodeMap[uuid], nodeMapC[uuid])){
				var node = JSON.parse(nodeMap[uuid].data);
				var nodeC = JSON.parse(nodeMapC[uuid].data);

				//object 
				var children = node.children;
				if(typeof children !== 'undefined'){
					children.forEach(function onEach(ref) {
						if(!checkModified(nodeMap, ref)){
							return false;
						}
					});
				}
				// geometry, material and texture 
				if(node.type === 'Mesh'){
					if(!nodeCmp(nodeMap[node.geometry], nodeMapC[node.geometry])){
						return false;
					}
					if(!nodeCmp(nodeMap[node.material], nodeMapC[node.material])){
						return false;
					}

					//texture diff
					var material = JSON.parse(nodeMap[node.material].data);
					var materialC = JSON.parse(nodeMapC[node.material].data);
					maps.forEach(function (map){
						var ref = material[map];
						if(typeof ref !== 'undefined'){
							if(!nodeCmp(nodeMap[ref], nodeMapC[ref])){
								return false;
							}
						}
					});
				}

				return true;
			}else{
				return false;
			}
		};
		//build reference map
		childrenA.forEach(function onEach(ref) {
			refMapA[ref] = true;
		});
		childrenB.forEach(function onEach(ref) {
			refMapB[ref] = true;
		});
		childrenC.forEach(function onEach(ref) {
			refMapC[ref] = true;
		});

		childrenA.forEach(function onEach(ref) {
			if (refMapB[ref]){// case 1
				childrenD.push(ref);
			}
			if (typeof refMapC[ref] === 'undefined'){// case 5
				childrenD.push(ref);
				// merge log
				currentLog.subScenes.push({
					'uuid':ref,
					'versionA': 'added',
					'versionB': 'unchanged',
					'result': 'versionA',
					'type': 'merged'
				});
			}
		});
		childrenB.forEach(function onEach(ref) {
			if (typeof refMapC[ref] === 'undefined'){// case 6
				childrenD.push(ref);
				// merge log
				currentLog.subScenes.push({
					'uuid':ref,
					'versionA': 'unchanged',
					'versionB': 'added',
					'result': 'versionB',
					'type': 'merged'
				});				
			}
		});
		childrenC.forEach(function onEach(ref) {
			if (typeof refMapA[ref] === 'undefined' && refMapB[ref]){// case 2
				if(checkModified(nodeMapB, ref)){
					//log conflict
					//default choice
					currentLog.subScenes.push({
						'uuid':ref,
						'versionA': 'removed',
						'versionB': 'changed',
						'result': 'versionA',
						'type': 'conflicted'
					});	
					currentLog.isConflicted = true;
				}else{
					//log merge
					//removed by A
					currentLog.subScenes.push({
						'uuid':ref,
						'versionA': 'removed',
						'versionB': 'unchanged',
						'result': 'versionA',
						'type': 'merged'
					});	
					currentLog.isMerged = true;
				}
			}
			if(typeof refMapB[ref] === 'undefined' && refMapA[ref]){// case 3
				if(checkModified(nodeMapA, ref)){
					//log conflict
					childrenD.push(ref);//default choice
					currentLog.subScenes.push({
						'uuid':ref,
						'versionA': 'changed',
						'versionB': 'removed',
						'result': 'versionA',
						'type': 'conflicted'
					});	
					currentLog.isConflicted = true;
				}else{
					//log merge
					currentLog.subScenes.push({
						'uuid':ref,
						'versionA': 'unchanged',
						'versionB': 'removed',
						'result': 'versionA',
						'type': 'merged'
					});	
					currentLog.isMerged = true;
					//removed by B
				}

			}
		});

	};

	var attrMerge = function(id) {
		var keys = {};
		var nodeA = JSON.parse(nodeMapA[id].data);
		var nodeB = JSON.parse(nodeMapB[id].data);
		var nodeC = JSON.parse(nodeMapC[id].data);
		var nodeD = {};

		// keys<- distinct {‘key' in nodeA, nodeB and nodeC}
		for(var key in nodeA){
			if (nodeA.hasOwnProperty(key) && (typeof keys[key] === 'undefined')){
				keys[key] = true;
			}
		}
		for(var key in nodeB){
			if (nodeB.hasOwnProperty(key) && (typeof keys[key] === 'undefined')){
				keys[key] = true;
			}
		}
		for(var key in nodeC){
			if (nodeC.hasOwnProperty(key) && (typeof keys[key] === 'undefined')){
				keys[key] = true;
			}
		}

		for(var key in keys){
			if(kes.hasOwnProperty(key)){
				if (valueCmp(nodeA[key], nodeB[key])){// case 1 , 2
					nodeD[key] = nodeA[key];
				}else if(valueCmp(nodeB[key], nodeC[key])){// case 3
					nodeD[key] = nodeA[key];
					
					currentLog.attrLog.push({
						'key': key,
						'versionA': 'changed',
						'versionB': 'unchanged',
						'result': 'versionA',
						'type': 'merged'
					});
					currentLog.isMerged = true;
				}else if(valueCmp(nodeA[key], nodeC[key])){// case 4
					nodeD[key] = nodeB[key];
					
					currentLog.attrLog.push({
						'key': key,
						'versionA': 'unchanged',
						'versionB': 'changed',
						'result': 'versionB',
						'type':'merged'
					});
					currentLog.isMerged = true;
				}else{// case 5
					if(key === 'children'){
						nodeD.children = [];
						dependencyMerge(nodeA, nodeB, nodeC, nodeD);
					}else{
						nodeD[key] = nodeA[key];// default choice
						
						currentLog.attrLog.push({
							'key': key,
							'versionA': 'changed',
							'versionB': 'changed',
							'result': 'versionA',
							'type': 'conflicted'							
						});
						currentLog.isConflicted = true;
					}
				}
			}
		}

		var temp = nodeD;
		nodeD = {
			'uuid': nodeA.uuid,
			'type': 'object',
			'children': temp.children,
			'data': JSON.stringify(temp)
		};
		return nodeD;

	};

	//build nodemap
	nodesA.forEach(function onEach(node) {
		nodeMapA[node.uuid] = node;
	});

	nodesB.forEach(function onEach(node) {
		nodeMapB[node.uuid] = node;
	});

	nodesC.forEach(function onEach(node) {
		nodeMapC[node.uuid] = node;
	});

	//ids <- distinct {'id' in (A N B)}
	//nodesD <- (C - A)U(C - B)
	nodesA.forEach(function onEach(node) {
		var uuid = node.uuid;

		if (typeof nodeMapB[uuid] !== 'undefined'){
			ids.push(uuid);
		}
		if (typeof nodeMapC[uuid] === 'undefined'){
			nodesD.push(node);
		}
	});

	nodesB.forEach(function onEach(node){
		var uuid = node.uuid;
		if (typeof nodeMapC[uuid] === 'undefined'){
			nodesD.push(node);
		}
	});

	ids.forEach(function onEach(id){
		infoMap[id] = {
			isMerged: false,
			isConflicted: false,
			nodeLog:{},
			attrLog:[],
			subScenes:[]
		};
		currentLog = infoMap[id];

		if(nodeCmp(nodeMapA[id], nodeMapB[id])){// case 1 and 2
			nodesD.push(nodeMapA[id]);
		}else if(nodeCmp(nodeMapB[id], nodeMapC[id])){// case 3
			nodesD.push(attrMerge(id));
			//merge log
			currentLog.nodeLog = {
				'uuid': id,
				'versionA': 'changed',
				'versionB': 'unchanged',
				'result': 'versionA'
			};
		}else if(nodeCmp(nodeMapA[id], nodeMapC[id])){// case 4
			nodesD.push(attrMerge(id));
			//merge log
			currentLog.nodeLog = {
				'uuid': id,
				'versionA': 'unchanged',
				'versionB': 'changed',
				'result': 'versionB'
			};
		}else{// case 5
			nodesD.push(attrMerge(id));
			//merge log
			currentLog.nodeLog = {
				'uuid': id,
				'versionA': 'changed',
				'versionB': 'changed',
				'result': 'compound'
			};
		}
	});

	callback&&callback(null, nodesD, infoMap);
};

exports.getAllVersions = function(req, res) {
	var sceneId = req.query.sceneId;

	RNode.getAllVersions(sceneId, function(err, versions){
		if(err){
			console.log("get all versions err: "+ err);
		}

		versions = versions.map(function(version){
			version.nodeMap = null;
			return version;
		});

		res.send({
			'success': true,
			'versions':versions
		});
	});
};

exports.retrieve = function(req, res) {
	var versionNum = req.query.versionNum;
	var sceneId = req.query.sceneId;


	retrieveSceneNodes(sceneId, versionNum, function onEnd(err, nodes){

		if(err){
			console.log("retrieve scene err: "+ err);
		}
		var scene = getSceneFromNodes(nodes, sceneId);

		res.send({
			'success': true,
			'scene': scene
		});
	})
};

exports.merge = function(req, res) {
	var sceneId = req.query.sceneId;
	var versionA = req.query.versionA;
	var versionB = req.query.versionB;
	var versionC = req.query.versionC; // ancestor version

	var temp;
	if (versionC > versionA){
		temp = versionA;
		versionA = versionC;
		versionC = temp;
	}
	if (versionC > versionB){
		temp = versionB;
		versionB = versionC;
		versionC = temp;
	}

	var nodesA, nodesB, nodesC;
	retrieveSceneNodes(sceneId, versionA, function onEnd(err, nodes) {
		if(!err){
			nodesA = nodes;
			if(nodesA && nodesB && nodesC){
				merge();
			}
		}
	});
	retrieveSceneNodes(sceneId, versionB, function onEnd(err, nodes) {
		if(!err){
			nodesB = nodes;
			if(nodesA && nodesB && nodesC){
				merge();
			}
		}
	});
	retrieveSceneNodes(sceneId, versionC, function onEnd(err, nodes) {
		if(!err){
			nodesC = nodes;
			if(nodesA && nodesB && nodesC){
				merge();
			}
		}
	});
	
	var merge = function() {
		threeWayMerge(nodesA, nodesB, nodesC, function(err, nodesD, infoMap){
			if(!err){
				var sceneA = getSceneFromNodes(nodesA,sceneId);
				var sceneB = getSceneFromNodes(nodesB,sceneId);
				var mergedScene = getSceneFromNodes(nodesD,sceneId);
				res.send({
					'success': true,
					'sceneA': sceneA,
					'sceneB': sceneB,
					'mergedScene': scene,
					'infoMap': infoMap
				});
			}
		});		
	};
};

exports.commit = function(req, res) {
	var preVersion = req.body.preVersion;
	var scene = JSON.parse(req.body.scene);
	var sceneId = req.body.sceneId;

	var nodes = getNodesFromScene(scene);
	var deltaNodes, nodeMap = {};

	if (preVersion < 0){//first commit
		deltaNodes = nodes;

		//save scene info
		Scene.create({
			'uuid': sceneId,
			'name': scene.object.name,
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
			'prevs': [],
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
		Scene.findOne({'uuid':sceneId}, function onEnd(err, scene) {
			if (err){
				console.log("find scene err "+ err);
			}

			var versionNum = scene.newestVersion + 1;
			scene.newestVersion = versionNum;


			retrieveSceneNodes(sceneId, preVersion, function onEnd(err, preVersionNodes) {
				deltaNodes = diff(preVersionNodes, nodes, versionNum);

				if(deltaNodes.length > 0){
					//save scene info
					scene.save(function( err ){
						if(!err){
							console.log('User saved!');
						}
					});

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
						'prevs': [preVersion],
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
				}else{
					console.log("no change to be committed!\n");
					res.send({
						'success': false,
						'errInfo': 'no change to be committed'
					});
				}
			});
		});
	}
}
