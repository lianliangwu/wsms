Menubar.Window = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );
	container.setWidth('70px');

	var title = new UI.Panel();
	title.setTextContent( 'Window' );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	//

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// scene

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Scene Window' );
	option.onClick( function () {

		editor.sceneWin.show();

	} );
	options.add( option );

	// models

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Model Window' );
	option.onClick( function () {

		editor.modelWin.show();

	} );
	options.add( option );

	// tree

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Manage Window' );
	option.onClick( function () {

		editor.treeWin.show();
		editor.treeWin.customMethod();

	} );
	options.add( option );

	// assets

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Asset Window' );
	option.onClick( function () {

		editor.assetWin.show();

	} );
	options.add( option );

	// versions

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Version Window' );
	option.onClick( function () {

		editor.versionWin.show();

	} );
	options.add( option );	

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Geometry Window' );
	option.onClick( function () {

		var geoWin = new GeoViewerWin();
		document.body.appendChild( geoWin.dom );
		geoWin.show();

		var sphereGeometry = new THREE.SphereGeometry( 50, 32, 16 ); 
		geoWin.setGeometry(sphereGeometry);

	} );
	options.add( option );	

	// history

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'History Window' );
	option.onClick( function () {

		editor.historyWin.show();

	} );
	options.add( option );

	return container;

};
