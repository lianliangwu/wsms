var ViewerWin = function ( ) {
	var container = new UI.Window("Viewer");

	var viewer = new UI.Viewer();

	container.add(viewer);
	
	container.signals.windowResized.add(function(){
		viewer.resize(container.getInnerWidth(), container.getInnerHeight());
	});
	container.signals.windowOpened.add(function(){
		viewer.resize(container.getInnerWidth(), container.getInnerHeight());
	});

	container.render = function(){
		//viewer.render(container.getWidth(), container.getHeight());
	};
	container.setScene = function(scene){
		viewer.editor.setScene(scene);
	};
	
	container.hide();
	container.viewer = viewer;
	return container;

}
