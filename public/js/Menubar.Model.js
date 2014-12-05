/*global UI, Menubar, Ajax*/
Menubar.Model = function ( editor ) {
	"use strict";

	var container = new UI.Panel(),
		title = new UI.Panel(),
		options = new UI.Panel(),
		option = null;
	
	container.setClass( 'menu' );
	container.setWidth('60px');

	title.setTextContent( 'Model' );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	options.setClass( 'options' );
	container.add( options );

	// Checkout
	option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'newModel' );
	option.onClick( newModel );
	options.add( option );

	option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'saveAsModel' );
	option.onClick( saveAsModel );
	options.add( option );


	function newModel() {
		var name = prompt('model name', '');		
		if(name){
			editor.resetScene();
			editor.scene.name = name;
			var params = {
				'name': name,
				'uuid': editor.scene.uuid
			};

			Ajax.post({
				'url': 'addModel',
				'params': params
			}, function onEnd(err, result) {
				if(result.success === true){
					editor.scene.userData.currentVersion = result.versionNum;
					editor.scene.userData.branch = result.branch;
					console.log("model " + name + " added");
				}
			});
		}
	}
	function saveAsModel() {
		editor.revCon.commit(editor.scene);
	}

	return container;

};
