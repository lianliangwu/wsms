MergeControlWin.StructureList = function( mergeEditor ){
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
	container.add( new UI.Text( 'Node List' ).setClass('title') );
	container.add( new UI.Break(), new UI.Break() );
	container.add(headerRow);
	container.add(fancySelect);
	container.add(resultRow);


	fancySelect.onChange( function onChange() {
		if(container.mergeInfoMap){
			var uuid = fancySelect.getValue();
			var nodeInfo = container.mergeInfoMap[uuid];
			var options = {};
			var result = nodeInfo.nodeLog.result;

			options[container.versionA] = container.versionA;
			options[container.versionB] = container.versionB;

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

	container.setInfo = function (versionA, versionB, mergeInfoMap) {
		var makeNodeOptions = function(infoMap) {
			var options = {};
			var uuid, nodeInfo;
			var col1, col2, col3;	
					
			for(uuid in infoMap){
				if(infoMap.hasOwnProperty(uuid)){
					nodeInfo = infoMap[uuid];
					if( nodeInfo.isMerged || nodeInfo.isConflicted){
						col1 = '<span><input style="width:90%" value="'+ uuid +'" disabled></span>';
						col2 = '<span>' + nodeInfo.nodeLog[container.versionA] + '</span>';
						col3 = '<span>' + nodeInfo.nodeLog[container.versionB] + '</span>';

						options[uuid] = '<div class="' + (nodeInfo.isConflicted ? 'conflicted' : 'merged') + '">' + col1 + col2 + col3 + '</div>';
					}					
				}
			}

			return options;			
		};	

		container.mergeInfoMap = mergeInfoMap;
		container.versionA = "Version" + versionA;
		container.versionB = "Version" + versionB;
		col2.setValue(container.versionA);
		col3.setValue(container.versionB);		

		fancySelect.setOptions(makeNodeOptions(mergeInfoMap))

	};

	return container;
};