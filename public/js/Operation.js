var Operation = (function(){
	"use strict";
	var CREATE = 0;
	var UPDATE_STATE = 1;
	var UPDATE_STRUCT = 2;

	function Operation(type, options){
		var operation = {};

		switch(type){
			case CREATE:
				operation.type = CREATE;
			break;
			case UPDATE_STATE:
				operation.type = UPDATE_STATE;
				if(options&&options.key&&options.object){
					operation.key = options.key;
					operation.uuid = options.object.uuid;
					buildState(operation, options.key, options.object);
				}
			break;
			case UPDATE_STRUCT:
				operation.type = UPDATE_STRUCT;
			break;
			default:
			break;
		}

		return operation;
	}

	//build the state of operation
	function buildState(op, key, object){
		switch(key){
			case "position":
				op.before = object.position.clone();
				op.after = object.position.clone();
			break;
			case "rotation":
				op.before = object.rotation.clone();
				op.after = object.rotation.clone();
			break;
			case "scale":
				op.before = object.scale.clone();
				op.after = object.scale.clone();
			break;
		}
	}

	Operation.CREATE = CREATE;
	Operation.UPDATE_STATE = UPDATE_STATE;
	Operation.UPDATE_STRUCT = UPDATE_STRUCT;

	return Operation;
}());