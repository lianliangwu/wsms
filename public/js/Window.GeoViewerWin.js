/*global UI, THREE, editor*/
var GeoViewerWin = function () {
	"use strict";
	var container = new UI.Window("Geometry").setWidth('400px').setInnerHeight('300px');

	var viewer = new UI.Viewer();

	var btnRow = new UI.Panel();
	var snapShotBtn = new UI.Button( 'snapshot' ).setMarginLeft( '7px' ).onClick(takeShot);
	btnRow.add(snapShotBtn);
	btnRow.setTextAlign("center");


	container.add(viewer);
	container.add(btnRow);
	container.hide();
	container.viewer = viewer;

	container.signals.windowResized.add(function(){
		var width = parseInt(container.getInnerWidth(), 10);
		var height = parseInt(container.getInnerHeight(), 10) - 25;
		viewer.resize(width, height);
	});
	container.signals.windowOpened.add(function(){
		var width = parseInt(container.getInnerWidth(), 10);
		var height = parseInt(container.getInnerHeight(), 10) - 25;
		viewer.resize(width, height);
	});

	container.render = function(){
		//viewer.render(container.getWidth(), container.getHeight());
	};
	container.setGeometry = function(geometry){
		var scene = new THREE.Scene();

		var light = new THREE.PointLight(0xffffff);
		light.position.set(400,400,400);
		scene.add(light);

		var material = new THREE.MeshLambertMaterial();
		var mesh = new THREE.Mesh( geometry, material );
		scene.add( mesh );

		viewer.editor.setScene(scene);
	};

	container.setAsset = function(assetId){
		this.assetId = assetId;

		editor.asset.getGeoAsset(assetId, function onEnd(geometry) {
			this.setGeometry(geometry);
		});	
	};

	function takeShot(){
		var canvas = container.dom.getElementsByTagName("canvas")[0];
		var imgData = canvas.toDataURL();

		editor.asset.updateSnapshot({
			'imgData': imgData,
			'assetId': container.assetId
		}, function onEnd(err, result){
			if(err){
				console.log(err);
				return;
			}
			if(result.success === true){
				console.log("snapshot saved.");
				alert("snapshot saved.");
			}
		});
	}

	return container;
};
