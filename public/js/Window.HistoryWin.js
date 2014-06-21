/*global UI, Operation*/
var HistoryWin = (function(){
	"use strict";
	var editor = null;

	function HistoryWin(e) {
		UI.Window.call(this, "History");

		var btnRow = new UI.Panel();
		var fancySelect = new UI.FancySelect().setHeight("90px");

		this.setInnerWidth("300px");
		this.setInnerHeight("300px");
		this.hide();

		editor = e;
		this.options = [];
		this.fancySelect = fancySelect;

		
	}

	HistoryWin.prototype = Object.create(UI.Window.prototype);

	HistoryWin.prototype.addItem = function (op) {
		var type;
		var name;

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

		var col1 = '<span>' + type +'</span>';
		var col2 = '<span>' + name + '</span>';
		this.options[op.id] = '<div>' + col1 + col2 + '</div>';	

		this.fancySelect.setOptions(this.options);
	};

	return HistoryWin;
}());



