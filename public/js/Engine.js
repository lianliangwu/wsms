/*global CreateObject, UpdateState, UpdateStructure, OperationHistory, Operation, editor*/
var Engine = function(editor){
	"use strict";
	var removedObject = {};
	var operations = OperationHistory;

	function createObject(op){
		var object = null;
		//add primary object
		if(op.primary){
			CreateObject.addPrimary(op.uuid, op.primary);
		}
		//add from asset
		if(op.asset){
			CreateObject.addFromAsset(op);
		}
		//add from file
		if(op.file){
			CreateObject.addFromFile(op);
		}
		//clone object
		if(op.object){
			object = editor.getObjectByUuid(op.object);
			if(!object){
				return false;
			}			
			CreateObject.cloneObject(op.uuid, object);
		}
		return true;
	}

	function updateState(op){
		var target = editor.getObjectByUuid(op.uuid);
		if(target){
			UpdateState.updateObject(target, op.key, op.after);
			return true;
		}

		target = editor.getMaterial(op.uuid);
		if(target){
			UpdateState.updateMaterial(target, op.key, op.after);
			return true;
		}

		target = editor.getGeometry(op.uuid);
		if(target){
			UpdateState.updateGeometry(target, op.key, op.after);
			return true;
		}
		return false;
	}

	function updateStruct(op){
		var object = null, parent = null;

		switch(op.method){
			case "remove":
				object = editor.getObjectByUuid(op.uuid);
				if(!object){
					return false;
				}
				removedObject[object.uuid] = object;
				UpdateStructure.remove(object);
			break;
			case "parent":
				object = editor.getObjectByUuid(op.uuid);
				parent = editor.getObjectByUuid(op.toParent);
				if(!(object&&parent)){
					return false;
				}
				UpdateStructure.parent(object, parent);
			break;
			default:
			break;
		}
		return true;
	}

	function exec(op){
		var boo = false;
		switch( op.type ){
			case Operation.CREATE://create object
				boo = createObject(op);
				if(boo){
					operations.add(op);
					editor.signals.render.dispatch();				
				}
				break;
			case Operation.UPDATE_STATE://update state
				boo = updateState(op);
				if(boo){
					operations.add(op);
					editor.signals.render.dispatch();
				}
				break;
			case Operation.UPDATE_STRUCT://update structure
				boo = updateStruct(op);
				if(boo){
					operations.add(op);
					editor.signals.render.dispatch();
				}
				break;
			default:
				break;
		}
	}

	function undo(id){
		var op = null;

		op = operations.getCurrent();
		while(op && id <= op.id){
			
			undoByType(op);
			operations.undo();
			op = operations.getCurrent();

		}


		function undoByType(op){
			var newOp = null;
			var object = null;

			switch( op.type ){
				case Operation.CREATE:

					break;
				case Operation.UPDATE_STATE:

						newOp = makeUndo(op);
						updateState(newOp);
						editor.signals.render.dispatch();

					break;
				case Operation.UPDATE_STRUCT:
					break;
				default:
					break;
			}			
		}

		function makeUndo(op){
			var newOp = null;
			switch(op.type){
				case Operation.CREATE:
					break;
				case Operation.UPDATE_STATE:
					newOp = getUndoByKey(op);
					break;
				case Operation.UPDATE_STRUCT:
					break;
				default:
					break;			
			}

			return newOp;

			//the method depends on the value type
			function getUndoByKey(op){
				var newOp = null;

				switch(op.key){
					case "position":
					case "rotation":
					case "scale":
						newOp = JSON.parse(JSON.stringify(op));

						newOp.before = op.after.clone();
						newOp.after = op.before.clone();
					break;
				}

				return newOp;
			}
		}
	}

	function redo(id){
		var op = null;
		var preOp = null;

		op = operations.getCurrent();
		while(op===undefined || id > op.id){

			operations.redo();

			preOp = op;
			op = operations.getCurrent();
			redoByType(op);
			
			if(preOp === op){
				break;
			}

		}

		function redoByType(op){
			var object;
			switch( op.type ){
				case Operation.CREATE:

					break;
				case Operation.UPDATE_STATE:
					object = editor.getObjectByUuid(op.uuid);
					updateState(op);
					editor.signals.render.dispatch();

					break;
				case Operation.UPDATE_STRUCT:
					break;
				default:
					break;
			}			
		}

	}
	function replay(){}

	function getRemovedObject(uuid){
		if(removedObject[uuid]){
			return removedObject[uuid];
		}
	}


	return {
		'exec': exec,
		'undo': undo,
		'redo': redo,
		'replay': replay,
		'getRemovedObject': getRemovedObject
	};
};