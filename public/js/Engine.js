var Engine = (function(){
	"use strict";
	var scene = null;
	var signals = null;
	var object = null;

	function Engine (editor) {
		scene = editor.scene;
		signals = editor.signals;
	}

	Engine.prototype.execOp = function(op){

	};
	Engine.prototype.undoOp = function(){};
	Engine.prototype.redoOp = function(){};
	Engine.prototype.replay = function(){};

	return Engine;
})();
// var Engine = function(editor){

// 	var scene = editor.scene;
// 	var signals = editor.signals;
// 	var object = null;

// 	var getByUuid = function ( uuid ) {
// 		var scope = this;
// 		var object = null;

// 		scene.traverse( function ( child ) {

// 			if ( child.uuid === uuid ) {

// 				object = child;
// 				return;
// 			}

// 		} );

// 		return object;
// 	};

// 	this.execute = function( op ){
// 		switch( op.type ){
// 		case 0://create node
// 			editor.addObject( op.node );

// 			break;
// 		case 1://update state
// 			object = getByUuid( op.nodeId );

// 			if ( object !== null ){
// 				object[op.key] = op.after; 

// 				signals.objectChanged.dispatch( object );
// 			}

// 			break;
// 		case 2://update structure
// 			break;
// 		default:

// 			break;
// 		}
// 	};
// };