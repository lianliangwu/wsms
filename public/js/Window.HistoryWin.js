/*global UI, Operation, OperationHistory, editor*/
var HistoryWin = function(){
	"use strict";
	var operations = OperationHistory;
	var options = [];

	//interface
	var historyWin = new UI.Window("History");
	historyWin.setInnerWidth("300px");
	historyWin.setInnerHeight("300px");

	var btnRow = new UI.Panel().setTextAlign("center");
	var undoBtn = new UI.Button( 'Undo' ).setMarginLeft( '7px' ).onClick( undo );
	var redoBtn = new UI.Button( 'Redo' ).setMarginLeft( '7px' ).onClick( redo );	

	btnRow.add(undoBtn);
	btnRow.add(redoBtn);
	historyWin.add(btnRow);

	var fancySelect = new UI.FancySelect();

	historyWin.add(fancySelect);
	historyWin.hide();

	//event listener
	operations.signals.operationAdded.add(function onEvent(op){
		addItem(op);
	});

	function addItem(op){
		var type;
		var name;
		var time;

		switch(op.type){
			case Operation.CREATE: 
				if(op.object){
					type = 'clone';
				}else{
					type = 'add';
				}
				break;
			case Operation.UPDATE_STATE:
				// type = 'UPDATE_STATE';
				type = 'update ' + op.key;
				break;
			case Operation.UPDATE_STRUCT:
				// type = 'UPDATE_STRUCT';
				type = op.method;
				break;
			default:break;
		}

		if(op.method === 'remove'){
			name = editor.engine.getRemovedObject(op.uuid).name;
		}else{
			name = editor.getObjectByUuid(op.uuid).name;
		}
		time = new Date().toLocaleTimeString();

		var col1 = '<span>' + time +'</span>';
		var col2 = '<span>' + name + '</span>';
		var col3 = '<span>' + type + '</span>';
		options[op.id] = '<div>' + col1 + col2 + col3 + '</div>';	

		fancySelect.setOptions(options);
	}

	function undo(){
		var id = fancySelect.getValue();
		if(id){
			editor.engine.undo(parseInt(id, 10));
		}
	}

	function redo(){
		var id = fancySelect.getValue();
		if(id){
			editor.engine.redo(parseInt(id, 10));
		}
	}

	return historyWin;
};