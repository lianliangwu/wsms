var Engine = function(editor){
	"use strict";
	
	var scene = editor.scene;
	var signals = editor.signals;
	var object = null;

	var getByUuid = function ( uuid ) {
		var scope = this;
		var object = null;

		scene.traverse( function ( child ) {

			if ( child.uuid === uuid ) {

				object = child;
				return;
			}

		} );

		return object;
	};

	this.execute = function( op ){
		switch( op.type ){
		case 0://create node
			editor.addObject( op.node );

			break;
		case 1://update state
			object = getByUuid( op.nodeId );

			if ( object !== null ){
				object[op.key] = op.after; 

				signals.objectChanged.dispatch( object );
			}

			break;
		case 2://update structure
			break;
		default:

			break;
		}
	};

	this.undo = function () {

	};

	this.updateObject = {
		setMatrix: function ( object, matrix ) {
			object.matrix = matrix;
			object.matrix.decompose( object.position, object.quaternion, object.scale );
			signals.objectChanged.dispatch( object );
		},
		setName: function ( object, name) {
			object.name = name;
			signals.objectChanged.dispatch( object );
		}
	};
};