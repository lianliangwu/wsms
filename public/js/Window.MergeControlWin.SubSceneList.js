MergeControlWin.SubSceneList = function (mergeEditor) {
	var container = new UI.Panel();
	var headerRow = new UI.Panel();
	var fancySelect = new UI.FancySelect();
 	var resultRow = new UI.Panel();
	var resultSelect = new UI.Select().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );
	var selectedNode = null;

	var col1 = new UI.Text( 'Key' ).setWidth( '33%' ).setTextAlign('center');
	var col2 = new UI.Text( 'VersionA' ).setWidth( '33%' ).setTextAlign('center');
	var col3 = new UI.Text( 'VersionB' ).setWidth( '33%' ).setTextAlign('center');
	headerRow.add(col1);
	headerRow.add(col2);
	headerRow.add(col3);	
	
	resultRow.add( new UI.Text( 'Merge Result' ).setWidth( '40%' ) );
	resultRow.add( resultSelect );	

	container.add( new UI.Break() );
	container.add( new UI.Text( 'SubScene List' ).setClass('title') );
	container.add( new UI.Break(), new UI.Break() );
	container.add(headerRow);
	container.add(fancySelect);	
	container.add(resultRow);

	fancySelect.onChange(function onChange(){
		var versionA = container.versionA;
		var versionB = container.versionB;

		if(container.mergeInfoMap){
			var key = fancySelect.getValue();
			var nodeInfo = selectedNode;	
			var options = {};	
			options[versionA] = versionA;
			options[versionB] = versionB;

			var result = nodeInfo.subSceneInfoMap[key].result;
			if(options[result] === undefined){
				options[result] = result;
			}
			resultSelect.setOptions(options).setValue(result);
		}
	});

	mergeEditor.signals.nodeSelected.add(function onNodeSelected(uuid){
		if(container.mergeInfoMap){
			var nodeInfo = container.mergeInfoMap[uuid];
			selectedNode = nodeInfo;

			if(nodeInfo){
				fancySelect.setOptions(nodeInfo.subSceneOptions);
				resultSelect.setOptions({});
			}
		}
	});	

	container.setInfo = function (versionA, versionB, mergeInfoMap) {
		var makeAttrOptions = function(nodeInfo) {
			var subSceneOptions = {};
			var subSceneInfoMap = {};
			var col1, col2, col3;

			_.each(nodeInfo.subScene, function onEach(subScene){

				col1 = '<span><input style="width:90%" value="'+ subScene.uuid +'" disabled></span>';
				col2 = '<span>' + subScene[container.versionA] + '</span>';
				col3 = '<span>' + subScene[container.versionB] + '</span>';

				subSceneOptions[subScene.uuid] = '<div class="' + subScene.type + '">' + col1 + col2 + col3 + '</div>';				
				subSceneInfoMap[subScene.uuid] = subScene;
			});


			nodeInfo.subSceneOptions = subSceneOptions;
			nodeInfo.subSceneInfoMap = subSceneInfoMap;
		};	

		container.mergeInfoMap = mergeInfoMap;
		container.versionA = "Version" + versionA;
		container.versionB = "Version" + versionB;
		col2.setValue(container.versionA);
		col3.setValue(container.versionB);		

		for(uuid in mergeInfoMap){
			if(mergeInfoMap.hasOwnProperty(uuid)){
				nodeInfo = mergeInfoMap[uuid];
				if( nodeInfo.isMerged || nodeInfo.isConflicted){
					makeAttrOptions(nodeInfo);
				}					
			}
		}

	};

	return container;
};