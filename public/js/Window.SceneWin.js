/*global UI, Ajax*/
var SceneWin = function ( editor ) {
	"use strict";
	var container = new UI.Window("Scene Manager"),
		sceneSelect = new UI.FancySelect().setId( 'sceneSelect' ),
		sceneControlRow = new UI.Panel(),
		newSceneBtn = new UI.Button( 'New' ).setMarginLeft( '7px' ).onClick(addScene),
		loadSceneBtn = new UI.Button( 'Load' ).setMarginLeft( '7px' ).onClick( loadScene ),
		versionBtn = new UI.Button( 'View Versions' ).setMarginLeft( '7px' ).onClick( viewVersions ),
		removeBtn = new UI.Button( 'Remove' ).setMarginLeft( '7px' ),
		sceneMap = {};

	
	container.setInnerHeight("300px");	

	sceneControlRow.add( newSceneBtn );
	sceneControlRow.add( loadSceneBtn );
	sceneControlRow.add( removeBtn );
	sceneControlRow.add( versionBtn );	
	sceneControlRow.setMargin("10px");
	sceneControlRow.setTextAlign('center');

	container.add( sceneSelect );
	container.add( sceneControlRow );
	loadSceneInfo();
	container.hide();

	function loadSceneInfo() {
		var params = {};

		Ajax.getJSON({
			'url': 'getAllScenes',
			'params': params
		}, function onEnd(err, result) {
			if(result.scenes){
				var options = {};
				result.scenes.forEach(function onEach(scene) {
					sceneMap[scene.uuid] = scene;
					options[scene.uuid] = scene.name;
				});

				sceneSelect.setOptions(options);
			}
		});
	}

	function addScene() {
		var name = prompt('scene name', '');		
		if(name){
			editor.resetScene();
			editor.scene.name = name;
			var params = {
				'name': name,
				'uuid': editor.scene.uuid
			};

			Ajax.post({
				'url': 'addScene',
				'params': params
			}, function onEnd(err, result) {
				if(result.success === true){
					editor.scene.userData.currentVersion = result.versionNum;
					editor.scene.userData.branch = result.branch;
					console.log("scene " + name + " added");
				}
			});
		}
	} 

	function loadScene() {
		var sceneId = sceneSelect.getValue();

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
		var uuid = sceneSelect.getValue();
		if(!uuid){
			alert("no scene selected!");
		}else{
			editor.versionWin.show(sceneSelect.getValue());	
		}
	}
	return container;

};
