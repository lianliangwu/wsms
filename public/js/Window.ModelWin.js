/*global UI, Ajax*/
var ModelWin = function ( editor ) {
	"use strict";
	var container = new UI.Window("Model Manager"),
		modelSelect = new UI.FancySelect().setId( 'modelSelect' ),
		modelControlRow = new UI.Panel(),
		newModelBtn = new UI.Button( 'New' ).setMarginLeft( '7px' ).onClick(addModel),
		loadModelBtn = new UI.Button( 'Load' ).setMarginLeft( '7px' ).onClick( loadModel ),
		versionBtn = new UI.Button( 'View Versions' ).setMarginLeft( '7px' ).onClick( viewVersions ),
		removeBtn = new UI.Button( 'Remove' ).setMarginLeft( '7px' ).onClick(removeModel),
		sceneMap = {};

	
	container.setInnerHeight("300px");
	container.setInnerWidth("250px");

	modelControlRow.add( newModelBtn );
	modelControlRow.add( loadModelBtn );
	modelControlRow.add( removeBtn );
	modelControlRow.add( versionBtn );	
	modelControlRow.setMargin("10px");
	modelControlRow.setTextAlign('center');

	container.add( modelSelect );
	container.add( modelControlRow );
	loadModelInfo();
	container.hide();

	function loadModelInfo() {
		var params = {
			start: 0,
			limit: 10
		};

		Ajax.getJSON({
			'url': 'getModels',
			'params': params
		}, function onEnd(err, result) {
			if(result.models){
				var options = {};
				result.models.forEach(function onEach(model) {
					sceneMap[model.uuid] = model;
					options[model.uuid] = model.name;
				});

				modelSelect.setOptions(options);
			}
		});
	}

	function addModel() {
		var name = prompt('model name', '');		
		if(name){
			editor.resetScene();
			editor.scene.name = name;
			var params = {
				'name': name,
				'uuid': editor.scene.uuid
			};

			Ajax.post({
				'url': 'addModel',
				'params': params
			}, function onEnd(err, result) {
				if(result.success === true){
					editor.scene.userData.currentVersion = result.versionNum;
					editor.scene.userData.branch = result.branch;
					console.log("model " + name + " added");
					loadModelInfo();
				}
			});
		}
	} 

	function loadModel() {
		var sceneId = modelSelect.getValue();

		editor.revCon.checkout({
			'name': 'master',
			'sceneId': sceneId
		}, function onEnd(err, scene) {
			if(!err){
				//checkout success
				editor.setScene(scene);
				console.log('checkout success.');
			}
		});		
	}

	function viewVersions() {
		var uuid = modelSelect.getValue();
		if(!uuid){
			alert("no model selected!");
		}else{
			editor.versionWin.show(modelSelect.getValue());	
		}
	}

	function removeModel() {
		var uuid = modelSelect.getValue(),
			params = {
			'sceneId': uuid
		};

		Ajax.post({
			'url': 'removeModel',
			'params': params
		}, function onEnd(err, result) {
			if(result.success === true){
				console.log("model " + name + " removed");
				loadModelInfo();
			}
		});
	}
	return container;

};
