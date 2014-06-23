/*global UpdateState, OperationHistory, Operation*/
var Engine = (function(){
	"use strict";
	var object = null;
	var operations = OperationHistory;

	function Engine () {
	}

	function updateState (object, op) {
		switch(op.key){
			case "position":
				UpdateState.setPosition(object, op.after);
			break;
			case "rotation":
				UpdateState.setRotation(object, op.after);
			break;
			case "scale":
				UpdateState.setScale(object, op.after);
			break;
			default:
			break;
		}
	}

	Engine.prototype.exec = function(op){
		switch( op.type ){
		case Operation.CREATE://create node

			break;
		case Operation.UPDATE_STATE://update state
			object = editor.getObjectByUuid(op.uuid);

			if ( object !== null ){
				updateState(object, op);
				operations.add(op);
				editor.signals.render.dispatch();
			}

			break;
		case Operation.UPDATE_STRUCT://update structure
			break;
		default:
			break;
		}
	};
	Engine.prototype.undo = function(){};
	Engine.prototype.redo = function(){};
	Engine.prototype.replay = function(){};

	return Engine;
})();