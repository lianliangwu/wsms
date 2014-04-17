var Scenewin = function ( editor ) {
	var sceneMap = {};

	var container = new UI.Window("Viewer");

	var sceneSelect = new UI.FancySelect().setId( 'sceneSelect' );
	sceneSelect.onChange( function () {

	} );

	var sceneControlRow = new UI.Panel();
	var newSceneBtn = new UI.Button( 'New Scene' ).setMarginLeft( '7px' ).onClick( function () {
		editor.resetScene();
	} );
	var loadSceneBtn = new UI.Button( 'Load Scene' ).setMarginLeft( '7px' ).onClick( function () {
		var uuid = sceneSelect.getValue();	
		//load the newest version
		editor.revCon.retrieve(uuid, sceneMap[uuid].newestVersion);
	} );
	var shareSceneBtn = new UI.Button( 'Share Scene' ).setMarginLeft( '7px' ).onClick( function () {
		var email = prompt("share scene with:","");
	} );
	var versionBtn = new UI.Button( 'View Versions' ).setMarginLeft( '7px' ).onClick( function () {
		var uuid = sceneSelect.getValue();
		if(!uuid){
			alert("no scene selected!")
		}else{
			editor.versionwin.show(sceneSelect.getValue());	
		}
	} );
	var removeBtn = new UI.Button( 'Remove Scene' ).setMarginLeft( '7px' ).onClick( function () {

	} );

	sceneControlRow.add( newSceneBtn );
	sceneControlRow.add( loadSceneBtn );
	sceneControlRow.add( shareSceneBtn );
	sceneControlRow.add( versionBtn );
	sceneControlRow.add( removeBtn );	
	sceneControlRow.setMargin("10px");
	sceneControlRow.setTextAlign('center');


	container.add( sceneSelect );
	container.add( sceneControlRow );
	container.hide();


	return container;

}
