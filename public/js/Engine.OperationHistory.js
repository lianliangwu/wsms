/*global signals, THREE*/
var OperationHistory = (function(){
	"use strict";
	var operations = [];
	var map = {};
	var top = -1;
	var count = 0;
	var SIGNALS = signals; 

	var sig = {
		operationAdded: new SIGNALS.Signal(),
		operationUndone: new SIGNALS.Signal(),
		operationRedone: new SIGNALS.Signal(),
		operationReset: new SIGNALS.Signal()
	};

	function add (op) {
		if(exist(op)){
			return ;
		}

		if (operations[top + 1] !== undefined){//check and remove the undone operations
			operations.length = top + 1;
		}
		op.id = (count)++;
		if(!op.uuid) {
			op.uuid = THREE.Math.generateUUID();
		}
		map[op.uuid] = op;
		operations.push(op);
		++top;

		sig.operationAdded.dispatch(op);
	}

	function undo () {
		var op = null;
		if(top>=0){
			op = operations[top];
			--top;

			sig.operationUndone.dispatch(op);	
		}
		return op;
	}

	function redo () {
		var op = null;
		if (operations[top + 1] !== undefined){
			op = operations[top + 1];
			++top;

			sig.operationRedone.dispatch(op);
		}
		return op;
	}

	function exist(op){
		if(op.uuid && map[op.uuid]){
			return true;
		}else{
			return false;
		}
	}

	/*
	* return operation or undefined(no operations)
	*/
	function getCurrent() {
		return operations[top];
	}

	function resetOperations(){
		operations.length = 0;
		top = -1;
		count = 0;
		sig.operationReset.dispatch(operations);
	}

	return {
		'add': add,
		'undo': undo,
		'redo': redo,
		'exist': exist,
		'signals': sig,
		'getCurrent': getCurrent,
		'__getOperations': function(){return operations;},
		'__getCount': function(){return top+1;},
		'__resetOperations': resetOperations
	};
}());