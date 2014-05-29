/*global Ajax, THREE*/
var RevisionControl = function (editor) {
	"use strict";

	var signals = editor.signals;
	var commitable = true;
	var maps = ['map', 'bumpMap', 'lightMap', 'normalMap', 'specularMap', 'envMap'];

	//get a loadable JSON scene data from WSG
	var getThreeSG = function (scene) {
		var geometries = scene.geometries;
		var materials = scene.materials;
		var textures = scene.textures;
		var geoIndex = {}, matIndex = {}, textureMap = {};
		var tempGeometry = {
			"uuid": null,
			"type": "BoxGeometry",
			"width": 1,
			"height": 1,
			"depth": 1,
			"widthSegments": 1,
			"heightSegments": 1,
			"depthSegments": 1
		};

		var setGeometryNode = function (object) {
			var uuid = object.geometry;
			var geometry = geometries[geoIndex[uuid]];

			if(typeof geometry.assetId !== 'undefined'){
				
				object.userData.assets.geometry = geometry.assetId;

				//set a temporary box geometry
				geometry = JSON.parse(JSON.stringify(tempGeometry));
				geometry.uuid = uuid;
				geometries[geoIndex[uuid]] = geometry;
			}
		};

		var setMaterialNode = function(object) {
			var uuid = object.material;
			var material = materials[matIndex[uuid]];

			maps.forEach(function each(type){
				
				if (typeof material[type] !== 'undefined'){
					var texture = textureMap[material[type]];

					object.userData.assets[type] = texture;

					delete material[type];
				}
			});
		};

		var setAssets = function(object) {
			var children = object.children;
			var i, l, temp;

			//check if object is a mesh
			if (typeof object.geometry !== 'undefined'){
				object.userData = {};
				object.userData.assets = {};

				setGeometryNode(object);
				setMaterialNode(object);
			}

			
			if(typeof children !== 'undefined'){
				for(i = 0, l = children.length; i < l ; i++){
					temp = children[i];
					setAssets(temp);
				}
			}
		};

		//build geometry index map
		var i, l, temp;
		for(i = 0, l = geometries.length; i < l; i++){
			temp = geometries[i];
			geoIndex[temp.uuid] = i;
		}

		//build material index map
		for(i = 0, l = materials.length; i < l; i++){
			temp = materials[i];
			matIndex[temp.uuid] = i;
		}

		//build texture map
		for(i = 0, l = textures.length; i < l; i++){
			temp = textures[i];
			textureMap[temp.uuid] = temp;
		}

		//add assets into userData		
		setAssets(scene.object);
		delete scene.textures;

		return scene;
	};
	//get wsms SG from current scene
	var getEJOS = function(scene) {
		var exporter = new THREE.ObjectExporter();
		scene = exporter.parse(scene);
		var geometries = scene.geometries;
		var materials = scene.materials;
		var textures = [];
		var geoMap = {}, matMap = {}, meshMap = {};


		//build geometry map
		var i, l, temp;
		if(geometries){
			for(i = 0, l = geometries.length; i < l; i++){
				temp = geometries[i];
				geoMap[temp.uuid] = temp;
			}
		}

		//build material map
		if(materials){
			for(i = 0, l = materials.length; i < l; i++){
				temp = materials[i];
				matMap[temp.uuid] = temp;
			}
		}

		var setGeometryNode = function(mesh, assetId) {
			var geometry = geoMap[mesh.geometry];
			geometry.data = {};
			geometry.assetId = assetId;
		};

		var setMaterialNode = function(mesh, type, texture) {
			var material = matMap[mesh.material];
			material[type] = texture.uuid;
			textures.push(texture);
		};	

		//handle the assets info in userData
		var handlUserData = function(object) {
			var i, l, children;
			children = object.children;

			if(object.userData !== undefined){
				var assets = object.userData.assets;

				if(assets !== undefined){
					for ( var type in assets ) {
						if (assets.hasOwnProperty(type)){
							switch(type){
								case 'geometry':
									setGeometryNode(object, assets[type]);
								break;
								default:
									setMaterialNode(object, type, assets[type]);
								break;
							}
						}
					}
					delete object.userData.assets;					
				}

				delete object.userData;
			}
			if(children !== undefined){
				for(i = 0, l = children.length; i < l; i++){
					handlUserData(children[i]);
				}
			}
		};
		handlUserData(scene.object);

		scene.textures = textures;
		return scene;
	};

	var retrieve = function(sceneId, versionNum, callback) {
		var params = {
			'sceneId': sceneId,
			'versionNum': versionNum
		};

		Ajax.getJSON({
			'url': 'retrieve',
			'params': params
		}, function onEnd(err, result) {
			var scene = result.scene;

			scene = getThreeSG(scene);
			var loader = new THREE.ObjectLoader();
			scene = loader.parse( scene );

			scene.userData.currentVersion = versionNum;
			scene.userData.branch = result.branch;
			callback(null, scene);
		});		
	};

	var commit = function(scene, preVersions) {

		if(!commitable){
			alert("committing!");
			console.log("committing!");
			return;
		}
		//prevent user from committing
		commitable = false; 

		var wsg = getEJOS(scene);

		var params = {
			'sceneId': wsg.object.uuid,
			'preVersions': JSON.stringify(preVersions),
			'branch': scene.userData.branch,
			'scene': JSON.stringify(wsg)
		};

		Ajax.post({
			'url': 'commit',
			'params': params
		}, function onEnd(err, result) {
			scene.userData.currentVersion = result.versionNum;
			scene.userData.branch = result.branch;
			commitable = true; // allow for committing
		});
	};

	var commitBranch = function(scene) {
		if(scene.userData.currentVersion && scene.userData.branch === undefined){
			alert("please checkout to a branch and commit!");
			console.log("please checkout to a branch and commit!");
			return;
		}

		var preVersions = [];
		if( scene.userData.currentVersion >= 0){
			preVersions.push(scene.userData.currentVersion);
		}

		commit(scene, preVersions);
	};

	var commitMerge = function(options) {
		var sceneA = options.sceneA;
		var sceneB = options.sceneB;
		var mergedScene = options.mergedScene;
		var preVersions = [];

		preVersions.push(sceneA.userData.currentVersion);
		preVersions.push(sceneB.userData.currentVersion);

		//TODO: branch name is to be from sceneA.userData.branch. 
		//		this need to be done after mergeBranch has been implemented.
		mergedScene.userData.branch = 'master';
		commit(mergedScene, preVersions);
	};

	var removeVersion = function(options, callback) {
		var params = {
			'versionNum': options.versionNum,
			'sceneId': editor.scene.uuid
		};

		Ajax.post({
			'url': 'removeVersion',
			'params': params
		}, callback);

	};

	var threeWayMerge = function(sceneId, versionA, versionB, versionC, callback) {
		var params = {
			'sceneId': sceneId,
			'versionA': versionA,
			'versionB': versionB,
			'versionC': versionC
		};

		Ajax.getJSON({
			'url': 'merge',
			'params': params
		}, function onEnd(err, result) {
			var loader = new THREE.ObjectLoader();
			var scene;

			scene = getThreeSG(result.sceneA);
			result.sceneA = loader.parse( scene );
			result.sceneA.userData.currentVersion = result.versionNumA;
			

			scene = getThreeSG(result.sceneB);
			result.sceneB = loader.parse( scene );		
			result.sceneB.userData.currentVersion = result.versionNumB;	

			scene = getThreeSG(result.mergedScene);
			result.mergedScene = loader.parse( scene );
			
			callback(null, result);
		});
	};

	var mergeToTrunck = function(scene, versionB, callback) {
		// threeWayMerge(scene.uuid, scene.userData.currentVersion, versionB, callback);
	}

	var checkout = function(options, callback) {
		var params = {
			'name': options.name,
			'sceneId': editor.scene.uuid
		};

		Ajax.getJSON({
			'url': 'checkout',
			'params': params
		}, function onEnd(err, result) {
			var scene = result.scene;

			scene = getThreeSG(scene);
			var loader = new THREE.ObjectLoader();
			scene = loader.parse( scene );

			scene.userData.currentVersion = result.versionNum;
			scene.userData.branch = result.branch;
			callback(null, scene);
		});
	};

	var addBranch = function(options, callback) {
		var params = {
			'name': options.name,
			'desc': options.desc,
			'sceneId': editor.scene.uuid,
			'versionNum': editor.scene.userData.currentVersion
		};

		Ajax.post({
			'url': 'addBranch',
			'params': params
		}, callback);
	};

	var getBranches = function(options, callback) {
		var params = {
			'sceneId': options.sceneId
		};

		Ajax.getJSON({
			'url': 'getBranches',
			'params': params
		}, callback);
	};

	var removeBranch = function(options, callback) {
		var params = {
			'name': options.name,
			'sceneId': editor.scene.uuid
		};

		Ajax.post({
			'url': 'removeBranch',
			'params': params
		}, callback);
	};

	var addTag = function(options, callback) {
		var params = {
			'name': options.name,
			'desc': options.desc,
			'sceneId': editor.scene.uuid,
			'versionNum': editor.scene.userData.currentVersion
		};

		Ajax.post({
			'url': 'addTag',
			'params': params
		}, callback);
	};

	var getTags = function(options, callback) {
		var params = {
			'sceneId': options.sceneId
		};

		Ajax.getJSON({
			'url': 'getTags',
			'params': params
		}, callback);		
	};

	var removeTag = function(options, callback) {
		var params = {
			'name': options.name,
			'sceneId': editor.scene.uuid
		};

		Ajax.post({
			'url': 'removeTag',
			'params': params
		}, callback);		
	};

	this.retrieve = retrieve;
	this.commit = commitBranch;
	this.commitMerge = commitMerge;
	this.merge = threeWayMerge;
	this.checkout = checkout;
	this.removeVersion = removeVersion;
	this.addBranch = addBranch;
	this.removeBranch = removeBranch;
	this.getBranches = getBranches;
	this.addTag = addTag;
	this.getTags = getTags;
	this.removeTag = removeTag;
};