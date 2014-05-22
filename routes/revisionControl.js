"use strict";
/*
 * wzhscript 2014.4.18
**/
var Scene = require('../models/scene.js');
var SNode = require('../models/sNode.js');
var RNode = require('../models/rNode.js');
var Branch = require('../models/branch.js');
var Tag = require('../models/tag.js');
var textureMaps = ['map', 'bumpMap', 'lightMap', 'normalMap', 'specularMap', 'envMap'];

function isArray(obj) {   
  return Object.prototype.toString.call(obj) === '[object Array]';    
}

function isIn(key, obj) {
	return obj[key] !== undefined;
}

function notIn(key, obj) {
	return obj[key] === undefined;
}

//compare both state and structure
function nodeCmp(nodeA, nodeB) {
	return stateCmp(nodeA, nodeB) && propCmp(nodeA.children, nodeB.children) ? true : false;
}

function stateCmp(nodeA, nodeB){
	var str1 = nodeA.data;
	var str2 = nodeB.data;

	return str1 === str2 ? true : false;
}

function propCmp(a, b){
	var str1 = String(a);
	var str2 = String(b);

	return str1 === str2 ? true : false;
}

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

		if( children !== undefined){
			for (i = 0, l = children.length; i < l; i++) {
				tempId = children[i];
				tempObject = JSON.parse(nodeMap[tempId].data);
				//
				tempObject.children = nodeMap[tempId].children;

				buildObject(tempObject);
				children[i] = tempObject;
			}			
		}
	};

	scene.object = JSON.parse(nodeMap[rootId].data);
	scene.object.children = nodeMap[rootId].children;
	buildObject(scene.object);

	scene.geometries = geometries;
	scene.materials = materials;
	scene.textures = textures;

	return scene;
};
var getNodesFromScene = function(scene) {
	var nodes = [];

	var addNode = function(node, type) {
		var children = [];

		if(node.children){
			children = JSON.parse(JSON.stringify(node.children));
			delete node.children;			
		}
		var sNode = {
			'uuid': node.uuid,
			'type': type,
			'children': children,
			'data': JSON.stringify(node)
		};

		nodes.push(sNode);
	};

	//translate scene tree into object nodes recursively
	var getObject = function(object) {
		if( object.children !== undefined){
			var children = object.children;
			var i, l, tempId;

			for (i = 0, l = children.length; i < l; i++) {
				tempId = children[i].uuid;
				getObject(children[i]);
				children[i] = tempId;
			}	
			// 
		}
		addNode(object, 'object');
	};

	getObject(scene.object);

	if(scene.geometries){
		scene.geometries.forEach(function each(e) {
			addNode(e, 'geometry');
		});
	}
	if(scene.materials){
		scene.materials.forEach(function each(e) {
			addNode(e, 'material');
		});
	}
	if(scene.textures){
		scene.textures.forEach(function each(e) {
			addNode(e, 'texture');
		});
	}

	return nodes;
};

/**
 * update node in nodesB with the right versionNum
 * return the delta nodes
 * nodesA, all the nodes in the previous versions
 */
var diff = function(nodesA, nodesB, versionNum) {
	var mapA = {};
	var deltaNodes = [];

	//build node map
	nodesA.forEach(function each(node) {
		if(mapA[node.uuid] === undefined){
			mapA[node.uuid] = {};
		}
		mapA[node.uuid][node.versionNum] = node;
	});

	nodesB.forEach(function each(node) {
		var preVersions = mapA[node.uuid];
		var isChanged;

		if( preVersions === undefined){// new node, update with new versionNum
			node.versionNum = versionNum; 
			deltaNodes.push(node);
		}else{
			isChanged = true;

			//compare with each version 
			for(var num in preVersions){
				if(preVersions.hasOwnProperty(num)){

					//check if structure or state is chenged
					if(nodeCmp(node,preVersions[num])){
						node.versionNum = num;
						isChanged = false;
					}
				}
			}

			if(isChanged){
				node.versionNum = versionNum;
				deltaNodes.push(node);	
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
	},retrieveNodes);	

	function retrieveNodes(err, rNode) {
		if(!err){
			var nodeMap = JSON.parse(rNode.nodeMap);
			var uuid;

			var result = function(err, node) {
				if (err){
					console.log("find snode err "+ err);
				}

				nodes.push(node);
				count--;

				if(count === 0){// finish when no I/O request exists
					callback(null, nodes);
				}
			}; 

			for ( uuid in nodeMap ) {
				if (nodeMap.hasOwnProperty(uuid)){
					count++;//count I/O request 
					SNode.findOne({
						"uuid": uuid,
						"versionNum": nodeMap[uuid]
					}, result);
				}
			}
		}
	}
};

var autoMerge = function(options, callback) {
	var nodeMapA = {}, nodeMapB = {}, nodeMapC = {}, nodeMapD = {};
	var nodesD = [];
	var nodesA = options.nodesA;
	var nodesB = options.nodesB;
	var nodesC = options.nodesC;
	var versionA = options.versionA + '';
	var versionB = options.versionB + '';
	var sceneId = options.sceneId;
	var uuidQueue = [];
	var reparentLogA = {};
	var reparentLogB = {};
	var mergeLog = {
		structureLog: [],
		stateLog: []
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

	var uuid;
	var mergedState;
	var mergedChildren;

	//push root node into list
	uuidQueue.push(sceneId);

	while(uuidQueue.length > 0){
		uuid = uuidQueue.shift();

		mergedState = stateMerge(uuid);
		mergedChildren = structureMerge(uuid);
		

		//push Ca N Cb into uuidQueue
		nodeMapA[uuid].children.forEach(function onEach(refA) {
			nodeMapB[uuid].children.forEach(function onEach(refB) {
				if(refA === refB){
					uuidQueue.push(refA);
				}
			});
		});

		addNodeToD({
			'uuid': uuid,
			'type': nodeMapA[uuid].type, // specify the abstract type
			'data': JSON.stringify(mergedState),
			'children': mergedChildren
		});	
	}


	var toNode;

	for(uuid in reparentLogA){
		if(reparentLogA.hasOwnProperty(uuid)){

			toNode = nodeMapD[reparentLogA[uuid].to];
			toNode.children.push(uuid);
		}
	}

	callback(null, nodesD, mergeLog);

	function addNodeToD(node) {
		nodesD.push(node);
		nodeMapD[node.uuid] = node;


		var state = JSON.parse(node.data);

		for(var key in state){
			if(state.hasOwnProperty(key)){
				if(isRef(key)){
					var uuid = state[key];

					//check if added before
					if(nodeMapD[uuid] !== undefined){
						continue;
					}

					//if exist either in A or B, directly add it to D
					if(nodeMapA[uuid] !== undefined && nodeMapB[uuid] === undefined){
						addNodeToD(nodeMapA[uuid]);
					}
					if(nodeMapA[uuid] === undefined && nodeMapB[uuid] !== undefined){
						addNodeToD(nodeMapB[uuid]);
					}

					//if exist in A and B, state merging is needed
					if(nodeMapA[uuid] !== undefined && nodeMapB[uuid] !== undefined){
						var mergedState = stateMerge(uuid);

						addNodeToD({
							'uuid': uuid,
							'type': nodeMapA[uuid].type,
							'data': JSON.stringify(mergedState)
						});
					}
				}
			}
		}

		//check if the property is a ref to geometry, material or texture
		function isRef(key) {
			var r = false;

			if(key === 'geometry' || key === 'material'){
				return true;
			}

			textureMaps.forEach(function onEach(map) {
				if(key === map){
					r = true;
				}						
			});

			return r;
		}
	}

	function structureMerge(nodeUuid) {
		var mergedChildren;

		if(propCmp(nodeMapA[nodeUuid].children, nodeMapB[nodeUuid].children)){
			return nodeMapA[nodeUuid].children;
		}

		merge();
		return mergedChildren;		

		function getDiffType(id, Cr, Sr, Cc, Sc) {
			if(isIn(id, Cr) && notIn(id, Sc)){
				return 'add';
			}
			if(isIn(id, Cr) && notIn(id, Cc) && isIn(id, Sc)){
				return 'reparentIn';
			}
			if(notIn(id, Cr) && isIn(id, Sr) && isIn(id, Cc)){
				return 'reparentOut';
			}
			if(notIn(id, Cr) && notIn(id, Sr) && isIn(id, Cc)){
				return 'remove';
			}
			if(isIn(id, Cr) && isIn(id, Cc)){
				return 'retain';
			}
		}

		//check if the subgraph has been modified, comparing with version C 
		function checkModified(nodeMap, rootId) {
			//check state and structure 
			if(!nodeCmp(nodeMap[rootId], nodeMapC[rootId])){
				return true;// modified
			}
 
			var node = JSON.parse(nodeMap[rootId].data);
			var nodeC = JSON.parse(nodeMapC[rootId].data);

			//check children object
			if(node.children !== undefined){
				node.children.forEach(function onEach(ref) {
					if(checkModified(nodeMap, ref)){
						return true;
					}
				});
			}

			//check geometry, material and texture
			for(var key in node){
				if(node.hasOwnProperty(key)){
					if(isRef(key)){
						var uuid = node[key];

						if(nodeMap[uuid] !== undefined && nodeMapC[uuid] !== undefined){
							if(checkModified(nodeMap[uuid], nodeMapC[uuid])){
								return true;
							}
						}
					}
				}
			}

			return false;			

			//check if the property is a ref to geometry, material or texture
			function isRef(key) {
				var r = false;

				if(key === 'geometry' || key === 'material'){
					return true;
				}

				textureMaps.forEach(function onEach(map) {
					if(key === map){
						r = true;
					}						
				});

				return r;
			}	
		}	

		//add the subgraph rooted at rootId to nodesD, and update nodeMapD
		function addSubGraphToD(nodeMap, rootId) {
			var children = [];
			var currentNode = nodeMap[rootId];
			var nodeD = {};

			if(nodeMapC[rootId] === undefined){//new added node
				currentNode.children.forEach(function onEach(ref) {
					if(nodeMapC[ref] === undefined){//ignore reparent in
						children.push(ref);
						addSubGraphToD(nodeMap, ref);
					}
				});	
			}else{
				var childMap = {};
				var childMapC = {};

				//build child map
				currentNode.children.forEach(function onEach(ref) {
					childMap[ref] = true;
				});
				nodeMapC[rootId].children.forEach(function onEach(ref) {
					childMapC[ref] = true;
				});

				currentNode.children.forEach(function onEach(ref) {
					var type = getDiffType(ref, childMap, nodeMap, childMapC, nodeMapC);
					if(type !== 'reparentIn'){
						children.push(ref);
						addSubGraphToD(nodeMap, ref);
					}
				});
			}

			nodeD.uuid = currentNode.uuid;
			nodeD.type = currentNode.type;
			nodeD.data = currentNode.data;
			nodeD.children = children;

			addNodeToD(nodeD);
		}

		//find out where ref has been reparented to
		function findReparentIn(nodeMap, ref) {
			var r;
			var ok = 0;

			function checkChildren(uuid) {
				nodeMap[uuid].children.forEach(function onEach(child) {
					if(child === ref){
						r = uuid;
						ok = 1;
					}
					if(!ok){
						checkChildren(child);
					}
				});
			}

			checkChildren(sceneId);

			return r;
		}

		function merge() {
			var childMapA = {};
			var childMapB = {};
			var childMapC = {};
			var typeA, typeB;
			
			mergedChildren = [];

			//build childMap
			nodeMapA[nodeUuid].children.forEach(function onEach(ref) {
				childMapA[ref] = true;
			});		
			nodeMapB[nodeUuid].children.forEach(function onEach(ref) {
				childMapB[ref] = true;
			});	
			nodeMapC[nodeUuid].children.forEach(function onEach(ref) {
				childMapC[ref] = true;
			});	

			//Ca - Cc
			nodeMapA[nodeUuid].children.forEach(function onEach(ref) {
				if(childMapC[ref] === undefined){
					typeA = getDiffType(ref, childMapA, nodeMapA, childMapC, nodeMapC);	
					if(typeA === 'add'){	
						mergedChildren.push(ref);
						addSubGraphToD(nodeMapA, ref);
						//log merged
						mergeLog.structureLog.push({
							'uuid': ref,
							versionA: 'added',
							'result': versionA,
							'isConflicted': false
						});
					}
				}
			});	

			//Cb - Cc
			nodeMapB[nodeUuid].children.forEach(function onEach(ref) {
				if(childMapC[ref] === undefined){
					typeB = getDiffType(ref, childMapA, nodeMapA, childMapC, nodeMapC);
					if(typeB === 'add'){
						mergedChildren.push(ref);
						addSubGraphToD(nodeMapB, ref);
						//log merged
						mergeLog.structureLog.push({
							'uuid': ref,
							versionB: 'added',
							'result': versionB,
							'isConflicted': false
						});	
					}
				}
			});

			//Cc
			nodeMapC[nodeUuid].children.forEach(function onEach(ref) {
				typeA = getDiffType(ref, childMapA, nodeMapA, childMapC, nodeMapC);
				typeB = getDiffType(ref, childMapB, nodeMapB, childMapC, nodeMapC);

				//both remove
				if(typeA === 'remove' && typeB === 'remove') {
				//do nothing
				}

				//both retain
				if(typeA === 'retain' && typeB === 'retain') {
					mergedChildren.push(ref);
				}

				//remove/reparent
				if(typeA === 'remove' && typeB === 'reparentOut') {
					//take change from version A, remove
					//log conflicted
					mergeLog.structureLog.push({
						'uuid': ref,
						versionA: 'removed',
						versionB: 'reparented',
						'result': versionA,
						'isConflicted': true
					});	
				}

				if(typeA === 'reparentOut' && typeB === 'remove') {
					//take change from version A, reparent
					reparentLogA[ref] = {
						'from': nodeUuid,
						'to': findReparentIn(nodeMapA, ref)
					};
					addSubGraphToD(nodeMapA, ref);
					//log conflicted
					mergeLog.structureLog.push({
						'uuid': ref,
						versionA: 'reparented',
						versionB: 'removed',
						'result': versionA,
						'isConflicted': true
					});						
				}

				//retain/reparent
				if(typeA === 'retain' && typeB === 'reparentOut') {
					//take change from version A, retain
					mergedChildren.push(ref);
					addSubGraphToD(nodeMapA, ref);
					//log conflicted
					mergeLog.structureLog.push({
						'uuid': ref,
						versionA: 'retained',
						versionB: 'reparented',
						'result': versionA,
						'isConflicted': true
					});						
				}

				if(typeA === 'reparentOut' && typeB === 'retain') {
					//take change from version A, reparent
					reparentLogA[ref] = {
						'from': nodeUuid,
						'to': findReparentIn(nodeMapA, ref)
					};
					addSubGraphToD(nodeMapA, ref);
					//log conflicted
					mergeLog.structureLog.push({
						'uuid': ref,
						versionA: 'reparented',
						versionB: 'retained',
						'result': versionA,
						'isConflicted': true
					});						
				}

				//retain/remove
				if(typeA === 'retain' && typeB === 'remove') {
					if(checkModified(nodeMapA, ref)){
						//take change from version A, retain
						mergedChildren.push(ref);
						addSubGraphToD(nodeMapA, ref);
						//log conflicted
						mergeLog.structureLog.push({
							'uuid': ref,
							versionA: 'changed',
							versionB: 'removed',
							'result': versionA,
							'isConflicted': true
						});							
					}else{
						//remove
						//log merged
						mergeLog.structureLog.push({
							'uuid': ref,
							versionA: 'retained',
							versionB: 'removed',
							'result': versionB,
							'isConflicted': false
						});							
					}
				}

				if(typeA === 'remove' && typeB === 'retain') {
					if(checkModified(nodeMapB, ref)){
						//take change from version A, remove
						//log conflicted
						mergeLog.structureLog.push({
							'uuid': ref,
							versionA: 'removed',
							versionB: 'changed',
							'result': versionA,
							'isConflicted': true
						});							
					}else{
						//remove
						//log merged
						mergeLog.structureLog.push({
							'uuid': ref,
							versionA: 'removed',
							versionB: 'retianed',
							'result': versionA,
							'isConflicted': false
						});							
					}
				}

				//reparent/reparent
				if(typeA === 'reparentOut' && typeB === 'reparentOut'){
					reparentLogA[ref] = {
						'from': nodeUuid,
						'to': findReparentIn(nodeMapA, ref)
					};
					reparentLogB[ref] = {
						'from': nodeUuid,
						'to': findReparentIn(nodeMapB, ref)
					};

					if(reparentLogA[ref].to === reparentLogB[ref].to){
						addSubGraphToD(nodeMapA, ref);				
					}else{
						addSubGraphToD(nodeMapA, ref);
						//log conflicted
						mergeLog.structureLog.push({
							'uuid': ref,
							versionA: 'reparented',
							versionB: 'reparented',
							'result': versionA,
							'isConflicted': true
						});							
					}
				}
			});

			return mergedChildren;
		}
	}

	function stateMerge(id) {
		var nodeA = nodeMapA[id];
		var nodeB = nodeMapB[id];
		var nodeC = nodeMapC[id];
		var mergedState = {};

		if(stateCmp(nodeA, nodeB)){
			return JSON.parse(nodeA.data);
		}
		if(!stateCmp(nodeA, nodeC) && stateCmp(nodeB, nodeC)){
			//log merged
			mergeLog.stateLog.push({
				'uuid': id,
				versionA: 'changed',
				versionB: 'unchanged',
				'result': versionA,
				'isConflicted': false
			});
			return JSON.parse(nodeA.data);
		}
		if(stateCmp(nodeA, nodeC) && !stateCmp(nodeB, nodeC)){
			//log merged
			mergeLog.stateLog.push({
				'uuid': id,
				versionA: 'unchanged',
				versionB: 'changed',
				'result': versionB,
				'isConflicted': false
			});			
			return JSON.parse(nodeB.data);
		}

		var stateLog = {
			'uuid': id,
			versionA: 'changed',
			versionB: 'changed',
			'result': 'compound',
			'isConflicted': false,
			'attrLog': []			
		};
		merge();
		mergeLog.stateLog.push(stateLog);
		
		return mergedState;

		function merge(status) {
			var stateA = JSON.parse(nodeA.data);
			var stateB = JSON.parse(nodeB.data);
			var stateC = JSON.parse(nodeC.data);
			var keys = {};
			var key;

			// keys<- distinct {‘key' in stateA, stateB and stateC}
			for(key in stateA){
				if (stateA.hasOwnProperty(key)){
					keys[key] = true;
				}
			}
			for(key in stateB){
				if (stateB.hasOwnProperty(key)){
					keys[key] = true;
				}
			}
			for(key in stateC){
				if (stateC.hasOwnProperty(key)){
					keys[key] = true;
				}
			}	

			for(key in keys){
				if(keys.hasOwnProperty(key)){
					//unchanged
					if(propCmp(stateA[key], stateC[key]) && propCmp(stateB[key], stateC[key])){
						mergedState[key] = stateA[key];
					}
					//changed
					if(!propCmp(stateA[key], stateC[key]) && propCmp(stateB[key], stateC[key])){
						mergedState[key] = stateA[key];
						//log merged
						stateLog.attrLog.push({
							'key': key,
							versionA: 'changed',
							versionB: 'unchanged',
							'result': versionA,
							'isConflicted': false,
							'value':{
								versionA: stateA[key],
								versionB: stateB[key]
							}
						});
					}
					if(propCmp(stateA[key], stateC[key]) && !propCmp(stateB[key], stateC[key])){
						mergedState[key] = stateB[key];
						//log merged	
						stateLog.attrLog.push({
							'key': key,
							versionA: 'unchanged',
							versionB: 'changed',
							'result': versionB,
							'isConflicted': false,
							'value':{
								versionA: stateA[key],
								versionB: stateB[key]
							}
						});										
					}
					//change to the same state
					if(propCmp(stateA[key], stateB[key]) && !propCmp(stateA[key], stateC[key]) && !propCmp(stateB[key], stateC[key])){
						mergedState[key] = stateA[key];
					}
					//change to the different state
					if(!propCmp(stateA[key], stateB[key]) && !propCmp(stateA[key], stateC[key]) && !propCmp(stateB[key], stateC[key])){
						//take change from version a
						mergedState[key] = stateA[key];
						//log conflicted
						stateLog.attrLog.push({
							'key': key,
							versionA: 'changed',
							versionB: 'changed',
							'result': versionA,
							'isConflicted': true,
							'value':{
								versionA: stateA[key],
								versionB: stateB[key]
							}
						});	
						stateLog.isConflicted = true;
					}					
				}
			}
		}
	}
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
			'scene': scene,
			'versionNum': versionNum
		});
	});
};

exports.merge = function(req, res) {
	var sceneId = req.query.sceneId;
	var versionA = req.query.versionA;
	var versionB = req.query.versionB;
	var versionC = req.query.versionC; // ancestor version
	var nodesA, nodesB, nodesC;

	var merge = function() {

		var options = {
			'nodesA': nodesA,
			'nodesB': nodesB,
			'nodesC': nodesC,
			'versionA': versionA,
			'versionB': versionB,
			'sceneId': sceneId 
		};	
		autoMerge(options, function(err, nodesD, infoMap){
			if(!err){
				var sceneA = getSceneFromNodes(nodesA,sceneId);
				var sceneB = getSceneFromNodes(nodesB,sceneId);
				var mergedScene = getSceneFromNodes(nodesD,sceneId);
				res.send({
					'success': true,
					'sceneA': sceneA,
					'sceneB': sceneB,
					'mergedScene': mergedScene,
					'infoMap': infoMap
				});
			}
		});	

	};

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
};

exports.commit = function(req, res) {
	var preVersions = JSON.parse(req.body.preVersions);
	var sceneGraph = JSON.parse(req.body.scene);
	var sceneId = req.body.sceneId;
	var deltaNodes, nodeMap = {};
	var nodes = getNodesFromScene(sceneGraph);
	var scene;

	if (preVersions.length === 0){//first commit
		//save scene info
		scene = new Scene({
			'uuid': sceneId,
			'name': sceneGraph.object.name,
			'newestVersion': -1
		});

		commit(scene);
		
	}else{
		Scene.findOne({'uuid':sceneId}, function onEnd(err, scene) {
			if(!err){
				commit(scene);
			}
		});
	}


	function saveDeltaNodes(deltaNodes) {
		deltaNodes.forEach(function each(node) {
			SNode.create(node, function onEnd(err){
				if (err){
					console.log("save SNode err! "+ err);
				}
			});
		});		
	}

	function saveRNode(versionNum, preVersions) {
		//build node map of scene graph
		nodes.forEach(function each(node) {
			nodeMap[node.uuid] = node.versionNum;
		});

		RNode.create({
			'sceneId': sceneId,
			'versionNum': versionNum,
			'prevs': preVersions,
			'nodeMap': JSON.stringify(nodeMap)
		}, function onEnd(err) {
			if (err){
				console.log("add scene err "+ err);
			}
		});		
	}

	function commit(scene) {
		getPreVersionNodes(function onEnd(err, preVersionNodes) {
			scene.newestVersion += 1;
			deltaNodes = diff(preVersionNodes, nodes, scene.newestVersion);

			if(deltaNodes.length > 0){
				//save scene info
				scene.name = sceneGraph.object.name;
				scene.save(function( err ){
					if(!err){
						console.log('Scene saved!');
					}
				});

				saveDeltaNodes(deltaNodes);
				saveRNode(scene.newestVersion, preVersions);

				res.send({
					'success': true,
					'versionNum': scene.newestVersion
				});	

			}else{
				console.log("no change to be committed!\n");
				
				res.send({
					'success': false,
					'errInfo': 'no change to be committed'
				});
			}
		});

		function getPreVersionNodes(callback) {
			var count = preVersions.length;
			var allNodes = [];

			//first commit
			if(count === 0){
				callback(null, allNodes);
			}

			preVersions.forEach(function onEach(versionNum){
				retrieveSceneNodes(sceneId, versionNum, function onEach(err, nodes) {
					allNodes = allNodes.concat(nodes);
					count--;
					if(count === 0){
						callback(null, allNodes);
					}
				});
			});
		}
	}
};

//checkOut a branch, tag or a specific version
exports.checkout = function(req, res) {
	var name = req.query['name'];
	var sceneId = req.query['sceneId'];

	function getTagVersionNum(callback) {
		Tag.findOne({
			'sceneId': sceneId,
			'name': name
		}, function onEnd(err, tag) {
			if(!err){
				if(tag){
					callback(tag.versionNum);
				}
				else{
					callback(-1);
				}
			}
		});
	}

	function getBranchVersionNum(callback) {
		Branch.findOne({
			'sceneId': sceneId,
			'name': name
		}, function onEnd(err, branch){
			if(!err){
				if(branch){
					callback(branch.versionNum);
				}else{
					getTagVersionNum(callback);
				}
			}
		});
	}

	getBranchVersionNum(function onEnd(versionNum) {
		if(versionNum === -1){
			versionNum = name;
		}

		retrieveSceneNodes(sceneId, versionNum, function onEnd(err, nodes){

			if(err){
				console.log("retrieve scene err: "+ err);
			}
			if(!err){
				var scene = getSceneFromNodes(nodes, sceneId);

				res.send({
					'success': true,
					'scene': scene,
					'versionNum': versionNum
				});				
			}
		});	
	});
};

exports.addBranch = function(req, res) {
	Branch.create({
		sceneId: req.body['sceneId'],
		name: req.body['name'],
		versionNum: req.body['versionNum'],
		desc: req.body['desc']
	},function onEnd(err, branch){
		if(!err){
			console.log('new branch added '+ branch.name);
			res.send({
				'success':true
			});
		}
	});
};

exports.removeBranch = function(req, res) {
	Branch.findOneAndRemove({
		sceneId: req.body['sceneId'],
		name: req.body['name']
	}, function(err, branch){
		if(!err){
			console.log('branch removed ' + branch.name);
			res.send({
				'success':true
			});			
		}
	});
};

exports.getBranches = function(req, res) {
	Branch.find({
		sceneId: req.query['sceneId']
	}, function(err, branches) {
		if(!err){
			res.send({
				'success': true,
				'tags': branches
			});
		}
	});
};

exports.addTag = function(req, res) {
	Tag.create({
		sceneId: req.body['sceneId'],
		name: req.body['name'],
		versionNum: req.body['versionNum'],
		desc: req.body['desc']
	},function onEnd(err, tag){
		if(!err){
			console.log('new tag added ' + tag.name);
			res.send({
				'success':true
			});			
		}
	});
};

exports.getTags = function(req, res) {
	Tag.find({
		sceneId: req.query['sceneId']
	}, function(err, tags) {
		if(!err){
			res.send({
				'success': true,
				'tags': tags
			});
		}
	});
};

exports.removeTag = function(req, res) {
	Tag.findOneAndRemove({
		sceneId: req.body['sceneId'],
		name: req.body['name']
	}, function(err, tag){
		if(!err){
			console.log('tag removed ' + tag.name);
			res.send({
				'success':true
			});			
		}
	});
};

//get all the versions, branches and tags of the specified scene
exports.getVersionHistory = function(req, res) {
	var sceneId = req.query.sceneId;
	var versions, tags, branches;

	function getAllVersions(callback) {
		RNode.getAllVersions(sceneId, function onEnd(err, result) {
			if(err){
				console.log("get all versions err: "+ err);
			}
			if(!err){
				versions = result.map(function(version){
					version.nodeMap = null;
					return version;
				});
				callback();
			}
		});
	}
	function getAllBranches(callback) {
		Branch.getAllBranches(sceneId, function onEnd(err, result) {
			if(err){
				console.log("get all branches err: "+ err);
			}
			if(!err){
				branches = result;
				getAllVersions(callback);
			}
		});
	} 
	function getAllTags(callback) {
		Tag.getAllBranches(sceneId, function onEnd(err, result) {
			if(err){
				console.log("get all tags err: "+ err);
			}
			if(!err){
				tags = result;
				getAllBranches(callback);
			}
		});
	}

	getAllTags(function() {
		res.send({
			'success': true,
			'versions': versions,
			'branches': branches,
			'tags': tags
		});
	});
};