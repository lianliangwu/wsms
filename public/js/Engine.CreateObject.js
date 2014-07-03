/*global THREE, editor*/
var CreateObject = (function () {
	"use strict";

	var objectCount = {};

	function addPrimary(uuid, primaryName){
		switch(primaryName){
			case "Box":
				objectCount['Box'] = objectCount['Box']||1;
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

				editor.addObject( mesh );
				editor.select( mesh );
			break;
			default:
			break;
		}
	}

	function addFromAsset(uuid, assetId){}

	function addFromFile(uuid, fileId){}

	function cloneObject(uuid, object){
		object = object.clone();
		object.uuid = uuid;

		editor.addObject( object );
		editor.select( object );		
	}

	return {
		addPrimary: addPrimary,
		addFromAsset: addFromAsset,
		addFromFile: addFromFile,
		cloneObject: cloneObject
	};
})();