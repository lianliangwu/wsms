/*global UI*/
Menubar.Model = function ( editor ) {
	"strict";

	var container = new UI.Panel();
	container.setClass( 'menu' );
	container.setWidth('45px');

	var title = new UI.Panel();
	title.setTextContent( 'RVC' );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// Checkout

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'saveAsModel' );
	option.onClick( saveAsModel );
	options.add( option );



	function saveAsModel() {
		editor.revCon.addModel(editor.scene);
	}

	return container;

};
