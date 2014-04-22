var MergeInfoWin = function(verA, verB){
	var container = new UI.Window("Merged Information").setId("mergeInforWin");
	var versionA = 'Version' + verA, versionB = 'Version' + verB;
	var mergeInfoMap;
	var selectedNode;

	//control panel
	var controlBtnRow = new UI.Panel();
	var cancelBtn = new UI.Button( 'Cancel' ).setMarginLeft( '7px' ).onClick( function () {
		
	} );
	var commitBtn = new UI.Button( 'Commit' ).setMarginLeft( '7px' ).onClick( function () {
		if(container.onCommit){
			container.onCommit();
		}
	} );

	controlBtnRow.add(cancelBtn);
	controlBtnRow.add(commitBtn);

	container.add( new UI.Break() );
	// container.add( new UI.Text( 'Control Panel' ).setClass('title') );
	// container.add( new UI.Break(), new UI.Break() );
	container.add(controlBtnRow);	

	//node info list

	var nodeHeader = new UI.Panel();
	var nodeSelect = new UI.FancySelect();
	var nodeResultRow = new UI.Panel();
	var nodeResultType = new UI.Select().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );

	nodeHeader.add( new UI.Text( 'UUID' ).setWidth( '33%' ).setTextAlign('center') );
	nodeHeader.add( new UI.Text( versionA ).setWidth( '33%' ).setTextAlign('center') );
	nodeHeader.add( new UI.Text( versionB ).setWidth( '33%' ).setTextAlign('center') );

	
	nodeSelect.onChange( function onChange() {
		var uuid = nodeSelect.getValue();
		var nodeInfo = mergeInfoMap[uuid];
		var options = {};
		var result;

		options[versionA] = versionA;
		options[versionB] = versionB;

		selectedNode = nodeInfo;
		attrSelect.setOptions(nodeInfo.attrOptions);
		attrResultType.setOptions({});
		subSceneSelect.setOptions(nodeInfo.subSceneOptions);
		subSceneResultType.setOptions({});

		result = nodeInfo.nodeLog.result;
		if(options[result] === undefined){
			options[result] = result;
		}
		nodeResultType.setOptions(options).setValue(result);
	} );

	nodeResultRow.add( new UI.Text( 'Merge Result' ).setWidth( '40%' ) );
	nodeResultRow.add( nodeResultType );

	container.add( new UI.Break() );
	container.add( new UI.Text( 'Node List' ).setClass('title') );
	container.add( new UI.Break(), new UI.Break() );
	container.add(nodeHeader);
	container.add(nodeSelect);
	container.add(nodeResultRow);

	//attr info list
	var attrHeader = new UI.Panel();
	var attrSelect = new UI.FancySelect();
	var attrResultRow = new UI.Panel();
	var attrResultType = new UI.Select().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );

	attrHeader.add( new UI.Text( 'Key' ).setWidth( '33%' ).setTextAlign('center') );
	attrHeader.add( new UI.Text( versionA ).setWidth( '33%' ).setTextAlign('center') );
	attrHeader.add( new UI.Text( versionB ).setWidth( '33%' ).setTextAlign('center') );	

	attrSelect.onChange(function onChange(){
		var key = attrSelect.getValue();
		var options = {};	
		options[versionA] = versionA;
		options[versionB] = versionB;

		var result = selectedNode.attrInfoMap[key].result;
		if(options[result] === undefined){
			options[result] = result;
		}
		attrResultType.setOptions(options).setValue(result);
	});

	attrResultRow.add( new UI.Text( 'Merge Result' ).setWidth( '40%' ) );
	attrResultRow.add( attrResultType );	

	container.add( new UI.Break() );
	container.add( new UI.Text( 'Attribute List' ).setClass('title') );
	container.add( new UI.Break(), new UI.Break() );
	container.add(attrHeader);
	container.add(attrSelect);
	container.add(attrResultRow);


	//subscene info list

	var subSceneHeader = new UI.Panel();
	var subSceneSelect = new UI.FancySelect();
 	var subSceneResultRow = new UI.Panel();
	var subSceneResultType = new UI.Select().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );

	subSceneHeader.add( new UI.Text( 'UUID' ).setWidth( '33%' ).setTextAlign('center') );
	subSceneHeader.add( new UI.Text( versionA ).setWidth( '33%' ).setTextAlign('center') );
	subSceneHeader.add( new UI.Text( versionB ).setWidth( '33%' ).setTextAlign('center') );

	subSceneSelect.onChange(function onChange(){
		var key = subSceneSelect.getValue();
		var options = {};	
		options[versionA] = versionA;
		options[versionB] = versionB;

		var result = selectedNode.subSceneInfoMap[key].result;
		if(options[result] === undefined){
			options[result] = result;
		}
		subSceneResultType.setOptions(options).setValue(result);
	});
	
	subSceneResultRow.add( new UI.Text( 'Merge Result' ).setWidth( '40%' ) );
	subSceneResultRow.add( subSceneResultType );	

	container.add( new UI.Break() );
	container.add( new UI.Text( 'SubScene List' ).setClass('title') );
	container.add( new UI.Break(), new UI.Break() );
	container.add(subSceneHeader);
	container.add(subSceneSelect);	
	container.add(subSceneResultRow);


	container.setOverflow('scroll');
	container.setWidth(300);
	container.setLeft(document.body.scrollWidth/3 + 'px');
	container.hide();


	container.setInfo = function(infoMap){

		var makeAttrOptions = function(nodeInfo) {
			var attrOptions = {}, subSceneOptions = {};
			var attrInfoMap = {}, subSceneInfoMap = {};
			var col1, col2, col3;

			_.each(nodeInfo.attrLog, function(attrLog){

				col1 = '<span><input style="width:90%" value="'+ attrLog.key +'" disabled></span>';
				col2 = '<span>' + attrLog[versionA] + '</span>';
				col3 = '<span>' + attrLog[versionB] + '</span>';

				attrOptions[attrLog.key] = '<div class="' + attrLog.type + '">' + col1 + col2 + col3 + '</div>';
				attrInfoMap[attrLog.key] = attrLog;
			});

			_.each(nodeInfo.subScene, function(subScene){

				col1 = '<span><input style="width:90%" value="'+ subScene.uuid +'" disabled></span>';
				col2 = '<span>' + subScene[versionA] + '</span>';
				col3 = '<span>' + subScene[versionB] + '</span>';

				subSceneOptions[subScene.uuid] = '<div class="' + subScene.type + '">' + col1 + col2 + col3 + '</div>';				
				subSceneInfoMap[subScene.uuid] = subScene;
			});

			nodeInfo.attrOptions = attrOptions;
			nodeInfo.subSceneOptions = subSceneOptions;
			nodeInfo.attrInfoMap = attrInfoMap;
			nodeInfo.subSceneInfoMap = subSceneInfoMap;
		};

		var makeNodeOptions = function(infoMap) {
			var options = {};
			var uuid, nodeInfo;
			var col1, col2, col3;	
					
			for(uuid in infoMap){

				nodeInfo = infoMap[uuid];
				if( nodeInfo.isMerged || nodeInfo.isConflicted){
					col1 = '<span><input style="width:90%" value="'+ uuid +'" disabled></span>';
					col2 = '<span>' + nodeInfo.nodeLog[versionA] + '</span>';
					col3 = '<span>' + nodeInfo.nodeLog[versionB] + '</span>';

					options[uuid] = '<div class="' + (nodeInfo.isConflicted ? 'conflicted' : 'merged') + '">' + col1 + col2 + col3 + '</div>';
					makeAttrOptions(nodeInfo);
				}
			}

			return options;			
		};

		mergeInfoMap = infoMap;
		nodeSelect.setOptions(makeNodeOptions(infoMap));			
	};

	return container;
};