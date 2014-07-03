/*global THREE*/
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
				copy(options, operation);
				operation.uuid = THREE.Math.generateUUID();
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
				copy(options, operation);
			break;
			default:
			break;
		}

		return operation;
	}

	//copy all the property of a to b
	function copy(a, b){
		for(var property in a){
			if(a.hasOwnProperty(property)){
				b[property] = a[property];
			}
		}
	}

	//build the state of operation UPDATE_STATE
	function buildState(op, key, object){
		if(object[key].clone){
			op.before = object[key].clone();
			op.after = object[key].clone();
		}else{
			op.before = clone(object[key]);
			op.after = clone(object[key]);
		}

		function clone(value){
			var result;

			switch(typeof value){
				case "number":
				case "string":
				case "boolean":
					result = value;
					break;
				case "object":
					result = JSON.parse(JSON.stringify(value));
					break;
				default:
				break;
			}
			return result;
		}
		// switch(key){
		// 	case "position":
		// 		op.before = object.position.clone();
		// 		op.after = object.position.clone();
		// 	break;
		// 	case "rotation":
		// 		op.before = object.rotation.clone();
		// 		op.after = object.rotation.clone();
		// 	break;
		// 	case "scale":
		// 		op.before = object.scale.clone();
		// 		op.after = object.scale.clone();
		// 	break;
		// }
	}

	Operation.CREATE = CREATE;
	Operation.UPDATE_STATE = UPDATE_STATE;
	Operation.UPDATE_STRUCT = UPDATE_STRUCT;

	return Operation;
}());