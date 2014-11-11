Menubar.Collaboration = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );
	container.setWidth('65px');

	var title = new UI.Panel();
	title.setTextContent( 'Collab' );
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
	option.setTextContent( 'Synchronous' );
	option.onClick( function () {


	} );
	options.add( option );

	// retrieve

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Asynchronous' );
	option.onClick( function () {


	} );
	options.add( option );

	return container;
};
