var Mergewin = function ( editor ) {
	var container = new UI.Window("Merge Window");

	var sceneSelect = new UI.FancySelect().setId( 'sceneSelect' );
	sceneSelect.onChange( function () {

	} );

	var sceneControlRow = new UI.Panel();

	var commitBtn = new UI.Button( 'Commit Merged Version' ).setMarginLeft( '7px' ).onClick( function () {
		var uuid = sceneSelect.getValue();
		if(!uuid){
			alert("no scene selected!")
		}else{
			editor.versionwin.show(sceneSelect.getValue());	
		}
	} );
	var cancelBtn = new UI.Button( 'Cancel' ).setMarginLeft( '7px' ).onClick( function () {

	} );

	sceneControlRow.add( commitBtn );
	sceneControlRow.add( cancelBtn );	
	sceneControlRow.setMargin("10px");
	sceneControlRow.setTextAlign('center');


	container.add( sceneSelect );
	container.add( sceneControlRow );
	container.hide();

	container.show = function(sceneId, versionA, versionB, versionC) {
		container.dom.style.display = "";
		if(sceneId && versionA && versionB){
			editor.revCon.merge(sceneId, versionA, versionB, versionC, function(err, scene) {

			});
		}
	};

	return container;

}
