MergeControlWin.StateList = function( mergeEditor ){
	"use strict";
	//node info list
	var container = new UI.Panel();
	var headerRow = new UI.Panel();
	var fancySelect = new UI.FancySelect();
	var resultRow = new UI.Panel();
	var resultSelect = new UI.Select().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );

	var col1 = new UI.Text( 'UUID' ).setWidth( '33%' ).setTextAlign('center');
	var col2 = new UI.Text( 'VersionA' ).setWidth( '33%' ).setTextAlign('center');
	var col3 = new UI.Text( 'versionB' ).setWidth( '33%' ).setTextAlign('center');

	headerRow.add(col1);
	headerRow.add(col2);
	headerRow.add(col3);

	resultRow.add( new UI.Text( 'Merge Result' ).setWidth( '40%' ) );
	resultRow.add( resultSelect );

	container.add( new UI.Break() );
	container.add( new UI.Text( 'State Conflict List' ).setClass('title') );
	container.add( new UI.Break(), new UI.Break() );
	container.add(headerRow);
	container.add(fancySelect);
	container.add(resultRow);


	fancySelect.onChange( function onChange() {
		if(container.mergeLog){
			var uuid = fancySelect.getValue();
			var stateLogItem = container.nodeMap[uuid];
			var options = {};
			var result = stateLogItem.result;

			options[container.versionA] = container.versionA;
			options[container.versionB] = container.versionB;

			//if result === 'compound'
			if(options[result] === undefined){
				options[result] = result;
			}
			resultSelect.setOptions(options).setValue(result);

			mergeEditor.selectObject(uuid);			
		}
	} );
	
	mergeEditor.signals.nodeSelected.add(function (uuid) {
		if (uuid !== fancySelect.getValue()){
			fancySelect.setValue(uuid);
		}
	});

	container.setInfo = function (options) {
		var makeOptions = function(stateLog) {
			var options = {};
			var col1, col2, col3;	
					
			_.each(stateLog, function onEach(logItem){			
				col1 = '<span><input style="width:90%" value="'+ logItem.uuid +'" disabled></span>';
				col2 = '<span>' + logItem[container.versionA] + '</span>';
				col3 = '<span>' + logItem[container.versionB] + '</span>';

				options[logItem.uuid] = '<div class="' + (logItem.isConflicted ? 'conflicted' : 'merged') + '">' + col1 + col2 + col3 + '</div>';									
			});

			return options;			
		};

		var makeLogMap = function(stateLog) {
			container.nodeMap = {};
			_.each(stateLog, function onEach(logItem) {
				container.nodeMap[logItem.uuid] = logItem;
			});
		};

		container.mergeLog = options.mergeLog;
		container.versionA = options.versionA;
		container.versionB = options.versionB;

		col2.setValue(container.versionA);
		col3.setValue(container.versionB);

		makeLogMap(options.mergeLog.stateLog);	

		fancySelect.setOptions(makeOptions(options.mergeLog.stateLog))

	};

	return container;
};