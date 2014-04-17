Menubar.Scene = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );
	container.setWidth('65px');

	var title = new UI.Panel();
	title.setTextContent( 'Scene' );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	//

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// new scene

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'New Scene' );
	option.onClick( function () {

		editor.resetScene();

	} );
	options.add( option );

	// retrieve

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Retrieve' );
	option.onClick( function () {

		editor.versionwin.show();

	} );
	options.add( option );

	// commit

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Commit' );
	option.onClick( function () {

		editor.revCon.commit();

	} );
	options.add( option );

	return container;

}
