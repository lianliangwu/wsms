/*global ExecuteOperation, OperationHistory, Operation, editor*/
var Engine = (function(){
	"use strict";
	var operations = OperationHistory;

	function exec(op){
		var boo = false;
		switch( op.type ){
			case Operation.CREATE://create object
				boo = ExecuteOperation.createObject(op);
				if(boo){
					operations.add(op);
					editor.signals.render.dispatch();				
				}
				break;
			case Operation.UPDATE_STATE://update state
				boo = ExecuteOperation.updateState(op);
				if(boo){
					operations.add(op);
					editor.signals.render.dispatch();
				}
				break;
			case Operation.UPDATE_STRUCT://update structure
				boo = ExecuteOperation.updateStruct(op);
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

						ExecuteOperation.updateState(op.getUndo());
						editor.signals.render.dispatch();

					break;
				case Operation.UPDATE_STRUCT:
					break;
				default:
					break;
			}			
		}
	}

	function redo(id){
		var op = null;
		var preOp = null;

		op = operations.getCurrent();
		while(op === undefined || id > op.id){
			op = operations.redo();
			if(op){
				redoByType(op);
			}else{
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
					ExecuteOperation.updateState(op);
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


	return {
		'exec': exec,
		'undo': undo,
		'redo': redo,
		'replay': replay,
		'getRemovedObject': ExecuteOperation.getRemovedObject
	};
})();