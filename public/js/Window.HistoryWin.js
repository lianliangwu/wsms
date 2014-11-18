/*global UI, Operation, OperationHistory, editor, _*/
var HistoryWin = function(){
	"use strict";
	var operations = OperationHistory;
	var options = [];
	var items = [];

	//interface
	var historyWin = new UI.Window("History");
	historyWin.setInnerWidth("300px");
	historyWin.setInnerHeight("300px");

	var fancySelect = new UI.FancySelect();
	options[0] = '<div class=""><strong><span>Time</span><span>key</span><span>object</span><span>user</span></strong></div>';
	fancySelect.setOptions(options);
	historyWin.add(fancySelect);

	var btnRow = new UI.Panel().setTextAlign("center");
	var undoBtn = new UI.Button( 'Undo' ).setMarginLeft( '7px' ).onClick( undo );
	var redoBtn = new UI.Button( 'Redo' ).setMarginLeft( '7px' ).onClick( redo );	

	btnRow.add(undoBtn);
	btnRow.add(redoBtn);
	historyWin.add(btnRow);

	historyWin.hide();

	//event listener
	operations.signals.operationAdded.add(function onEvent(op){
		addItem(op);
	});
	operations.signals.operationUndone.add(function onEvent(op){
		undoItem(op);
	});
	operations.signals.operationRedone.add(function onEvent(op){
		redoItem(op);
	});
	operations.signals.operationReset.add(function onEvent(op){
		resetItem(op);
	});

	function buildItem(op){
		var target;
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
				type = op.key;
				break;
			case Operation.UPDATE_STRUCT:
				// type = 'UPDATE_STRUCT';
				type = op.method;
				break;
			default:break;
		}

		if(op.method === 'remove'){
			target = editor.engine.getRemovedObject(op.uuid);
		}else{
			target = editor.getObjectByUuid(op.uuid);
			if(!target){
				target = editor.getMaterial(op.uuid);
			}
			if(!target){
				target = editor.getGeometry(op.uuid);
			}
		}
		
		name = target.name;
		time = new Date().toLocaleTimeString();		

		items[op.id] = {
			time: time,
			name: name,
			type: type,
			username: op.username
		};
	}

	function addItem(op){
		buildItem(op);
		var item = items[op.id];

		var col1 = '<span>' + item.time +'</span>';
		var col2 = '<span>' + item.type + '</span>';
		var col3 = '<span>' + item.name + '</span>';
		var col4 = '<span>' + item.username + '</span>';
		options[op.id] = '<div>' + col1 + col2 + col3 + col4 + '</div>';
		_.forEach(items, function(item, index){
			if(item && item.undone){
				delete options[index];
			}
		});

		fancySelect.setOptions(options);
	}

	function undoItem(op){
		var item = items[op.id];

		var col1 = '<span>' + item.time +'</span>';
		var col2 = '<span>' + item.type + '</span>';
		var col3 = '<span>' + item.name + '</span>';
		var col4 = '<span>' + item.username + '</span>';
		options[op.id] = '<div class="undone">' + col1 + col2 + col3 + col4 + '</div>';
		items[op.id].undone = true;

		fancySelect.setOptions(options);
	}

	function redoItem(op){
		var item = items[op.id];

		var col1 = '<span>' + item.time +'</span>';
		var col2 = '<span>' + item.type + '</span>';
		var col3 = '<span>' + item.name + '</span>';
		var col4 = '<span>' + item.username + '</span>';
		options[op.id] = '<div>' + col1 + col2 + col3 + col4 + '</div>';
		items[op.id].undone = false;

		fancySelect.setOptions(options);
	}
	function resetItem(){
		options.length = 0;
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