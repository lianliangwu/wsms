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
	var versionNumA = options.versionNumA + '';
	var versionNumB = options.versionNumB + '';
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
			var logItem;
			
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
						var logItem = {
							'uuid': ref,
							'result': versionNumA,
							'isConflicted': false
						};
						logItem[versionNumA] = 'added';

						mergeLog.structureLog.push(logItem);
					}
				}
			});	

			//Cb - Cc
			nodeMapB[nodeUuid].children.forEach(function onEach(ref) {
				if(childMapC[ref] === undefined){
					typeB = getDiffType(ref, childMapB, nodeMapB, childMapC, nodeMapC);
					if(typeB === 'add'){
						mergedChildren.push(ref);
						addSubGraphToD(nodeMapB, ref);
						//log merged
						var logItem = {
							'uuid': ref,
							'result': versionNumB,
							'isConflicted': false
						};
						logItem[versionNumB] = 'added';

						mergeLog.structureLog.push(logItem);	
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
					logItem = {
						'uuid': ref,
						'result': versionNumA,
						'isConflicted': true
					};		
					logItem[versionNumA] = 'removed';
					logItem[versionNumB] = 'reparented';

					mergeLog.structureLog.push(logItem);	
				}

				if(typeA === 'reparentOut' && typeB === 'remove') {
					//take change from version A, reparent
					reparentLogA[ref] = {
						'from': nodeUuid,
						'to': findReparentIn(nodeMapA, ref)
					};
					addSubGraphToD(nodeMapA, ref);
					//log conflicted
					logItem = {
						'uuid': ref,
						'result': versionNumA,
						'isConflicted': true
					};		
					logItem[versionNumA] = 'reparented';
					logItem[versionNumB] = 'removed';

					mergeLog.structureLog.push(logItem);						
				}

				//retain/reparent
				if(typeA === 'retain' && typeB === 'reparentOut') {
					//take change from version A, retain
					mergedChildren.push(ref);
					addSubGraphToD(nodeMapA, ref);
					//log conflicted
					logItem = {
						'uuid': ref,
						'result': versionNumA,
						'isConflicted': true
					};	
					logItem[versionNumA] = 'retained';
					logItem[versionNumB] = 'reparented';

					mergeLog.structureLog.push(logItem);						
				}

				if(typeA === 'reparentOut' && typeB === 'retain') {
					//take change from version A, reparent
					reparentLogA[ref] = {
						'from': nodeUuid,
						'to': findReparentIn(nodeMapA, ref)
					};
					addSubGraphToD(nodeMapA, ref);
					//log conflicted
					logItem = {
						'uuid': ref,
						'result': versionNumA,
						'isConflicted': true
					};	
					logItem[versionNumA] = 'reparented';
					logItem[versionNumB] = 'retained';

					mergeLog.structureLog.push(logItem);						
				}

				//retain/remove
				if(typeA === 'retain' && typeB === 'remove') {
					if(checkModified(nodeMapA, ref)){
						//take change from version A, retain
						mergedChildren.push(ref);
						addSubGraphToD(nodeMapA, ref);
						//log conflicted
						logItem = {
							'uuid': ref,
							'result': versionNumA,
							'isConflicted': true
						};	
						logItem[versionNumA] = 'changed';
						logItem[versionNumB] = 'removed';

						mergeLog.structureLog.push(logItem);							
					}else{
						//remove
						//log merged
						logItem = {
							'uuid': ref,
							'result': versionNumB,
							'isConflicted': false
						};	
						logItem[versionNumA] = 'retained';
						logItem[versionNumB] = 'removed';

						mergeLog.structureLog.push(logItem);							
					}
				}

				if(typeA === 'remove' && typeB === 'retain') {
					if(checkModified(nodeMapB, ref)){
						//take change from version A, remove
						//log conflicted
						logItem = {
							'uuid': ref,
							'result': versionNumA,
							'isConflicted': true
						};	
						logItem[versionNumA] = 'removed';
						logItem[versionNumB] = 'changed';

						mergeLog.structureLog.push(logItem);							
					}else{
						//remove
						//log merged
						logItem = {
							'uuid': ref,
							'result': versionNumA,
							'isConflicted': false
						};
						logItem[versionNumA] = 'removed';
						logItem[versionNumB] = 'retained';

						mergeLog.structureLog.push(logItem);							
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
						logItem = {
							'uuid': ref,
							'result': versionNumA,
							'isConflicted': true
						};
						logItem[versionNumA] = 'reparented';
						logItem[versionNumB] = 'reparented';

						mergeLog.structureLog.push(logItem);							
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
		var stateLogItem;

		if(stateCmp(nodeA, nodeB)){
			return JSON.parse(nodeA.data);
		}
		if(!stateCmp(nodeA, nodeC) && stateCmp(nodeB, nodeC)){
			//log merged
			stateLogItem = {
				'uuid': id,
				'result': versionNumA,
				'isConflicted': false
			};
			stateLogItem[versionNumA] = 'changed';
			stateLogItem[versionNumB] = 'unchanged';

			mergeLog.stateLog.push(stateLogItem);
			return JSON.parse(nodeA.data);
		}
		if(stateCmp(nodeA, nodeC) && !stateCmp(nodeB, nodeC)){
			//log merged
			stateLogItem = {
				'uuid': id,
				'result': versionNumB,
				'isConflicted': false
			};
			stateLogItem[versionNumA] = 'unchanged';
			stateLogItem[versionNumB] = 'changed';

			mergeLog.stateLog.push(stateLogItem);			
			return JSON.parse(nodeB.data);
		}

		var stateLogItem = {
			'uuid': id,
			'result': 'compound',
			'isConflicted': false,
			'attrLog': []			
		};		
		stateLogItem[versionNumA] = 'changed';
		stateLogItem[versionNumB] = 'changed';
		merge();
		mergeLog.stateLog.push(stateLogItem);
		
		return mergedState;

		function merge(status) {
			var stateA = JSON.parse(nodeA.data);
			var stateB = JSON.parse(nodeB.data);
			var stateC = JSON.parse(nodeC.data);
			var keys = {};
			var key;
			var attrLogItem;

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
						attrLogItem = {
							'key': key,
							'result': versionNumA,
							'isConflicted': false
						};
						attrLogItem[versionNumA] = 'changed';
						attrLogItem[versionNumB] = 'unchanged';
						attrLogItem.value = {};
						attrLogItem.value[versionNumA] = stateA[key];
						attrLogItem.value[versionNumB] = stateB[key];						

						stateLogItem.attrLog.push(attrLogItem);
					}
					if(propCmp(stateA[key], stateC[key]) && !propCmp(stateB[key], stateC[key])){
						mergedState[key] = stateB[key];
						//log merged
						attrLogItem = {
							'key': key,
							'result': versionNumB,
							'isConflicted': false
						};
						attrLogItem[versionNumA] = 'unchanged';
						attrLogItem[versionNumB] = 'changed';
						attrLogItem.value = {};
						attrLogItem.value[versionNumA] = stateA[key];
						attrLogItem.value[versionNumB] = stateB[key];


						stateLogItem.attrLog.push(attrLogItem);										
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
						attrLogItem = {
							'key': key,
							'result': versionNumA,
							'isConflicted': true
						};
						attrLogItem[versionNumA] = 'changed';
						attrLogItem[versionNumB] = 'changed';
						attrLogItem.value = {};
						attrLogItem.value[versionNumA] = stateA[key];
						attrLogItem.value[versionNumB] = stateB[key];

						stateLogItem.attrLog.push(attrLogItem);	
						stateLogItem.isConflicted = true;
					}					
				}
			}
		}
	}
};

function getVersionNum(options, callback){
	var name = options.name;
	var sceneId = options.sceneId;

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

		callback&&callback(versionNum);
	});
}

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
			'versionNum': versionNum,
			'branch': undefined
		});
	});
};

exports.merge = function(req, res) {
	var sceneId = req.query.sceneId;
	var versionNameA = req.query.versionA;
	var versionNameB = req.query.versionB;
	var versionNameC = req.query.versionC; // ancestor version
	var versionNumA, versionNumB, versionNumC;
	var nodesA, nodesB, nodesC;

	getVersionNums(function onEnd() {
		retrieveSceneNodes(sceneId, versionNumA, function onEnd(err, nodes) {
			if(!err){
				nodesA = nodes;
				if(nodesA && nodesB && nodesC){
					merge();
				}
			}
		});
		retrieveSceneNodes(sceneId, versionNumB, function onEnd(err, nodes) {
			if(!err){
				nodesB = nodes;
				if(nodesA && nodesB && nodesC){
					merge();
				}
			}
		});
		retrieveSceneNodes(sceneId, versionNumC, function onEnd(err, nodes) {
			if(!err){
				nodesC = nodes;
				if(nodesA && nodesB && nodesC){
					merge();
				}
			}
		});
	});

	//get the latest common ancestor
	function _getLCA() {
		versionNumA = versionNameA;
		versionNumB = versionNameB;
		versionNumC = versionNameC;
	}

	//get the common ancestor, this algorithum assumes that versionNum increases by commiting.
	function getVersionNums(callback) {
		//get versionNumA
		getVersionNum({
			'name': versionNameA,
			'sceneId': sceneId
		}, function onEnd(versionNum){
			versionNumA = versionNum;
			if(versionNumA && versionNumB){
				getLCA();
			}
		});
		//get versionNumB	
		getVersionNum({
			'name': versionNameB,
			'sceneId': sceneId
		}, function onEnd(versionNum){
			versionNumB = versionNum;
			if(versionNumA && versionNumB){
				getLCA();
			}			
		});

		function getLCA(){
			var ancArrayA, ancArrayB;

			if(versionNameC){//if versionNameC exist 
				getVersionNum({
					'name': versionNameC,
					'sceneId': sceneId
				}, function onEnd(versionNum){
					versionNumC = versionNum;
					callback&&callback();
				});
			}else{
				//get all ancestors of versionA 
				getAllAncestors(sceneId, versionNumA, function onEnd(ancArray){
					ancArrayA = ancArray;
					if(ancArrayA && ancArrayB){
						calcLCA(ancArrayA, ancArrayB);
					}
				});
				//get all ancestors of versionB 
				getAllAncestors(sceneId, versionNumB, function onEnd(ancArray){
					ancArrayB = ancArray;
					if(ancArrayA && ancArrayB){
						calcLCA(ancArrayA, ancArrayB);
					}
				});
			}

			//find the biggest common ancestor
			function calcLCA(ancArrayA, ancArrayB) {
				var ancMapA = {};

				//sort by versionNum desc
				ancArrayA.sort(function cmp(a, b){
					return Number(b) - Number(a);
				});

				ancArrayB.sort(function cmp(a, b){
					return Number(b) - Number(a);
				});				

				//build map of ancestor
				ancArrayA.forEach(function onEach(anc) {
					ancMapA[anc] = true;
				});

				for(var i = 0, l = ancArrayB.length; i < l; i++){
					var anc = ancArrayB[i];
					if(ancMapA[anc] === true){
						versionNumC = anc;
						break;
					}
				}

				callback&&callback();
			}
		}

		function getAllAncestors(sceneId, versionNum, callback){
			RNode.findOne({
				'sceneId': sceneId,
				'versionNum': versionNum
			}, function onEnd(err, rNode){
				if(!err){
					if(rNode){
						var ancArray = rNode.path.split(/[()\[\]>]+/);
						callback&&callback(ancArray);						
					}
				}
			});
		}
	}

	//replace versionNum with versionName
	function getMergeInfo(mergeLog) {
		var name = {};
		name[versionNumA] = versionNameA;
		name[versionNumB] = versionNameB;

		mergeLog.stateLog.forEach(function onEach(stateLogItem) {
			stateLogItem[versionNameA] = stateLogItem[versionNumA];
			stateLogItem[versionNameB] = stateLogItem[versionNumB];
			stateLogItem.result = name[stateLogItem.result];

			
			if(stateLogItem.attrLog){
				stateLogItem.attrLog.forEach(function onEach(attrLogItem){
					attrLogItem[versionNameA] = attrLogItem[versionNumA];
					attrLogItem[versionNameB] = attrLogItem[versionNumB];
					attrLogItem.result = name[attrLogItem.result];	
					attrLogItem.value[versionNameA] = attrLogItem.value[versionNumA];
					attrLogItem.value[versionNameB] = attrLogItem.value[versionNumB];			
				});				
			}
		});

		mergeLog.structureLog.forEach(function onEach(structureLogItem) {
			structureLogItem[versionNameA] = structureLogItem[versionNumA];
			structureLogItem[versionNameB] = structureLogItem[versionNumB];
			structureLogItem.result = name[structureLogItem.result];
		});

		return mergeLog;
	}

	function merge() {

		var options = {
			'nodesA': nodesA,
			'nodesB': nodesB,
			'nodesC': nodesC,
			'versionNumA': versionNumA,
			'versionNumB': versionNumB,
			'sceneId': sceneId 
		};	
		autoMerge(options, function(err, nodesD, mergeLog){
			if(!err){
				var sceneA = getSceneFromNodes(nodesA,sceneId);
				var sceneB = getSceneFromNodes(nodesB,sceneId);
				var mergedScene = getSceneFromNodes(nodesD,sceneId);

				res.send({
					'success': true,
					'sceneA': sceneA,
					'sceneB': sceneB,
					'versionNumA': versionNumA,
					'versionNumB': versionNumB,
					'mergedScene': mergedScene,
					'mergeLog': getMergeInfo(mergeLog)
				});
			}
		});	
	}
};

exports.commit = function(req, res) {
	var preVersions = JSON.parse(req.body.preVersions);
	var sceneGraph = JSON.parse(req.body.scene);
	var branchName = req.body.branch;
	var sceneId = req.body.sceneId;
	var deltaNodes, nodeMap = {};
	var nodes = getNodesFromScene(sceneGraph);
	var scene, branch;

	if (preVersions.length === 0){//first commit
		//save scene info
		scene = new Scene({
			'uuid': sceneId,
			'name': sceneGraph.object.name,
			'newestVersion': -1
		});

		//create master branch here
		branchName = 'master';
		branch = new Branch({
			'sceneId': sceneId,
			'name': branchName,
			'versionNum': "-1",
			'desc': 'default branch'
		});

		commit();
		
	}else{
		Scene.findOne({'uuid':sceneId}, function onEnd(err, result) {
			if(!err){
				scene = result;
				// get branch here
				Branch.findOne({
					'name': branchName,
					'sceneId': sceneId
				}, function onEnd(err, result) {
					if(!err){
						branch = result;
						commit();
					}
				});
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

		var rNode = new RNode({
			'sceneId': sceneId,
			'versionNum': versionNum,
			'prevs': preVersions,
			'nodeMap': JSON.stringify(nodeMap)
		});

		RNode.saveWithPath(rNode, function onEnd(err) {
			if(!err){
				console.log('rNode saved' );
			}
		});
	}

	function commit() {
		getPreVersionNodes(function onEnd(err, preVersionNodes) {
			scene.newestVersion += 1;
			deltaNodes = diff(preVersionNodes, nodes, scene.newestVersion + '');

			if(deltaNodes.length > 0){
				//save scene info
				scene.name = sceneGraph.object.name;
				scene.save(function( err ){
					if(!err){
						console.log('Scene saved!');
					}
				});

				//save branch here.
				branch.versionNum = scene.newestVersion;
				branch.save(function( err ){
					if(!err){
						console.log('branch saved!');
					}
				});

				saveDeltaNodes(deltaNodes);
				saveRNode(scene.newestVersion, preVersions);

				res.send({
					'success': true,
					'versionNum': scene.newestVersion,
					'branch': branchName
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

exports.removeVersion = function (req, res) {
	var sceneId = req.body.sceneId;
	var versionNum = req.body.versionNum;

	function removeSNodes (nodeMap, versionNum) {
		for(var uuid in nodeMap){
			if(nodeMap.hasOwnProperty(uuid)){
				if(nodeMap[uuid] === versionNum){
					SNode.findOneAndRemove({
						'uuid': uuid,
						'versionNum': versionNum
					}, (function (uuid) {
							return function onEnd(err) {
								if(!err){
									console.log('snode removed uuid ' + uuid + ' versionNum ' + versionNum);
								}
							};
						})(uuid)
					);
				}
			}
		}
	}

	function remove (sceneId, versionNum, callback) {
		RNode.findOne({
			'sceneId': sceneId,
			'versionNum': versionNum
		}, function onEnd(err, rNode) {
			if(!err){
				var nodeMap = JSON.parse(rNode.nodeMap);

				//remove all related snodes
				removeSNodes(nodeMap, versionNum);

				rNode.remove(function onEnd(err){
					if(!err){
						console.log('rnode removed sceneId ' + sceneId + ' versionNum ' + versionNum);
						callback&&callback();
					}
				});
				
			}
		});
	}

	remove(sceneId, versionNum, function onEnd() {
		console.log('version removed sceneId ' + sceneId + 'versionNum' + versionNum);
		res.send({
			'success': true,
			'sceneId': sceneId,
			'versionNum': versionNum
		});
	});
};

//checkOut a branch, tag or a specific version
exports.checkout = function(req, res) {
	var name = req.query['name'];
	var sceneId = req.query['sceneId'];

	function isBranch(name, sceneId, callback) {
		Branch.findOne({
			'sceneId': sceneId,
			'name': name
		}, function onEnd(err, result) {
			if(!err){
				if(result){
					callback(null, true);
				}else{
					callback(null, false);
				}
			}
		});
	}

	getVersionNum({
		'name': name,
		'sceneId': sceneId
	}, function onEnd(versionNum) {

		retrieveSceneNodes(sceneId, versionNum, function onEnd(err, nodes){
			if(!err){
				var scene = getSceneFromNodes(nodes, sceneId);

				isBranch(name, sceneId, function onEnd(err, boo) {
					var branchName;
					if(!err){
						if(boo){
							branchName = name;
						}
					}
					res.send({
						'success': true,
						'scene': scene,
						'versionNum': versionNum,
						'branch': branchName
					});									
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
		Tag.getAllTags(sceneId, function onEnd(err, result) {
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
		var nodes = [], edges = [];   
		var nodeMap = {};           

		//build nodes and edges array for drawing
		var build = function() {
			versions.forEach(function onEach(version) {
				//nodes
				var node = {
					'id': version.versionNum,
					'label': version.versionNum,
					'type': 'version'
				};
				nodes.push(node);
				nodeMap[node.id] = node;

				//edges
				var prevs = version.prevs;
				prevs.forEach(function onEach(prev){
					edges.push({
						'v': version.versionNum,
						'u': prev
					});
				});
			});

			branches.forEach(function onEach(branch) {
				var id = branch.versionNum;
				nodeMap[id].branches = nodeMap[id].branches || [];
				nodeMap[id].branches.push(branch.name);
			});	

			tags.forEach(function onEach(tag) {
				var id = tag.versionNum;
				nodeMap[id].tags = nodeMap[id].tags || [];
				nodeMap[id].tags.push(tag.name);
			});				
		};

		build();
		res.send({
			'success': true,
			'nodes': nodes,
			'edges': edges
		});
	});
};