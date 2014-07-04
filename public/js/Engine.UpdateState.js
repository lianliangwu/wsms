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