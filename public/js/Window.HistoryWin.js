/*global UI, Operation, OperationHistory*/
var HistoryWin = (function(){
	"use strict";
	var editor = null;
	var operations = OperationHistory;

	function HistoryWin(ed) {
		UI.Window.call(this, "History");
		this.setInnerWidth("300px");
		this.setInnerHeight("300px");


		var btnRow = new UI.Panel().setTextAlign("center");
		var undoBtn = new UI.Button( 'Undo' ).setMarginLeft( '7px' ).onClick( function () {} );
		var redoBtn = new UI.Button( 'Redo' ).setMarginLeft( '7px' ).onClick( function () {} );	

		btnRow.add(undoBtn);
		btnRow.add(redoBtn);
		this.add(btnRow);

		var fancySelect = new UI.FancySelect();

		this.add(fancySelect);
		this.hide();

		editor = ed;
		this.options = [];
		this.fancySelect = fancySelect;

		var scope = this;
		operations.signals.operationAdded.add(function onEvent(op){
			scope.addItem(op);
		});
	}

	HistoryWin.prototype = Object.create(UI.Window.prototype);

	HistoryWin.prototype.addItem = function (op) {
		var type;
		var name;
		var time;

		switch(op.type){
			case Operation.CREATE: 
				type = 'CREATE';
				break;
			case Operation.UPDATE_STATE:
				type = 'UPDATE_STATE';
				break;
			case Operation.UPDATE_STRUCT:
				type = 'UPDATE_STRUCT';
				break;
			default:break;
		}
		name = editor.getObjectByUuid(op.uuid).name;
		time = new Date().toLocaleTimeString();

		var col1 = '<span>' + time +'</span>';
		var col2 = '<span>' + name + '</span>';
		var col3 = '<span>' + type + '</span>';
		this.options[op.id] = '<div>' + col1 + col2 + col3 + '</div>';	

		this.fancySelect.setOptions(this.options);
	};

	return HistoryWin;
}());



