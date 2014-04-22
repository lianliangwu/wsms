var MergeWin = function ( editor ) {
	var container = new UI.Window("Merge Window");
	var viewer = new UI.Viewer();
	var sceneWinA = new ViewerWin();
	var sceneWinB = new ViewerWin();
	var mergeInfoWin;


	document.body.appendChild( sceneWinA.dom );
	document.body.appendChild( sceneWinB.dom );

	container.add(viewer);
	container.editor = viewer.editor;
	container.hide();


	container.signals.windowResized.add(function(){
		viewer.resize(container.getWidth(), container.getHeight());
	});
	container.signals.windowOpened.add(function(){
		viewer.resize(container.getWidth(), container.getHeight());
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

				mergeInfoWin = new MergeInfoWin(versionA, versionB);
				
				mergeInfoWin.onCommit = function(){
					editor.revCon.commit([versionA, versionB], viewer.editor.scene);
				};
				document.body.appendChild( mergeInfoWin.dom );

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

		mergeInfoWin.setPosition({
			top: '0px',
			left: width/4*3 + 'px'
		});
		mergeInfoWin.setWidth(width/4);
		mergeInfoWin.setHeight(height);
		mergeInfoWin.setInfo(infoMap);
		mergeInfoWin.show();
	};	

	return container;

}
