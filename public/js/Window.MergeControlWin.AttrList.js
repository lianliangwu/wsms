/*global signals, THREE, _, UI, MergeControlWin */
MergeControlWin.AttrList = function (mergeEditor) {
	"use strict";
	
	var container = new UI.Panel();
	var headerRow = new UI.Panel();
	var fancySelect = new UI.FancySelect();
	var selectedNode = null;

	var col1 = new UI.Text( 'Key' ).setWidth( '33%' ).setTextAlign('center');
	var col2 = new UI.Text( 'VersionA' ).setWidth( '33%' ).setTextAlign('center');
	var col3 = new UI.Text( 'VersionB' ).setWidth( '33%' ).setTextAlign('center');
	headerRow.add(col1);
	headerRow.add(col2);
	headerRow.add(col3);

	var versionARow = new UI.Panel();
	var keyA = new UI.Text( 'versionA' ).setWidth( '40%' );
	var valueA = new UI.Input().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );
	var versionBRow = new UI.Panel();
	var keyB = new UI.Text( 'versionB' ).setWidth( '40%' );
	var valueB = new UI.Input().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );	
	var resultRow = new UI.Panel();
	var resultSelect = new UI.Select().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );

	versionARow.add( keyA );
	versionARow.add( valueA );	

	versionBRow.add( keyB );
	versionBRow.add( valueB );	

	resultRow.add( new UI.Text( 'Merge Result' ).setWidth( '40%' ) );
	resultRow.add( resultSelect );	

	container.add( new UI.Break() );
	container.add( new UI.Text( 'Attribute List' ).setClass('title') );
	container.add( new UI.Break(), new UI.Break() );
	container.add(headerRow);
	container.add(fancySelect);
	container.add(versionARow);
	container.add(versionBRow);
	container.add(resultRow);
	container.hide();

	//event
	fancySelect.onChange(function onChange() {
		var versionA = container.versionA;
		var versionB = container.versionB;
		if(container.nodeMap){
			//set version values
			var key = fancySelect.getValue();
			var stateLogItem = selectedNode;		

			_.each(stateLogItem.attrLog, function onEach(attrLog){
				if(key === attrLog.key){
					valueA.setValue(attrLog.value[versionA]);
					valueB.setValue(attrLog.value[versionB]);
				}
			});

			//set result select
			var result = stateLogItem.attrInfoMap[key].result;
			var options = {};	
			options[versionA] = versionA;
			options[versionB] = versionB;			
			if(options[result] === undefined){
				options[result] = result;
			}
			resultSelect.setOptions(options).setValue(result);
		}
	});

	resultSelect.onChange(function onChange(){
		if(container.mergeInfoMap){
			var node = selectedNode;
			var key = fancySelect.getValue();
			var version = resultSelect.getValue();
			var value;

			//get the attribute value	
			value = node.attrInfoMap[key].value[version];
			mergeEditor.updateNode(key, value);
		}
	});

	//set fancySelect options on node selection
	mergeEditor.signals.nodeSelected.add(function onNodeSelect(uuid) {
		if(container.nodeMap){
			var stateLogItem = container.nodeMap[uuid];
			selectedNode = stateLogItem;
			if(stateLogItem && stateLogItem.attrOptions){
				fancySelect.setOptions(stateLogItem.attrOptions);
				resultSelect.setOptions({});

				container.show();
			}else{
				container.hide();
			}			
		}
	});

	container.setInfo = function(options) {
		var makeAttrOptions = function(stateLogItem) {
			var attrOptions = {};
			var attrInfoMap = {};
			var col1, col2, col3;

			_.each(stateLogItem.attrLog, function onEach(logItem){

				col1 = '<span><input style="width:90%" value="'+ logItem.key +'" disabled></span>';
				col2 = '<span>' + logItem[container.versionA] + '</span>';
				col3 = '<span>' + logItem[container.versionB] + '</span>';

				attrOptions[logItem.key] = '<div class="' + (logItem.isConflicted ? 'conflicted' : 'merged') + '">' + col1 + col2 + col3 + '</div>';
				attrInfoMap[logItem.key] = logItem;
			});

			stateLogItem.attrOptions = attrOptions;
			stateLogItem.attrInfoMap = attrInfoMap;
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

		//change UI text
		col2.setValue(container.versionA);
		col3.setValue(container.versionB);
		keyA.setValue(container.versionA);
		keyB.setValue(container.versionB);

		makeLogMap(options.mergeLog.stateLog);

		_.each(options.mergeLog.stateLog, function onEach(logItem) {
			if(logItem.attrLog){
				makeAttrOptions(logItem);
			}
		});

		//container.dom.style.display = "none";
	};

	return container;
};