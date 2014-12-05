var Menubar = function ( editor ) {
	"use strict";
	var container = new UI.Panel();

	container.add( new Menubar.File( editor ) );
	container.add( new Menubar.Edit( editor ) );
	container.add( new Menubar.Add( editor ) );
	container.add( new Menubar.View( editor ) );
	container.add( new Menubar.RVC( editor ) );
	container.add( new Menubar.Model( editor ) );
	container.add( new Menubar.Window( editor ) );
	container.add( new Menubar.Collaboration( editor ) );
	container.add( new Menubar.Help( editor ) );
	container.add( new Menubar.Exit());
	container.add( new Menubar.User());

	return container;

};
