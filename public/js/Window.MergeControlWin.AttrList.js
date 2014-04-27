var MergeControlWin.AttrList = function (mergeEditor) {
	var container = new UI.Panel();
	var headerRow = new UI.Panel();
	var fancySelect = new UI.FancySelect();
	var versionARow = new UI.Panel();
	var valueA = new UI.Input().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );
	var versionBRow = new UI.Panel();
	var valueB = new UI.Input().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );	
	var resultRow = new UI.Panel();
	var resultSelect = new UI.Select().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );
	var selectedNode = null;

	var col1 = new UI.Text( 'Key' ).setWidth( '33%' ).setTextAlign('center');
	var col2 = new UI.Text( 'VersionA' ).setWidth( '33%' ).setTextAlign('center');
	var col3 = new UI.Text( 'VersionB' ).setWidth( '33%' ).setTextAlign('center');
	headerRow.add(col1);
	headerRow.add(col2);
	headerRow.add(col3);

	versionARow.add( new UI.Text( versionA ).setWidth( '40%' ) );
	versionARow.add( valueA );	

	versionBRow.add( new UI.Text( versionB ).setWidth( '40%' ) );
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

	//event
	fancySelect.onChange(function onChange(){
		if(container.mergeInfoMap){
			//set version values
			var key = fancySelect.getValue();	
			var uuid = nodeSelect.getValue();
			var nodeInfo = container.mergeInfoMap[selectedNode];		

			_.each(node.attrLog, function onEach(attrLog){
				if(key === attrLog.key){
					valueA.setValue(attrLog.value[versionA]);
					valueB.setValue(attrLog.value[versionB]);
				}
			});

			//set result select
			var result = nodeInfo.attrInfoMap[key].result;
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
			var uuid = nodeSelect.getValue();
			var node = container.mergeInfoMap[uuid];
			var key = fancySelect.getValue();
			var version = resultSelect.getValue();
			var value;

			//get the attribute value	
			value = selectedNode.attrInfoMap[key].value[version];
			mergeEditor.updateNode(key, value);
		}
	});

	mergeEditor.signals.nodeSelected.add(function onNodeSelect(uuid) {
		var nodeInfo = containder.mergeInfoMap[uuid];
		selectedNode = uuid;

		fancySelect.setOptions(nodeInfo.attrOptions);
		resultSelect.setOptions({});
	});

	container.setInfo = function(versionA, versionB, mergeInfoMap) {
		var makeAttrOptions = function(nodeInfo) {
			var attrOptions = {};
			var attrInfoMap = {};
			var col1, col2, col3;

			_.each(nodeInfo.attrLog, function onEach(attrLog){

				col1 = '<span><input style="width:90%" value="'+ attrLog.key +'" disabled></span>';
				col2 = '<span>' + attrLog[versionA] + '</span>';
				col3 = '<span>' + attrLog[versionB] + '</span>';

				attrOptions[attrLog.key] = '<div class="' + attrLog.type + '">' + col1 + col2 + col3 + '</div>';
				attrInfoMap[attrLog.key] = attrLog;
			});

			nodeInfo.attrOptions = attrOptions;
			nodeInfo.attrInfoMap = attrInfoMap;
		};	

		for(uuid in mergeInfoMap){
			if(mergeInfoMap.hasOwnProperty(uuid)){
				nodeInfo = mergeInfoMap[uuid];
				if( nodeInfo.isMerged || nodeInfo.isConflicted){
					makeAttrOptions(nodeInfo);
				}					
			}
		}

		container.mergeInfoMap = mergeInfoMap;
		container.versionA = "Version" + versionA;
		container.versionB = "Version" + versionB;
		col2.setValue(container.versionA);
		col3.setValue(container.versionB);
	};

	return container;
};