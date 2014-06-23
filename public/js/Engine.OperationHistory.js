/*global signals*/
var OperationHistory = (function(){
	"use strict";
	var operations = [];
	var top = -1;
	var count = 0;
	var SIGNALS = signals; 

	var sig = {
		operationAdded: new SIGNALS.Signal(),
		operationUdone: new SIGNALS.Signal(),
		operationRedone: new SIGNALS.Signal()
	};

	function add (op) {
		if (operations[top + 1] !== undefined){//check and remove the undone operations
			operations.length = top + 1;
		}
		op.id = (count)++;
		top = operations.push(op) - 1;

		sig.operationAdded.dispatch(op);
	}

	function undo () {
		var r = operations[top];
		--top;

		sig.operationUdone.dispatch(r);
		return r;
	}

	function redo () {
		var r;
		if (operations[top + 1] !== undefined){
			r = operations[top + 1];
			++top;

			sig.operationRedone.dispatch(r);
		}
		return r;
	}

	return {
		'add': add,
		'undo': undo,
		'redo': redo,
		'signals': sig
	};
}());