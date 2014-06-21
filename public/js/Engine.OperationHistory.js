var OperationHistory = (function(){
	"use strict";
	function OperationHistory () {
		this.operations = [];
		this.top = -1;
		this.count = 0;
	}

	OperationHistory.prototype.add = function (op) {
		if (this.operations[this.top + 1] !== undefined){//check and remove the undone operations
			this.operations.length = this.top + 1;
		}
		op.id = (this.count)++;
		this.top = this.operations.push(op) - 1;
	};

	OperationHistory.prototype.undo = function () {
		var r = this.operations[this.top];
		--this.top;
		return r;
	};

	OperationHistory.prototype.redo = function () {
		var r;
		if (this.operations[this.top + 1] !== undefined){
			r = this.operations[this.top + 1];
			++this.top;
		}
		return r;
	};

	return OperationHistory;
}());