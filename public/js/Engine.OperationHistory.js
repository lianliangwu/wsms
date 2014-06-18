var OperationHistory = (function(){
	"use strict";
	function OperationHistory () {
		this.operations = [];
		this.top = -1;
	}

	OperationHistory.prototype.add = function (op) {
		//check and remove the undone operations
		if (this.operations[this.top] !== undefined){
			this.operations.length = this.top + 1;
		}
		this.top = this.operations.push(op) - 1;
	};

	OperationHistory.prototype.undo = function () {
		var r = this.operations[(this.top)];
		--this.top;
		return r;
	};

	OperationHistory.prototype.redo = function () {
		var r;
		if (this.operations[this.top] !== undefined){
			r = this.operations[this.top];
			++this.top;
		}
		return r;
	};

	return OperationHistory;
}());