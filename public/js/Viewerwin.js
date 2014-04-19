var Viewerwin = function ( editor ) {

	var container = new UI.Window("Viewer");
	var SIGNALS = signals; 
	var objects = [];


	test = container;
	signals = container.signals;


//	container.hide();

	container.select = function ( object ) {

		this.selected = object;

		this.signals.objectSelected.dispatch( object );

	};
	container.draw = function(){
		var scene = new THREE.Scene();
		var sceneHelpers = new THREE.Scene();

		var camera = new THREE.PerspectiveCamera(50, container.getWidth() / container.getHeight(), 1, 5000);

		var renderer = new THREE.WebGLRenderer();
		renderer.setSize( container.getWidth(), container.getHeight() );
		renderer.setClearColor( '#aaaaaa' );	


		// helpers

		var selectionBox = new THREE.BoxHelper();
			selectionBox.material.depthTest = false;
			selectionBox.material.transparent = true;
			selectionBox.visible = false;
			sceneHelpers.add( selectionBox );

		var transformControls = new THREE.TransformControls( camera, container.dom );
		transformControls.addEventListener( 'change', function () {

			controls.enabled = true;

			if ( transformControls.axis !== null ) {

				controls.enabled = false;

			}

			if ( container.selected !== null ) {

				signals.objectChanged.dispatch( container.selected );

			}

		} );
		sceneHelpers.add( transformControls );

		// object picking

		var ray = new THREE.Raycaster();
		var projector = new THREE.Projector();
		// events

		var getIntersects = function ( event, object ) {

			var rect = container.dom.getBoundingClientRect();
			x = ( event.clientX - rect.left ) / rect.width;
			y = ( event.clientY - rect.top ) / rect.height;
			var vector = new THREE.Vector3( ( x ) * 2 - 1, - ( y ) * 2 + 1, 0.5 );

			projector.unprojectVector( vector, camera );

			ray.set( camera.position, vector.sub( camera.position ).normalize() );

			if ( object instanceof Array ) {

				return ray.intersectObjects( object );

			}

			return ray.intersectObject( object );

		};

		var onMouseDownPosition = new THREE.Vector2();
		var onMouseUpPosition = new THREE.Vector2();

		var onMouseDown = function ( event ) {

			event.preventDefault();

			var rect = container.dom.getBoundingClientRect();
			x = (event.clientX - rect.left) / rect.width;
			y = (event.clientY - rect.top) / rect.height;
			onMouseDownPosition.set( x, y );

			document.addEventListener( 'mouseup', onMouseUp, false );

		};

		var onMouseUp = function ( event ) {

			var rect = container.dom.getBoundingClientRect();
			x = (event.clientX - rect.left) / rect.width;
			y = (event.clientY - rect.top) / rect.height;
			onMouseUpPosition.set( x, y );

			if ( onMouseDownPosition.distanceTo( onMouseUpPosition ) == 0 ) {

				var intersects = getIntersects( event, objects );

				if ( intersects.length > 0 ) {

					var object = intersects[ 0 ].object;

					if ( object.userData.object !== undefined ) {

						// helper

						container.select( object.userData.object );

					} else {

						container.select( object );

					}

				} else {

					container.select( null );

				}

				render();

			}

			document.removeEventListener( 'mouseup', onMouseUp );

		};

		var onDoubleClick = function ( event ) {

			var intersects = getIntersects( event, objects );

			if ( intersects.length > 0 && intersects[ 0 ].object === container.selected ) {

				controls.focus( container.selected );

			}

		};

		container.dom.addEventListener( 'mousedown', onMouseDown, false );
		container.dom.addEventListener( 'dblclick', onDoubleClick, false );

		// controls need to be added *after* main logic,
		// otherwise controls.enabled doesn't work.

		var controls = new THREE.EditorControls( camera, container.dom );
		controls.center.fromArray( [0, 0, 0] )
		controls.addEventListener( 'change', function () {

			transformControls.update();
			signals.cameraChanged.dispatch( camera );

		} );

		signals.objectSelected.add( function ( object ) {

			selectionBox.visible = false;
			transformControls.detach();

			if ( object !== null ) {

				if ( object.geometry !== undefined &&
					 object instanceof THREE.Sprite === false ) {

					selectionBox.update( object );
					selectionBox.visible = true;

				}

				if ( object instanceof THREE.PerspectiveCamera === false ) {

					transformControls.attach( object );

				}

			}

			render();

		} );		
		signals.objectAdded.add( function ( object ) {

			var materialsNeedUpdate = false;

			object.traverse( function ( child ) {

				if ( child instanceof THREE.Light ) materialsNeedUpdate = true;

				objects.push( child );

			} );

			if ( materialsNeedUpdate === true ) updateMaterials();

		} );
		signals.objectChanged.add( function ( object ) {

			transformControls.update();

			if ( object !== camera ) {

				if ( object.geometry !== undefined ) {

					selectionBox.update( object );

				}

				if ( editor.helpers[ object.id ] !== undefined ) {

					editor.helpers[ object.id ].update();

				}

				updateInfo();

			}

			render();

		} );
		signals.objectRemoved.add( function ( object ) {

			var materialsNeedUpdate = false;

			object.traverse( function ( child ) {

				if ( child instanceof THREE.Light ) materialsNeedUpdate = true;

				objects.splice( objects.indexOf( child ), 1 );

			} );

			if ( materialsNeedUpdate === true ) updateMaterials();

		} );
		signals.helperAdded.add( function ( object ) {

			objects.push( object.getObjectByName( 'picker' ) );

		} );

		signals.helperRemoved.add( function ( object ) {

			objects.splice( objects.indexOf( object.getObjectByName( 'picker' ) ), 1 );

		} );				

		renderer.autoClear = false;
		renderer.autoUpdateScene = false;		
		container.dom.appendChild(renderer.domElement);

		var geometry = new THREE.CubeGeometry(100,100,100);
		var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
		var cube = new THREE.Mesh(geometry, material);
		scene.add(cube);

		camera.position.fromArray( [500, 250, 500]);
		camera.lookAt( new THREE.Vector3().fromArray( [0, 0, 0] ) );		 

		function render() {

			sceneHelpers.updateMatrixWorld();
			scene.updateMatrixWorld();

			renderer.clear();
			renderer.render( scene, camera );
			renderer.render( sceneHelpers, camera );

		}

		function animate() {

			requestAnimationFrame( animate );

		}

		render();
		animate();


	};

	return container;

}
