/*global UI, THREE, editor*/
var GeoViewerWin = function () {
	"use strict";
	var container = new UI.Window("Geometry").setWidth('400px').setInnerHeight('300px');
	var viewer = new UI.Viewer({"enableTransform": true});
	var signals = viewer.editor.signals;
	var btnRow = new UI.Panel();
	var nameRow = new UI.Panel();
	var snapShotBtn = new UI.Button( 'snapshot' ).setMarginLeft( '7px' ).onClick(takeShot);

	var translate = new UI.Button( 'translate' ).onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );

	var rotate = new UI.Button( 'rotate' ).onClick( function () {

		signals.transformModeChanged.dispatch( 'rotate' );

	} );

	var scale = new UI.Button( 'scale' ).onClick( function () {

		signals.transformModeChanged.dispatch( 'scale' );

	} );

	var nameInput = new UI.Input();
	nameRow.add(new UI.Text("Name: "));
	nameRow.add(nameInput);
	nameRow.setTextAlign("center");

	btnRow.add( translate );
	btnRow.add( rotate );
	btnRow.add( scale );
	btnRow.add(snapShotBtn);
	btnRow.setTextAlign("center");


	container.add(viewer);
	container.add(btnRow);
	container.add(nameRow);
	container.setPosition({
		top: '100px',
		left: '600px'		
	});
	container.hide();
	container.viewer = viewer;

	container.signals.windowResized.add(function(){
		var width = parseInt(container.getInnerWidth(), 10);
		var height = parseInt(container.getInnerHeight(), 10) - 50;
		viewer.resize(width, height);
	});
	container.signals.windowOpened.add(function(){
		var width = parseInt(container.getInnerWidth(), 10);
		var height = parseInt(container.getInnerHeight(), 10) - 50;
		viewer.resize(width, height);
	});

	nameInput.onChange(function onEvent(){
		var name = nameInput.getValue();

		var newAsset = {
			'uuid': container.assetId,
			'name': name
		};

		editor.asset.updateGeoAsset(newAsset, function onEnd(err, result){
			if(err){
				console.log(err);
				return;
			}
			if(result.success === true){
				console.log("asset updated.");
				alert("asset updated.");
			}			
		});
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
		var scope = this;
		this.assetId = assetId;

		editor.asset.getGeoAsset(assetId, function onEnd(data) {
			var loader = new THREE.JSONLoader();
			var result = loader.parse( data );
			var geometry = result.geometry;

			scope.setGeometry(geometry);
			scope.show();
		});	

		//get assetInfo
		editor.asset.getAssetInfo(assetId, function onEnd(err, result){
			if(err){
				console.log(err);
				return;
			}
			if(result.success === true){
				nameInput.setValue(result.asset.name);
			}
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
