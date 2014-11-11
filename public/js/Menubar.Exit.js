/*global Menubar, UI, Utils*/
Menubar.Exit = function ( editor ) {
    "use strict";

    var container = new UI.Panel();
    container.setClass( 'menu' );
    container.setFloat( 'right' );

    var title = new UI.Panel();
    title.setTextContent( 'Exit' );
    title.setMargin( '0px' );
    title.setPadding( '8px' );
    container.add( title );

    return container;

};
