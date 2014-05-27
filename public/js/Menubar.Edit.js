Menubar.Edit = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setTextContent( 'Edit' );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	//

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// clone

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Clone' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object.parent === undefined ) return; // avoid cloning the camera or scene

		object = object.clone();

		editor.addObject( object );
		editor.select( object );

	} );
	options.add( option );

	// delete

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Delete' );
	option.onClick( function () {

		editor.removeObject( editor.selected );
		editor.deselect();

	} );
	options.add( option );

	options.add( new UI.HorizontalRule() );

	// convert to BufferGeometry

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Convert' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object.geometry instanceof THREE.Geometry ) {

			if ( object.parent === undefined ) return; // avoid flattening the camera or scene

			if ( confirm( 'Convert ' + object.name + ' to BufferGeometry?' ) === false ) return;

			delete object.__webglInit; // TODO: Remove hack (WebGLRenderer refactoring)

			object.geometry = THREE.BufferGeometryUtils.fromGeometry( object.geometry );

			editor.signals.objectChanged.dispatch( object );

		}

	} );
	options.add( option );

	// flatten

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Flatten' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object.parent === undefined ) return; // avoid flattening the camera or scene

		if ( confirm( 'Flatten ' + object.name + '?' ) === false ) return;

		delete object.__webglInit; // TODO: Remove hack (WebGLRenderer refactoring)

		var geometry = object.geometry.clone();
		geometry.applyMatrix( object.matrix );

		object.geometry = geometry;

		object.position.set( 0, 0, 0 );
		object.rotation.set( 0, 0, 0 );
		object.scale.set( 1, 1, 1 );

		editor.signals.objectChanged.dispatch( object );

	} );
	options.add( option );


	options.add( new UI.HorizontalRule() );

	//save scene

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Outline' );
	option.onClick(function(){
		var mesh = editor.selected;

		outline(mesh, 0xff0000);
	});

	function outline (mesh, color) {
		var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: color, side: THREE.BackSide } );
		var outlineMesh1 = new THREE.Mesh( mesh.geometry.clone(), outlineMaterial1 );
		outlineMesh1.applyMatrix(mesh.matrixWorld);
		// outlineMesh1.position = mesh.position;
		outlineMesh1.scale.multiplyScalar(1.05);
		editor.sceneHelpers.add(outlineMesh1);
		// outlineMesh1.visible = false;
		editor.signals.sceneGraphChanged.dispatch();
		// editor.addObject(outlineMesh1);
	}
	options.add( option );

	// //load scene

	// var option = new UI.Panel();
	// option.setClass( 'option' );
	// option.setTextContent( 'Load Scene' );
	// option.onClick( function () {

	// 	editor.loadScene('9BE88E13-8F5C-406F-8B0D-22A91D7DA7A1');	

	// } );
	// options.add( option );

	// //commit scene

	// var option = new UI.Panel();
	// option.setClass( 'option' );
	// option.setTextContent( 'Commit' );
	// option.onClick(function(){
	// 	editor.revCon.commit();
	// });
	// options.add( option );

	// //retrieve scene
	// var option = new UI.Panel();
	// option.setClass( 'option' );
	// option.setTextContent( 'Retrieve' );
	// option.onClick(function(){
	// 	editor.revCon.retrieve();
	// });
	// options.add( option );


	//options.add( new UI.HorizontalRule() );	

	return container;

}
