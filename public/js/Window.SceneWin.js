var SceneWin = function ( editor ) {
	var sceneMap = {};

	var container = new UI.Window("Scene Manager");

	var sceneSelect = new UI.FancySelect().setId( 'sceneSelect' );
	sceneSelect.onChange( function () {

	} );

	var sceneControlRow = new UI.Panel();
	var newSceneBtn = new UI.Button( 'New' ).setMarginLeft( '7px' ).onClick( function () {
		editor.resetScene();
	} );
	var loadSceneBtn = new UI.Button( 'Load' ).setMarginLeft( '7px' ).onClick( loadScene );
	var shareSceneBtn = new UI.Button( 'Share' ).setMarginLeft( '7px' ).onClick( function () {
		var email = prompt("share scene with:","");
	} );
	var versionBtn = new UI.Button( 'View Versions' ).setMarginLeft( '7px' ).onClick( function () {
		var uuid = sceneSelect.getValue();
		if(!uuid){
			alert("no scene selected!")
		}else{
			editor.versionWin.show(sceneSelect.getValue());	
		}
	} );
	var removeBtn = new UI.Button( 'Remove' ).setMarginLeft( '7px' ).onClick( function () {

	} );

	var loadScene = function() {
		//save scene
		var formData = new FormData();  

		// Set up the request.
		var xhr = new XMLHttpRequest();

		// Open the connection.
		xhr.open('GET', 'getAllScenes', true);

		// Set up a handler for when the request finishes.
		xhr.onload = function () {
			if (xhr.status === 200 && xhr.readyState === 4) {

				var scenes = JSON.parse(xhr.responseText).scenes;
				var options = {};

				scenes.forEach(function onEach(scene) {
					sceneMap[scene.uuid] = scene;
					options[scene.uuid] = scene.name;
				});

				sceneSelect.setOptions(options);			
				
			} else {
			  alert('An error occurred!');
			}
		};

		// Send the Data.
		xhr.send(formData);		
	};

	sceneControlRow.add( newSceneBtn );
	sceneControlRow.add( loadSceneBtn );
	sceneControlRow.add( shareSceneBtn );
	sceneControlRow.add( removeBtn );
	sceneControlRow.add( versionBtn );	
	sceneControlRow.setMargin("10px");
	sceneControlRow.setTextAlign('center');


	container.add( sceneSelect );
	container.add( sceneControlRow );
	loadScene();
	container.hide();

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
	return container;

}
