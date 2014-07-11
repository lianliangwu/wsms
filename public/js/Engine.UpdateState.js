/*global editor, THREE, _*/
var UpdateState = function () {
	"use strict";

	function setValue (target, key, value) {
		if(typeof value === "string" || typeof value === "number" || typeof value === "boolean"){
			target[key] = value;
		}else if(value instanceof THREE.Vector3){
			target[key].x = value.x;
			target[key].y = value.y;
			target[key].z = value.z;
		}else if(value instanceof THREE.Color){
			target[key].setHex(value.getHex());
		}
	}
	
	function updateObject(object, key, value){
		//if key === name then
		if(key === "name"){
			object.name = value;
			return;
		}

		switch(key){
			case "matrix":
				setMatrix(object, value);
			break;
			default:
				setValue(object, key, value);
			break;
		}

		function setMatrix ( object, matrix ) {
			object.matrix = matrix;
			object.matrix.decompose( object.position, object.quaternion, object.scale );
		}
	}

	function updateGeometry(geometry, key, value){
		//if key === name then
		if(key === "name"){
			geometry.name = value;
			return;
		}
		//get geometry type
		var type = editor.getGeometryType(geometry);
		//get geometry by type
		var newGeometry = getGeometry(type, geometry, key, value);
		//update related objects
		updateObjects(newGeometry);

		function getGeometry(type, oldGeo, key, value){
			var newGeo;
			switch(type){
				case "BoxGeometry":
					var options = {
						width: oldGeo.width,
						height: oldGeo.height,
						depth: oldGeo.depth,
						widthSegments: oldGeo.widthSegments,
						heightSegments: oldGeo.heightSegments,
						depthSegments: oldGeo.depthSegments
					};
					options[key] = value;
					newGeo = new THREE.BoxGeometry(
						options.width,
						options.height,
						options.depth,
						options.widthSegments,
						options.heightSegments,
						options.depthSegments
					);
					newGeo.uuid = oldGeo.uuid;

					newGeo.computeBoundingSphere();
				break;
				default:
				break;
			}
			return newGeo;
		}
		function updateObjects(geometry){
			var allRefs = editor.refManager.allRefs(geometry.uuid);

			_.forEach(allRefs, function(ref){
				var object = editor.getObjectByUuid(ref);

				//change the mesh with new geometry and old material
				geometry.uuid = object.geometry.uuid;
				var mesh = new THREE.Mesh( geometry, object.material );
				mesh.name = object.name;
				mesh.applyMatrix(object.matrix);
				mesh.uuid = object.uuid;
				mesh.userData = object.userData;

				editor.parent(mesh, object.parent);				
				_.each(object.children, function onEach(child) {//bug fix, mesh can be intermediate node.	
					editor.parent(child, mesh);
				});
				
				editor.removeObject(object);
				editor.addObject( mesh );
				editor.select(mesh);
			});
		}
	}

	function updateMaterial(material, key, value){


		switch(key){
			default:
				setValue(material, key, value);
			break;
		}
	}


	return {
		'updateObject': updateObject,
		'updateGeometry': updateGeometry,
		'updateMaterial': updateMaterial
	};
}();