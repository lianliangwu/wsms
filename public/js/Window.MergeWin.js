var MergeWin = function () {
	var sceneWinA = new ViewerWin();
	var sceneWinB = new ViewerWin();
	var sceneWinD = new ViewerWin();
	var mergeControlWin = new MergeControlWin();
	var mergeEditor = new MergeEditor(sceneWinA.viewer, sceneWinB.viewer, sceneWinD.viewer);


	document.body.appendChild( sceneWinA.dom );
	document.body.appendChild( sceneWinB.dom );
	document.body.appendChild( sceneWinD.dom );

	mergeControlWin.onCommit = function onCommit(){
		//editor.revCon.commit([versionA, versionB], viewer.editor.scene);
	};
	mergeControlWin.onNodeSelected = function onNodeSelected(uuid){
		mergeEditor.selectObject(uuid);
	};

	document.body.appendChild( mergeControlWin.dom );	

	//synchronize the object selection
	sceneWinA.viewer.signals.objectSelected.add(function onObjectSelected(object){
		if(object){
			mergeEditor.selectObject(object.uuid);			
		}
	});
	sceneWinB.viewer.signals.objectSelected.add(function onObjectSelected(object){
		if(object){
			mergeEditor.selectObject(object.uuid);			
		}
	});
	sceneWinD.viewer.signals.objectSelected.add(function onObjectSelected(object){
		if(object){
			mergeEditor.selectObject(object.uuid);			
		}
	});		
	
	this.show = function(sceneId, versionA, versionB, versionC) {
		if(sceneId && versionA && versionB && versionC){
			var temp;
			if (Number(versionC) > Number(versionA)){
				temp = versionA;
				versionA = versionC;
				versionC = temp;
			}
			if (Number(versionC) > Number(versionB)){
				temp = versionB;
				versionB = versionC;
				versionC = temp;
			}	

			editor.revCon.merge(sceneId, versionA, versionB, versionC, function(err, result) {
				mergeControlWin.init(versionA, versionB, sceneWinD.viewer);
				init(result.sceneA, result.sceneB, result.mergedScene, result.infoMap);
			});
		}
	};

	//set up the layout
	function init(sceneA, sceneB, mergedScene, infoMap){
		var height = document.body.scrollHeight;
		var width = document.body.scrollWidth;

		//version A
		sceneWinA.show();
		sceneWinA.setPosition({
			top: '0px',
			left: '0px'
		});
		sceneWinA.setWidth(width/4*1.5);
		sceneWinA.setHeight(height/2);
		sceneWinA.setScene(sceneA);

		//version B
		sceneWinB.show();
		sceneWinB.setPosition({
			top: '0px',
			left: width/4*1.5 + '0px'
		});
		sceneWinB.setWidth(width/4*1.5);
		sceneWinB.setHeight(height/2);		
		sceneWinB.setScene(sceneB);

		//merged version D
		sceneWinD.show();
		sceneWinD.setPosition({
			top: height/2 + 'px',
			left: '0px'
		});
		sceneWinD.setWidth(width/4*3);
		sceneWinD.setHeight(height/2);				
		sceneWinD.setScene(mergedScene);

		//merge control window
		mergeControlWin.show();
		mergeControlWin.setPosition({
			top: '0px',
			left: width/4*3 + 'px'
		});
		mergeControlWin.setWidth(width/4);
		mergeControlWin.setHeight(height);
		mergeControlWin.setInfo(infoMap);
	};	
	
	return this;

};


