var Viewerwin = function ( outEditor ) {
	var container = new UI.Window("Viewer");

	var viewer = new UI.Viewer();

	container.add(viewer);
	container.editor = viewer.editor;

	container.signals.windowResized.add(function(){
		viewer.render(container.getWidth(), container.getHeight());
	});
	container.signals.windowOpened.add(function(){
		viewer.render(container.getWidth(), container.getHeight());
	});

	container.render = function(){
		//viewer.render(container.getWidth(), container.getHeight());
	};
	container.hide();
	return container;

}
