/*global THREE, editor*/
var CreateObject = (function () {
	"use strict";

	var objectCount = {};

	function addPrimary(uuid, primaryName, parent){
		switch(primaryName){
			case "Object3D":
				objectCount['Object3D'] = objectCount['Object3D']||0;

				var mesh = new THREE.Object3D();
				mesh.name = 'Object3D ' + ( ++ objectCount['Object3D'] );
				mesh.uuid = uuid;

				addToParent(mesh, parent);
			break;
			case "Box":
				objectCount['Box'] = objectCount['Box']||0;
				var width = 100;
				var height = 100;
				var depth = 100;

				var widthSegments = 1;
				var heightSegments = 1;
				var depthSegments = 1;

				var geometry = new THREE.BoxGeometry( width, height, depth, widthSegments, heightSegments, depthSegments );
				var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
				mesh.name = 'Box ' + ( ++ objectCount['Box'] );
				mesh.uuid = uuid;

				addToParent(mesh, parent);
			break;
			case "PointLight":
				objectCount['PointLight'] = objectCount['PointLight']||0;
				var color = 0xffffff;
				var intensity = 1;
				var distance = 0;

				var light = new THREE.PointLight( color, intensity, distance );
				light.name = 'PointLight ' + ( ++ objectCount['PointLight'] );
				light.uuid = uuid;

				addToParent(light, parent);
			break;						
			default:
			break;
		}
	}

	function addFromAsset(uuid, assetId, parent){}

	function addFromFile(uuid, fileId, parent){}

	function cloneObject(uuid, object, parent){
		object = object.clone();
		object.uuid = uuid;

		addToParent(object, parent);
	}

	function addToParent(object, parent){
		editor.addObject( object );
		editor.parent(parent);
		editor.select( object );
	}

	return {
		addPrimary: addPrimary,
		addFromAsset: addFromAsset,
		addFromFile: addFromFile,
		cloneObject: cloneObject,
		addObject: addToParent
	};
})();