var Editor = function () {

	var SIGNALS = signals; 
	
	this.signals = {

		// actions

		playAnimations: new SIGNALS.Signal(),

		// notifications

		themeChanged: new SIGNALS.Signal(),

		transformModeChanged: new SIGNALS.Signal(),
		snapChanged: new SIGNALS.Signal(),
		spaceChanged: new SIGNALS.Signal(),
		rendererChanged: new SIGNALS.Signal(),

		sceneReseted: new SIGNALS.Signal(),
		sceneLoaded: new SIGNALS.Signal(),
		sceneGraphChanged: new SIGNALS.Signal(),

		cameraChanged: new SIGNALS.Signal(),

		objectSelected: new SIGNALS.Signal(),
		objectAdded: new SIGNALS.Signal(),
		objectChanged: new SIGNALS.Signal(),
		objectRemoved: new SIGNALS.Signal(),

		assetAdded: new SIGNALS.Signal(),//wzh

		helperAdded: new SIGNALS.Signal(),
		helperRemoved: new SIGNALS.Signal(),

		materialChanged: new SIGNALS.Signal(),
		fogTypeChanged: new SIGNALS.Signal(),
		fogColorChanged: new SIGNALS.Signal(),
		fogParametersChanged: new SIGNALS.Signal(),
		windowResize: new SIGNALS.Signal()

	};
	
	this.config = new Config();
	this.storage = new Storage();
	this.asset = new Asset(this);	
	this.loader = new Loader(this);
	this.revCon = new RevisionControl(this);


	this.scene = new THREE.Scene();
	this.sceneHelpers = new THREE.Scene();

	this.engine = new Engine(this);
	this.diffColor = new DiffColor(this); 

	this.scene.uuid = THREE.Math.generateUUID();//wzh
	//this.object = {};
	this.geometries = {};
	this.materials = {};
	this.textures = {};
	this.modifyInterface = {};

	this.selected = null;
	this.helpers = {};

};

Editor.prototype = {

	setTheme: function ( value ) {

		document.getElementById( 'theme' ).href = value;

		this.signals.themeChanged.dispatch( value );

	},
	saveScene: function () {//wzh

		var exporter = new THREE.ObjectExporter();
		var scene = exporter.parse(this.scene);
		var uuid = scene.object.uuid;
		var i, l;
		var geometry = {
			"uuid": null,
			"type": "BoxGeometry",
			"width": 1,
			"height": 1,
			"depth": 1,
			"widthSegments": 1,
			"heightSegments": 1,
			"depthSegments": 1
		};

		//change complex geometry to simple box geometry
		var geometries = scene.geometries;
		var type, tempGeo;
		for(i = 0, l = geometries.length; i < l; i++){
			var type = geometries[i].type;

			if(!this.isPrimaryGeometry(type)){
				tempGeo = JSON.parse(JSON.stringify(geometry));
				tempGeo.uuid = geometries[i].uuid;
				geometries[i] = tempGeo;
			}
		}

		scene = JSON.stringify(scene);

		//save scene
		var formData = new FormData();  

		// Add the file to the request.
		formData.append('uuid', uuid);
		formData.append('scene', scene);

		// Set up the request.
		var xhr = new XMLHttpRequest();

		// Open the connection.
		xhr.open('POST', 'saveScene', true);

		// Set up a handler for when the request finishes.
		xhr.onload = function () {
			if (xhr.status === 200) {

			} else {
			  alert('An error occurred!');
			}
		};

		// Send the Data.
		xhr.send(formData);		
	},
	loadAssets: function() {
		var scope = this;
		var asset  = this.asset;
		var url;
		this.scene.traverse(function eachChild(child) {

			if (editor.getObjectType(child) === 'Mesh'){

				var assets = child.userData.assets;
				for ( var type in assets ) {
					if (assets.hasOwnProperty(type)){
						switch(type){
							case 'geometry':
								asset.getGeoAsset(assets[type], function onEnd(geometry) {
									setGeometry(geometry);
								});	
							break;
							default:
								asset.getImgAsset(assets[type].assetId, function onEnd(img, name) {
									setTexture(type, img, name, assets[type]);
								});
							break;
						}
					}
				}					
				
				var setGeometry = function(data){
					var loader = new THREE.JSONLoader();
					var result = loader.parse( data );
					var geometry = result.geometry;


					//change the mesh with new geometry and old material
					geometry.uuid = child.geometry.uuid;
					var mesh = new THREE.Mesh( geometry, child.material );
					scope.addObject( mesh );

					mesh.name = child.name;
					mesh.applyMatrix(child.matrix);
					mesh.uuid = child.uuid;
					mesh.userData = child.userData;			
					
					scope.removeObject(child);			
				}

				var setTexture = function(type, img, name, uuid) {
					var texture = new THREE.Texture( img );
					var mapRow = scope.materialSiderbar.mapRow;
					texture.sourceFile = name;
					texture.needsUpdate = true;
					texture.uuid = uuid;

					scope.select(child);
					mapRow.texture.setValue(texture);
					mapRow.checkbox.setValue(true);
					scope.materialSiderbar.update();
				};
			}
		});
	},

	resetScene: function () {

		this.scene = new THREE.Scene();//wzh reset 
		this.signals.sceneReseted.dispatch();
		this.signals.sceneGraphChanged.dispatch();

	},

	setScene: function ( scene ) {
		
		this.resetScene();

		this.scene.uuid = scene.uuid;//wzh
		this.scene.name = scene.name;
		this.scene.userData = JSON.parse( JSON.stringify( scene.userData ) );

		// avoid render per object

		this.signals.sceneGraphChanged.active = false;

		while ( scene.children.length > 0 ) {

			this.addObject( scene.children[ 0 ] );

		}

		this.signals.sceneGraphChanged.active = true;
		this.signals.sceneGraphChanged.dispatch();
		this.signals.sceneLoaded.dispatch();

	},

	//

	addObject: function ( object ) {

		var scope = this;

		object.traverse( function ( child ) {

			if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
			if ( child.material !== undefined ) scope.addMaterial( child.material );

			scope.addHelper( child );

		} );

		this.scene.add( object );

		this.signals.objectAdded.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},

	setObjectName: function ( object, name ) {

		object.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	removeObject: function ( object ) {

		// if ( object.parent === undefined ) return; // avoid deleting the camera or scene

		// if ( confirm( 'Delete ' + object.name + '?' ) === false ) return;

		var scope = this;

		object.traverse( function ( child ) {

			scope.removeHelper( child );

		} );

		object.parent.remove( object );

		this.signals.objectRemoved.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},

	addGeometry: function ( geometry ) {

		this.geometries[ geometry.uuid ] = geometry;

	},

	setGeometryName: function ( geometry, name ) {

		geometry.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	addMaterial: function ( material ) {

		this.materials[ material.uuid ] = material;

	},

	setMaterialName: function ( material, name ) {

		material.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	addTexture: function ( texture ) {

		this.textures[ texture.uuid ] = texture;

	},

	//

	addHelper: function () {

		var geometry = new THREE.SphereGeometry( 20, 4, 2 );
		var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

		return function ( object ) {

			var helper;

			if ( object instanceof THREE.Camera ) {

				helper = new THREE.CameraHelper( object, 10 );

			} else if ( object instanceof THREE.PointLight ) {

				helper = new THREE.PointLightHelper( object, 10 );

			} else if ( object instanceof THREE.DirectionalLight ) {

				helper = new THREE.DirectionalLightHelper( object, 20 );

			} else if ( object instanceof THREE.SpotLight ) {

				helper = new THREE.SpotLightHelper( object, 10 );

			} else if ( object instanceof THREE.HemisphereLight ) {

				helper = new THREE.HemisphereLightHelper( object, 10 );

			} else {

				// no helper for this object type
				return;

			}

			var picker = new THREE.Mesh( geometry, material );
			picker.name = 'picker';
			picker.userData.object = object;
			picker.visible = false;
			helper.add( picker );

			this.sceneHelpers.add( helper );
			this.helpers[ object.id ] = helper;

			this.signals.helperAdded.dispatch( helper );

		};

	}(),

	removeHelper: function ( object ) {

		if ( this.helpers[ object.id ] !== undefined ) {

			var helper = this.helpers[ object.id ];
			helper.parent.remove( helper );

			delete this.helpers[ object.id ];

			this.signals.helperRemoved.dispatch( helper );

		}

	},

	//

	parent: function ( object, parent ) {

		if ( parent === undefined ) {

			parent = this.scene;

		}

		parent.add( object );

		this.signals.sceneGraphChanged.dispatch();

	},

	//

	select: function ( object ) {

		this.selected = object;

		// if ( object !== null ) {

		// 	this.config.setKey( 'selected', object.uuid );

		// } else {

		// 	this.config.setKey( 'selected', null );

		// }

		this.signals.objectSelected.dispatch( object );

	},
	getObjectByUuid: function (uuid) {
		var scope = this;
		var r;


		this.scene.traverse( function ( child ) {

			if ( child.uuid === uuid ) {

				r = child;
			}

		} );
		
		return r;	
	},
	selectByUuid: function (uuid) {
		var scope = this;
		var found = false;

		this.scene.traverse( function ( child ) {

			if ( child.uuid === uuid ) {

				scope.select( child );
				found = true;
			}

		} );

		if(!found){
			scope.select(null);
		}
	},

	selectById: function ( id ) {

		var scope = this;

		this.scene.traverse( function ( child ) {

			if ( child.id === id ) {

				scope.select( child );

			}

		} );

	},
	deselect: function () {

		this.select( null );

	},

	// utils

	getObjectType: function ( object ) {

		var types = {

			'Scene': THREE.Scene,
			'PerspectiveCamera': THREE.PerspectiveCamera,
			'AmbientLight': THREE.AmbientLight,
			'DirectionalLight': THREE.DirectionalLight,
			'HemisphereLight': THREE.HemisphereLight,
			'PointLight': THREE.PointLight,
			'SpotLight': THREE.SpotLight,
			'Mesh': THREE.Mesh,
			'Sprite': THREE.Sprite,
			'Object3D': THREE.Object3D

		};

		for ( var type in types ) {

			if ( object instanceof types[ type ] ) return type;

		}

	},
	isPrimaryGeometry: function(type) {//wzh
		var types = {

			'BoxGeometry': true,
			'CircleGeometry': true,
			'CylinderGeometry': true,
			'ExtrudeGeometry': false,
			'IcosahedronGeometry': true,
			'LatheGeometry': false,
			'OctahedronGeometry': false,
			'ParametricGeometry': false,
			'PlaneGeometry': true,
			'PolyhedronGeometry': false,
			'ShapeGeometry': false,
			'SphereGeometry': true,
			'TetrahedronGeometry': false,
			'TextGeometry': false,
			'TorusGeometry': true,
			'TorusKnotGeometry': true,
			'TubeGeometry': false,
			'Geometry': false,
			'Geometry2': false,
			'BufferGeometry': false
		};		

		return types[type];
	},

	getGeometryType: function ( geometry ) {

		var types = {

			'BoxGeometry': THREE.BoxGeometry,
			'CircleGeometry': THREE.CircleGeometry,
			'CylinderGeometry': THREE.CylinderGeometry,
			'ExtrudeGeometry': THREE.ExtrudeGeometry,
			'IcosahedronGeometry': THREE.IcosahedronGeometry,
			'LatheGeometry': THREE.LatheGeometry,
			'OctahedronGeometry': THREE.OctahedronGeometry,
			'ParametricGeometry': THREE.ParametricGeometry,
			'PlaneGeometry': THREE.PlaneGeometry,
			'PolyhedronGeometry': THREE.PolyhedronGeometry,
			'ShapeGeometry': THREE.ShapeGeometry,
			'SphereGeometry': THREE.SphereGeometry,
			'TetrahedronGeometry': THREE.TetrahedronGeometry,
			'TextGeometry': THREE.TextGeometry,
			'TorusGeometry': THREE.TorusGeometry,
			'TorusKnotGeometry': THREE.TorusKnotGeometry,
			'TubeGeometry': THREE.TubeGeometry,
			'Geometry': THREE.Geometry,
			'Geometry2': THREE.Geometry2,
			'BufferGeometry': THREE.BufferGeometry

		};

		for ( var type in types ) {

			if ( geometry instanceof types[ type ] ) return type;

		}

	},

	getMaterialType: function ( material ) {

		var types = {

			'LineBasicMaterial': THREE.LineBasicMaterial,
			'LineDashedMaterial': THREE.LineDashedMaterial,
			'MeshBasicMaterial': THREE.MeshBasicMaterial,
			'MeshDepthMaterial': THREE.MeshDepthMaterial,
			'MeshFaceMaterial': THREE.MeshFaceMaterial,
			'MeshLambertMaterial': THREE.MeshLambertMaterial,
			'MeshNormalMaterial': THREE.MeshNormalMaterial,
			'MeshPhongMaterial': THREE.MeshPhongMaterial,
			'ParticleSystemMaterial': THREE.ParticleSystemMaterial,
			'ShaderMaterial': THREE.ShaderMaterial,
			'SpriteCanvasMaterial': THREE.SpriteCanvasMaterial,
			'SpriteMaterial': THREE.SpriteMaterial,
			'Material': THREE.Material

		};

		for ( var type in types ) {

			if ( material instanceof types[ type ] ) return type;

		}

	}

}
