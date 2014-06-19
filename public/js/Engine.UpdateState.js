var UpdateState = function () {
	"use strict";
	

	return {
		setMatrix: function ( object, matrix ) {
			object.matrix = matrix;
			object.matrix.decompose( object.position, object.quaternion, object.scale );
		},
		setName: function ( object, name) {
			object.name = name;
		},
		setPosition: function ( object, position ) {
			object.position.x = position.x;
			object.position.y = position.y;
			object.position.z = position.z;
		},
		setScale: function ( object, scale ) {
			object.scale.x = scale.x;
			object.scale.y = scale.y;
			object.scale.z = scale.z;
		},
		setRotation: function ( object, rotation ) {
			object.rotation.x = rotation.x;
			object.rotation.y = rotation.y;
			object.rotation.z = rotation.z;
		}
	};
}();

	// this.updateObject = {
	// 	setMatrix: function ( object, matrix ) {
	// 		object.matrix = matrix;
	// 		object.matrix.decompose( object.position, object.quaternion, object.scale );
	// 		signals.objectChanged.dispatch( object );
	// 	},
	// 	setName: function ( object, name) {
	// 		object.name = name;
	// 		signals.objectChanged.dispatch( object );
	// 	}
	// };