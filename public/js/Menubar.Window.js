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

	return container;

}
