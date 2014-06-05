/*global UI*/
var ViewerWin = function ( ) {
	"use strict";
	var container = new UI.Window("Viewer");

	var viewer = new UI.Viewer();

	container.add(viewer);
	
	container.signals.windowResized.add(function(){
		var width = parseInt(container.getInnerWidth(), 10);
		var height = parseInt(container.getInnerHeight(), 10);
		viewer.resize(width, height);
	});
	container.signals.windowOpened.add(function(){
		var width = parseInt(container.getInnerWidth(), 10);
		var height = parseInt(container.getInnerHeight(), 10);
		viewer.resize(width, height);
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

};
