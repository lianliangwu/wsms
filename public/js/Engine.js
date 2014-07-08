/*global ExecuteOperation, OperationHistory, Operation, editor*/
var Engine = (function(){
	"use strict";
	var operations = OperationHistory;

	function exec(op){

		if(executeByType(op)){
			operations.add(op);
			editor.signals.render.dispatch();			
		}

		function executeByType(){
			var boo = false;
			switch( op.type ){
				case Operation.CREATE://create object
					boo = ExecuteOperation.execute(op);
					break;
				case Operation.UPDATE_STATE://update state
					boo = ExecuteOperation.execute(op);
					break;
				case Operation.UPDATE_STRUCT://update structure
					boo = ExecuteOperation.execute(op);
					break;
				default:
					break;
			}
			return boo;
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

			switch( op.type ){
				case Operation.CREATE:
					ExecuteOperation.execute(op.getUndo());
					editor.signals.render.dispatch();
					break;
				case Operation.UPDATE_STATE:

					ExecuteOperation.execute(op.getUndo());
					editor.signals.render.dispatch();

					break;
				case Operation.UPDATE_STRUCT:
					ExecuteOperation.execute(op.getUndo());
					editor.signals.render.dispatch();
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
			switch( op.type ){
				case Operation.CREATE:
					ExecuteOperation.execute(op.getRedo());
					editor.signals.render.dispatch();
					break;
				case Operation.UPDATE_STATE:
					ExecuteOperation.execute(op);
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