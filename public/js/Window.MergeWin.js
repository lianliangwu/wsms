var MergeWin = function ( editor ) {
	var container = new UI.Window("Merge Window");
	var viewer = new UI.Viewer();
	var sceneWinA = new ViewerWin();
	var sceneWinB = new ViewerWin();

	document.body.appendChild( sceneWinA.dom );
	document.body.appendChild( sceneWinB.dom );

	container.add(viewer);
	container.editor = viewer.editor;

	container.signals.windowResized.add(function(){
		viewer.resize(container.getWidth(), container.getHeight());
	});
	container.signals.windowOpened.add(function(){
		viewer.resize(container.getWidth(), container.getHeight());
	});

	function init(sceneA, sceneB, mergedScene, infoMap){
		var height = document.body.scrollHeight;
		var width = document.body.scrollWidth;

		sceneWinA.show();
		sceneWinA.setPosition({
			top: '0px',
			left: '0px'
		});
		sceneWinA.setWidth(width/3);
		sceneWinA.setHeight(height/2);
		sceneWinA.setScene(sceneA);

		sceneWinB.show();
		sceneWinB.setPosition({
			top: height/2 + 'px',
			left: '0px'
		});
		sceneWinB.setWidth(width/3);
		sceneWinB.setHeight(height/2);		
		sceneWinB.setScene(sceneB);

		container.setPosition({
			top: '0px',
			left: width/3 + 'px'
		});
		container.setWidth(width/3*2);
		container.setHeight(height);				
		viewer.editor.setScene(mergedScene);
	};

	container.render = function(){
		//viewer.render(container.getWidth(), container.getHeight());
	};
	container.setScene = function(scene){
		viewer.editor.setScene(scene);
	};
	container.hide();

	container.show = function(sceneId, versionA, versionB, versionC) {
		container.dom.style.display = "";
		viewer.resize(container.getWidth(), container.getHeight());
		if(sceneId && versionA && versionB){
			editor.revCon.merge(sceneId, versionA, versionB, versionC, function(err, result) {
				init(result.sceneA, result.sceneB, result.mergedScene, result.infoMap);
			});
		}
	};

	return container;

}
