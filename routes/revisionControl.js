/*
 * wzhscript 2014.4.18
**/
var Scene = require('../models/scene.js');
var SNode = require('../models/sNode.js');
var RNode = require('../models/rNode.js');
var maps = ['map', 'bumpMap', 'lightMap', 'normalMap', 'specularMap', 'envMap'];

function isArray(obj) {   
  return Object.prototype.toString.call(obj) === '[object Array]';    
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
		if( object.children !== undefined){
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
		addNode(e, 'texture');
	});

	return nodes;
};

/**
 * update node in nodesB with the right versionNum
 * return the delta nodes
 */
var diff = function(nodesA, nodesB, versionNum) {
	var mapA = {};
	var deltaNodes = [];

	var cmp = function(nodeA, nodeB) {
		var str1 = nodeA.data;
		var str2 = nodeB.data;

		return str1 === str2 ? true : false;
	};

	//build node map
	nodesA.forEach(function each(e) {
		if(mapA[e.uuid] === undefined){
			mapA[e.uuid] = {};
		}
		mapA[e.uuid][e.versionNum] = e;
	});

	nodesB.forEach(function each(node) {
		var versionMap = mapA[node.uuid];
		var isChanged;

		if( versionMap === undefined){
			node.versionNum = versionNum;
			deltaNodes.push(node);
		}else{
			isChanged = true;

			//compare with each version 
			for(var key in versionMap){
				if(versionMap.hasOwnProperty(key)){

					if(cmp(node,versionMap[key])){
						node.versionNum = key;
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
var retrieveSceneNodes = function(sceneId, versionNums, callback) {
	var nodes = [];
	var count = 0;

	if(!isArray(versionNums)){
		versionNums = [versionNums];
	}
	
	var retrieveNodes = function(err, rNode){
		var nodeMap = JSON.parse(rNode.nodeMap);
		var uuid;

		var result = function(err, node) {
			if (err){
				console.log("find snode err "+ err);
			}

			nodes.push(node);
			count--;

			if(count === 0){// finish when no I/O request exists
				callback&&callback(null, nodes);
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
	};

	versionNums.forEach(function onEach(versionNum){
		RNode.findOne({
			'sceneId': sceneId,
			'versionNum': versionNum
		},retrieveNodes);		
	});

};

var threeWayMerge = function(options, callback) {
	var nodeMapA = {}, nodeMapB = {}, nodeMapC = {};
	var nodesD = [];
	var ids = [];
	var infoMap = {};
	var currentLog;
	var nodesA = options.nodesA;
	var nodesB = options.nodesB;
	var nodesC = options.nodesC;
	var versionA = options.strA;
	var versionB = options.strB;
	var log;

	var nodeCmp = function(nodeA, nodeB) {
		var str1 = nodeA.data;
		var str2 = nodeB.data;

		return str1 === str2 ? true : false;
	};	
	var valueCmp = function(keyA, keyB){
		var str1 = String(keyA);
		var str2 = String(keyB);

		return str1 === str2 ? true : false;
	};

	var dependencyMerge = function(nodeA, nodeB, nodeC, nodeD) {
		var refMapA = {}, refMapB = {}, refMapC = {};
		var childrenA = nodeA.children;
		var childrenB = nodeB.children;
		var childrenC = nodeC.children;
		var childrenD = nodeD.children;
		var log;

		//check if the subgraph has been modified, comparing with version C 
		var checkModified = function(nodeMap, uuid) {
			if(nodeCmp(nodeMap[uuid], nodeMapC[uuid])){
				var node = JSON.parse(nodeMap[uuid].data);
				var nodeC = JSON.parse(nodeMapC[uuid].data);

				//object 
				var children = node.children;
				if(children !== undefined){
					children.forEach(function onEach(ref) {
						if(checkModified(nodeMap, ref)){
							return true;
						}
					});
				}
				// geometry, material and texture 
				if(node.type === 'Mesh'){
					if(!nodeCmp(nodeMap[node.geometry], nodeMapC[node.geometry])){
						return true;
					}
					if(!nodeCmp(nodeMap[node.material], nodeMapC[node.material])){
						return true;
					}

					//texture diff
					var material = JSON.parse(nodeMap[node.material].data);
					maps.forEach(function (map){
						var ref = material[map];
						if(ref !== undefined){
							if(!nodeCmp(nodeMap[ref], nodeMapC[ref])){
								return true;
							}
						}
					});
				}

				return false;
			}
				return true;
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
			if (refMapC[ref] === undefined){// case 5
				childrenD.push(ref);
				// merge log
				log = {
					'uuid':ref,
					'result': versionA,
					'type': 'merged'
				};
				log[versionA] = 'added';
				log[versionB] = 'unchanged';

				currentLog.subScene.push(log);
				currentLog.isMerged = true;
			}
		});
		childrenB.forEach(function onEach(ref) {
			if ( refMapC[ref] === undefined){// case 6
				childrenD.push(ref);
				// merge log
				log = {
					'uuid':ref,
					'result': versionB,
					'type': 'merged'
				};
				log[versionA] = 'unchanged';
				log[versionB] = 'added';	
							
				currentLog.subScene.push(log);	
				currentLog.isMerged = true;			
			}
		});
		childrenC.forEach(function onEach(ref) {

			if ( refMapA[ref] === undefined && refMapB[ref]){// case 2
				if(checkModified(nodeMapB, ref)){
					//log conflict
					//default choice
					log = {
						'uuid':ref,
						'result': versionA,
						'type': 'conflicted'
					};
					log[versionA] = 'removed';
					log[versionB] = 'changed';

					currentLog.subScene.push(log);	
					currentLog.isConflicted = true;
				}else{
					//log merge
					//removed by A
					log = {
						'uuid':ref,
						'result': versionA,
						'type': 'merged'
					};
					log[versionA] = 'removed';
					log[versionB] = 'unchanged';	

					currentLog.subScene.push(log);	
					currentLog.isMerged = true;
				}
			}
			if( refMapB[ref] === undefined && refMapA[ref]){// case 3
				if(checkModified(nodeMapA, ref)){
					//log conflict
					childrenD.push(ref);//default choice

					log = {
						'uuid':ref,
						'result': versionA,
						'type': 'conflicted'
					};
					log[versionA] = 'changed';
					log[versionB] = 'removed';					
					currentLog.subScene.push(log);	
					currentLog.isConflicted = true;
				}else{
					//log merge
					log = {
						'uuid':ref,
						'result': versionA,
						'type': 'merged'
					};
					log[versionA] = 'unchanged';
					log[versionB] = 'removed';
					currentLog.subScene.push(log);	
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
		var key;
		var log;

		// keys<- distinct {‘key' in nodeA, nodeB and nodeC}
		for(key in nodeA){
			if (nodeA.hasOwnProperty(key) && ( keys[key] === undefined)){
				keys[key] = true;
			}
		}
		for(key in nodeB){
			if (nodeB.hasOwnProperty(key) && ( keys[key] === undefined)){
				keys[key] = true;
			}
		}
		for(key in nodeC){
			if (nodeC.hasOwnProperty(key) && ( keys[key] === undefined)){
				keys[key] = true;
			}
		}

		for(key in keys){
			if(keys.hasOwnProperty(key)){
				if (valueCmp(nodeA[key], nodeB[key])){// case 1 , 2
					nodeD[key] = nodeA[key];
				}else if(valueCmp(nodeB[key], nodeC[key])){// case 3
					if(key === 'children'){
						nodeD.children = [];
						dependencyMerge(nodeA, nodeB, nodeC, nodeD);
					}else{
						nodeD[key] = nodeA[key];

						log = {
							'key':key,
							'result': versionA,
							'type': 'merged'
						};
						log[versionA] = 'changed';
						log[versionB] = 'unchanged';						
						currentLog.attrLog.push(log);
						currentLog.isMerged = true;
					}
				}else if(valueCmp(nodeA[key], nodeC[key])){// case 4
					if(key === 'children'){
						nodeD.children = [];
						dependencyMerge(nodeA, nodeB, nodeC, nodeD);
					}else{
						nodeD[key] = nodeB[key];

						log = {
							'key':key,
							'result': versionB,
							'type': 'merged'
						};
						log[versionA] = 'unchanged';
						log[versionB] = 'changed';

						currentLog.attrLog.push(log);
						currentLog.isMerged = true;
					}					
				}else{// case 5
					if(key === 'children'){
						nodeD.children = [];
						dependencyMerge(nodeA, nodeB, nodeC, nodeD);
					}else{
						nodeD[key] = nodeA[key];// default choice

						log = {
							'key':key,
							'result': versionA,
							'type': 'conflicted'
						};
						log[versionA] = 'changed';
						log[versionB] = 'changed';

						currentLog.attrLog.push(log);
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
	//nodesD <- (A - C)U(B - C)U(C - A)U(C - B)
	nodesA.forEach(function onEach(node) {
		var uuid = node.uuid;

		if ( nodeMapB[uuid] !== undefined){
			ids.push(uuid);
		}
		if ( nodeMapC[uuid] === undefined){
			nodesD.push(node);
		}
	});

	nodesB.forEach(function onEach(node){
		var uuid = node.uuid;
		if ( nodeMapC[uuid] === undefined){
			nodesD.push(node);
		}
	});

	nodesC.forEach(function onEach(node){
		var uuid = node.uuid;
		if(nodeMapA[uuid] === undefined && nodeMapB[uuid] !== undefined){
			nodesD.push(node);
		}
		if(nodeMapA[uuid] !== undefined && nodeMapB[uuid] === undefined){
			nodesD.push(node);
		}
	});

	ids.forEach(function onEach(id){
		infoMap[id] = {
			isMerged: false,
			isConflicted: false,
			nodeLog:{},
			attrLog:[],
			subScene:[]
		};
		currentLog = infoMap[id];

		if(nodeCmp(nodeMapA[id], nodeMapB[id])){// case 1 and 2
			nodesD.push(nodeMapA[id]);
		}else if(nodeCmp(nodeMapB[id], nodeMapC[id])){// case 3
			nodesD.push(attrMerge(id));
			//merge log
			currentLog.nodeLog = {
				'uuid': id,
				'result': versionA
			};
			currentLog.nodeLog[versionA] = 'changed';
			currentLog.nodeLog[versionB] = 'unchanged';	

		}else if(nodeCmp(nodeMapA[id], nodeMapC[id])){// case 4
			nodesD.push(attrMerge(id));
			//merge log
			currentLog.nodeLog = {
				'uuid': id,
				'result': versionB
			};
			currentLog.nodeLog[versionA] = 'unchanged';
			currentLog.nodeLog[versionB] = 'changed';			
		}else{// case 5
			nodesD.push(attrMerge(id));
			//merge log
			currentLog.nodeLog = {
				'uuid': id
			};
			currentLog.nodeLog[versionA] = 'changed';
			currentLog.nodeLog[versionB] = 'changed';	

			//check the result type
			var result;
			currentLog.attrLog.forEach(function onEach(attrLog) {
				if(result === undefined){
					result = attrLog.result;
				}else if( result !== attrLog.result){
					result = 'compund';
				}
			});
			if(result !== 'compund'){
				currentLog.subScene.forEach(function onEach(subScene) {
					if( result !== subScene.result){
						result = 'compund';
					}
				});				
			}

			currentLog.nodeLog.result = result;			
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
			strA: 'Version' + versionA,
			strB: 'Version' + versionB
		};
		threeWayMerge(options, function(err, nodesD, infoMap){
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
	var scene = JSON.parse(req.body.scene);
	var sceneId = req.body.sceneId;

	var nodes = getNodesFromScene(scene);
	var deltaNodes, nodeMap = {};

	if (preVersions.length === 0){//first commit
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


			retrieveSceneNodes(sceneId, preVersions, function onEnd(err, preVersionNodes) {
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
						'prevs': preVersions,
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
};
