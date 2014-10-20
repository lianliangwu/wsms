/*global ExecuteOperation, OperationHistory, Operation, editor, io, THREE*/
var Engine = (function(){
	"use strict";
	var operations = OperationHistory;

	function exec(op){

		if(executeByType()){
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
					ExecuteOperation.execute(op.getRedo());
					editor.signals.render.dispatch();
					break;
				case Operation.UPDATE_STRUCT:
					ExecuteOperation.execute(op.getRedo());
					editor.signals.render.dispatch();
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

var OperationColla = (function(){
	"use strict";
	var operations = OperationHistory;
	var engine = Engine;
	var socket = io();
	
	
	
	socket.on('operation', function(op){
		op = recoverType(op);
		if(!operations.exist(op)){
			engine.exec(op);
		}
	});

	operations.signals.operationAdded.add(function onEvent(op){
		//send to server
		socket.emit('operation', logType(op));
	});

	function logType(op){
		if(op.before instanceof THREE.Vector3){
			op.valueType = "THREE.Vector3";
		}else if(op.before instanceof THREE.Color){
			op.valueType = "THREE.Color";
		}

		return op;
	}

	function recoverType(op){

		if(op.valueType === "THREE.Vector3"){
			op.before = new THREE.Vector3(op.before.x, op.before.y, op.before.z);
			op.after = new THREE.Vector3(op.after.x, op.after.y, op.after.z);
		}else if(op.valueType === "THREE.Color"){
			op.before = new THREE.Color(op.before.r, op.before.g, op.before.b);
			op.after = new THREE.Color(op.after.r, op.after.g, op.after.b);
		}

		delete op.valueType;
		return op;
	}
})();