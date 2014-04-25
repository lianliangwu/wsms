var MergeControlWin = function(verA, verB, viewer){
	var container = new UI.Window("Merged Information").setId("mergeInforWin");
	var versionA = 'Version' + verA, versionB = 'Version' + verB;
	var mergeInfoMap;
	var selectedNode;
	var SIGNALS = signals;

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

		if(container.onNodeSelected){
			container.onNodeSelected(uuid);
		}
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
	var versionARow = new UI.Panel();
	var valueA = new UI.Input().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );
	var versionBRow = new UI.Panel();
	var valueB = new UI.Input().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );	
	var attrResultRow = new UI.Panel();
	var attrResultType = new UI.Select().setWidth( '50%' ).setColor( '#444' ).setFontSize( '12px' );

	attrHeader.add( new UI.Text( 'Key' ).setWidth( '33%' ).setTextAlign('center') );
	attrHeader.add( new UI.Text( versionA ).setWidth( '33%' ).setTextAlign('center') );
	attrHeader.add( new UI.Text( versionB ).setWidth( '33%' ).setTextAlign('center') );	

	attrSelect.onChange(function onChange(){
		//set version values
		var key = attrSelect.getValue();	
		var uuid = nodeSelect.getValue();
		var node = mergeInfoMap[uuid];		

		_.each(node.attrLog, function onEach(attrLog){
			if(key === attrLog.key){
				valueA.setValue(attrLog.value[versionA]);
				valueB.setValue(attrLog.value[versionB]);
			}
		});

		//set result select
		var result = selectedNode.attrInfoMap[key].result;
		var options = {};	
		options[versionA] = versionA;
		options[versionB] = versionB;			
		if(options[result] === undefined){
			options[result] = result;
		}
		attrResultType.setOptions(options).setValue(result);
	});

	versionARow.add( new UI.Text( versionA ).setWidth( '40%' ) );
	versionARow.add( valueA );	

	versionBRow.add( new UI.Text( versionB ).setWidth( '40%' ) );
	versionBRow.add( valueB );	

	attrResultType.onChange(function onChange(){
		var uuid = nodeSelect.getValue();
		var node = mergeInfoMap[uuid];
		var key = attrSelect.getValue();
		var version = attrResultType.getValue();
		var object = viewer.editor.selected;
		var value;

		//get the related atrribute value of selected result version
		_.each(node.attrLog, function onEach(attrLog){
			if(key === attrLog.key){
				value = attrLog.value[version];
				updateObject(object, key, value);
			}
		});

	});

	attrResultRow.add( new UI.Text( 'Merge Result' ).setWidth( '40%' ) );
	attrResultRow.add( attrResultType );	

	container.add( new UI.Break() );
	container.add( new UI.Text( 'Attribute List' ).setClass('title') );
	container.add( new UI.Break(), new UI.Break() );
	container.add(attrHeader);
	container.add(attrSelect);
	container.add(versionARow);
	container.add(versionBRow);
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


	//container configuration
	container.setOverflow('scroll');
	container.setWidth(300);
	container.setLeft(document.body.scrollWidth/3 + 'px');
	container.hide();


	container.setInfo = function(infoMap){

		var makeAttrOptions = function(nodeInfo) {
			var attrOptions = {}, subSceneOptions = {};
			var attrInfoMap = {}, subSceneInfoMap = {};
			var col1, col2, col3;

			_.each(nodeInfo.attrLog, function onEach(attrLog){

				col1 = '<span><input style="width:90%" value="'+ attrLog.key +'" disabled></span>';
				col2 = '<span>' + attrLog[versionA] + '</span>';
				col3 = '<span>' + attrLog[versionB] + '</span>';

				attrOptions[attrLog.key] = '<div class="' + attrLog.type + '">' + col1 + col2 + col3 + '</div>';
				attrInfoMap[attrLog.key] = attrLog;
			});

			_.each(nodeInfo.subScene, function onEach(subScene){

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

	function updateObject(object, key, value){
		var updateObject = viewer.editor.engine.updateObject;

		if(key === 'matrix'){
			var matrix = new THREE.Matrix4(
				value[0],value[4],value[8],value[12],
				value[1],value[5],value[9],value[13],
				value[2],value[6],value[10],value[14],
				value[3],value[7],value[11],value[15]);
			updateObject.setMatrix(object, matrix);
		}
		if(key === 'name'){
			updateObject.setName(object, value);
		}
	}

	return container;
};