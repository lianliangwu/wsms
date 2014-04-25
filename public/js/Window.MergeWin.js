var MergeWin = function () {
	var container = new UI.Window("Merge Window");
	var viewer = new UI.Viewer();
	var sceneWinA = new ViewerWin();
	var sceneWinB = new ViewerWin();
	var mergeControlWin;
	var mergeEditor = MergeEditor();


	document.body.appendChild( sceneWinA.dom );
	document.body.appendChild( sceneWinB.dom );

	container.add(viewer);
	container.editor = viewer.editor;
	container.hide();


	container.signals.windowResized.add(function onWindowResized(){
		viewer.resize(container.getWidth(), container.getHeight());
	});
	container.signals.windowOpened.add(function onWindowOpened(){
		viewer.resize(container.getWidth(), container.getHeight());
	});

	//synchronize the object selection
	sceneWinA.viewer.signals.objectSelected.add(function onObjectSelected(object){
		if(object){
			selectObject(object.uuid);			
		}
	});
	sceneWinB.viewer.signals.objectSelected.add(function onObjectSelected(object){
		if(object){
			selectObject(object.uuid);			
		}
	});
	viewer.signals.objectSelected.add(function onObjectSelected(object){
		if(object){
			selectObject(object.uuid);			
		}
	});		

	container.render = function(){
		//viewer.render(container.getWidth(), container.getHeight());
	};
	container.setScene = function(scene){
		viewer.editor.setScene(scene);
	};
	
	container.show = function(sceneId, versionA, versionB, versionC) {
		container.dom.style.display = "";
		viewer.resize(container.getWidth(), container.getHeight());
		if(sceneId && versionA && versionB){
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

				mergeControlWin = new mergeControlWin(versionA, versionB, viewer);
				
				mergeControlWin.onCommit = function onCommit(){
					editor.revCon.commit([versionA, versionB], viewer.editor.scene);
				};
				mergeControlWin.onNodeSelected = function onNodeSelected(uuid){
					selectObject(uuid);
				};

				document.body.appendChild( mergeControlWin.dom );

				init(result.sceneA, result.sceneB, result.mergedScene, result.infoMap);
			});
		}
	};

	function init(sceneA, sceneB, mergedScene, infoMap){
		var height = document.body.scrollHeight;
		var width = document.body.scrollWidth;

		sceneWinA.show();
		sceneWinA.setPosition({
			top: '0px',
			left: '0px'
		});
		sceneWinA.setWidth(width/4*1.5);
		sceneWinA.setHeight(height/2);
		sceneWinA.setScene(sceneA);

		sceneWinB.show();
		sceneWinB.setPosition({
			top: '0px',
			left: width/4*1.5 + '0px'
		});
		sceneWinB.setWidth(width/4*1.5);
		sceneWinB.setHeight(height/2);		
		sceneWinB.setScene(sceneB);

		container.setPosition({
			top: height/2 + 'px',
			left: '0px'
		});
		container.setWidth(width/4*3);
		container.setHeight(height/2);				
		viewer.editor.setScene(mergedScene);

		mergeControlWin.setPosition({
			top: '0px',
			left: width/4*3 + 'px'
		});
		mergeControlWin.setWidth(width/4);
		mergeControlWin.setHeight(height);
		mergeControlWin.setInfo(infoMap);
		mergeControlWin.show();
	};	

	function selectObject(uuid){
		var selected = sceneWinA.viewer.editor.selected;		
		if(!selected || (selected&&selected.uuid !== uuid)){
			sceneWinA.viewer.editor.selectByUuid(uuid);	
		}

		selected = sceneWinB.viewer.editor.selected;
		if(!selected || (selected&&selected.uuid !== uuid)){
			sceneWinB.viewer.editor.selectByUuid(uuid);	
		}

		selected = viewer.editor.selected
		if(!selected || (selected&&selected.uuid !== uuid)){
			viewer.editor.selectByUuid(uuid);	
		}		
	}
	
	container.viewer = viewer;
	return container;

};


