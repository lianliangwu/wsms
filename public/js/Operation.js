/*global THREE, editor*/
var Operation = (function(){
	"use strict";
	var CREATE = 0;
	var UPDATE_STATE = 1;
	var UPDATE_STRUCT = 2;
	
	//copy all the property of @a to @b
	function copy(a, b){
		for(var property in a){
			if(a.hasOwnProperty(property)){
				b[property] = a[property];
			}
		}
	}

	//get a copy of @value
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

	//build the state of operation UPDATE_STATE
	function buildState(op, target, key){
		if(target[key].clone){
			op.before = target[key].clone();
			op.after = target[key].clone();
		}else{
			op.before = clone(target[key]);
			op.after = clone(target[key]);
		}
	}	

	function Operation(type, options){
		switch(type){
			case CREATE:
				this.type = CREATE;
				this.uuid = THREE.Math.generateUUID();
				copy(options, this);
			break;
			case UPDATE_STATE:
				this.type = UPDATE_STATE;
				if(options&&options.key&&options.target){
					this.key = options.key;
					this.uuid = options.target.uuid;
					buildState(this, options.target, options.key);
				}
			break;
			case UPDATE_STRUCT:
				this.type = UPDATE_STRUCT;
				copy(options, this);
			break;
			default:
			break;
		}
	}
	Operation.prototype = {
		getUndo: function(){
			var newOp = null;
			switch(this.type){
				case Operation.CREATE:
					newOp = makeUndoCreate(this);
					break;
				case Operation.UPDATE_STATE:
					newOp = makeUndoState(this);
					break;
				case Operation.UPDATE_STRUCT:
					newOp = makeUndoStruct(this);
					break;
				default:
					break;
			}

			return newOp;

			function makeUndoCreate(op){
				var newOp = new Operation(Operation.UPDATE_STRUCT, {
					'uuid': op.uuid,
					'method': 'remove'
				});

				return newOp;
			}
			
			function makeUndoState(op){
				var newOp = JSON.parse(JSON.stringify(op));

				if(op.before.clone){
					newOp.before = op.after.clone();
					newOp.after = op.before.clone();
				}else{
					newOp.before = clone(op.after);
					newOp.after = clone(op.before);
				}


				return newOp;
			}

			function makeUndoStruct(op){
				var newOp = null;

				switch(op.method){
					case "remove":
						newOp = new Operation(Operation.CREATE, {
							'uuid': op.uuid,
							'parent': op.fromParent
						});
					break;
					case "parent":
						newOp = JSON.parse(JSON.stringify(op));
						newOp.fromParent = op.toParent;
						newOp.toParent = op.fromParent;
					break;
					default:
					break;
				}

				return newOp;
			}
		},
		getRedo: function(){
			var newOp = null;
			switch(this.type){
				case Operation.CREATE:
					newOp = makeRedoCreate(this);
					break;
				case Operation.UPDATE_STATE:
					newOp = makeRedoState(this);
					break;
				case Operation.UPDATE_STRUCT:
					newOp = makeRedoStruct(this);
					break;
				default:
					break;			
			}

			return newOp;

			function makeRedoCreate(op){
				var newOp = new Operation(Operation.CREATE, {
					'uuid': op.uuid,
					'parent': op.parent
				});
				return newOp;
			}
			function makeRedoState(op){
				return op;
			}
			function makeRedoStruct(op){
				return op;
			}
		}
	};

	Operation.CREATE = CREATE;
	Operation.UPDATE_STATE = UPDATE_STATE;
	Operation.UPDATE_STRUCT = UPDATE_STRUCT;

	return Operation;
}());