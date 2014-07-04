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
				if(options&&options.key&&options.target){
					operation.key = options.key;
					operation.uuid = options.target.uuid;
					buildState(operation, options.target, options.key);
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
	function buildState(op, target, key){
		if(target[key].clone){
			op.before = target[key].clone();
			op.after = target[key].clone();
		}else{
			op.before = clone(target[key]);
			op.after = clone(target[key]);
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
	}

	Operation.CREATE = CREATE;
	Operation.UPDATE_STATE = UPDATE_STATE;
	Operation.UPDATE_STRUCT = UPDATE_STRUCT;

	return Operation;
}());