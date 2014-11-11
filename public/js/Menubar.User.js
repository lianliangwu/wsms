/*global Menubar, UI, Utils*/
Menubar.User = function ( editor ) {
	"use strict";

	var container = new UI.Panel();
	container.setClass( 'menu' );
	container.setFloat( 'right' );
	container.setWidth( 'auto' );

	var title = new UI.Panel();
	title.setTextContent( 'Welcome, ' + Utils.readCookie('username') );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	return container;

};
