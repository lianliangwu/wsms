/*global editor, THREE, _*/
var UpdateState = function () {
	"use strict";
	
	function updateObject(object, key, value){
		switch(key){
			case "name":
				setName(object, value);
			break;
			case "position":
				setPosition(object, value);
			break;
			case "rotation":
				setRotation(object, value);
			break;
			case "scale":
				setScale(object, value);
			break;
			default:
			break;
		}

		function setMatrix ( object, matrix ) {
			object.matrix = matrix;
			object.matrix.decompose( object.position, object.quaternion, object.scale );
		}
		function setName ( object, name) {
			object.name = name;
		}
		function setPosition ( object, position ) {
			object.position.x = position.x;
			object.position.y = position.y;
			object.position.z = position.z;
		}
		function setScale ( object, scale ) {
			object.scale.x = scale.x;
			object.scale.y = scale.y;
			object.scale.z = scale.z;
		}
		function setRotation ( object, rotation ) {
			object.rotation.x = rotation.x;
			object.rotation.y = rotation.y;
			object.rotation.z = rotation.z;
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

				editor.addObject( mesh );
				editor.parent(mesh, object.parent);				
				_.each(object.children, function onEach(child) {//bug fix, mesh can be intermediate node.	
					editor.parent(child, mesh);
				});
				
				editor.removeObject(object);
			});
		}
	}
	function updateMaterial(material, key, value){
		switch(key){
			case "color":
				setColor(material, value);
			break;
			default:
			break;
		}

		function setColor (material, color) {
			material.color.setHex(color.getHex());
		}		
	}


	return {
		'updateObject': updateObject,
		'updateGeometry': updateGeometry,
		'updateMaterial': updateMaterial
	};
}();