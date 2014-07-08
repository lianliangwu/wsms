/*global signals*/
var OperationHistory = (function(){
	"use strict";
	var operations = [];
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
		if (operations[top + 1] !== undefined){//check and remove the undone operations
			operations.length = top + 1;
		}
		op.id = (count)++;
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
		'signals': sig,
		'getCurrent': getCurrent,
		'__getOperations': function(){return operations;},
		'__getCount': function(){return top+1;},
		'__resetOperations': resetOperations
	};
}());