/*global UpdateState, OperationHistory, Operation, editor*/
var Engine = function(editor){
	"use strict";
	var object = null;
	var operations = OperationHistory;

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

	function exec(op){
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

			switch( op.type ){
			case Operation.CREATE:

				break;
			case Operation.UPDATE_STATE:
				object = editor.getObjectByUuid(op.uuid);

				if ( object !== null ){
					newOp = makeUndo(op);

					updateState(object, newOp);
					editor.signals.render.dispatch();
				}

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
			switch( op.type ){
			case Operation.CREATE:

				break;
			case Operation.UPDATE_STATE:
				object = editor.getObjectByUuid(op.uuid);

				if ( object !== null ){
					updateState(object, op);
					editor.signals.render.dispatch();
				}

				break;
			case Operation.UPDATE_STRUCT:
				break;
			default:
				break;
			}			
		}

	}
	function replay(){}


	return {
		'exec': exec,
		'undo': undo,
		'redo': redo,
		'replay': replay
	};
};