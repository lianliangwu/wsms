var RevisionControl = function(editor){
	var scene = editor.scene;
	var signals = editor.signals;
	var currentVersion = -1;
	var maps = ['map', 'bumpMap', 'lightMap', 'normalMap', 'specularMap', 'envMap'];

	//get a loadable JSON scene data from WSG
	var getThreeSG = function(scene) {
		var geometries = scene.geometries;
		var materials = scene.materials;
		var textures = scene.textures;
		var geoMap = {}, matMap = {}, textureMap;
		var tempGeometry = {
			"uuid": null,
			"type": "BoxGeometry",
			"width": 1,
			"height": 1,
			"depth": 1,
			"widthSegments": 1,
			"heightSegments": 1,
			"depthSegments": 1
		};

		var setGeometryNode = function(object) {
			var uuid = object.geometry;
			var geometry = geometries[geoMap[uuid]];

			if(typeof geometry.assetId !== 'undefined'){
				
				object.userData.assets.geometry = geometry.assetId;

				//set a temporary box geometry
				geometries[geoMap[assetId]] = JSON.parse(JSON.stringify(tempGeometry));
			}
		};

		var setMaterialNode = function(object) {
			var uuid = object.material;
			var material = materials[matMap[uuid]];

			maps.forEach(function each(type){
				
				if (typeof material[type] !== 'undefined'){
					var texture = textureMap[material[type]];

					object.userData.assets[type] = texture;
				}
			});
		};

		var setAssets = function(object) {
			var children = object.children;

			//check if object is a mesh
			if (typeof object.geometry !== 'undefined'){
				object.userData.assets = object.userData.assets || {};

				setGeometryNode(object);
				setMaterialNode(object);
			}

			var i, l, temp;

			for(i = 0, l = children.length; i < l ; i++){
				temp = children[i];
				setAssets(temp);
			} 
		};

		//build geometry map
		var i, l, temp;
		for(i = 0, l = geometries.length; i < l; i++){
			temp = geometries[i];
			geoMap[temp.uuid] = i;
		}

		//build material map
		for(i = 0, l = materials.length; i < l; i++){
			temp = materials[i];
			matMap[temp.uuid] = i;
		}

		//build texture map
		for(i = 0, l = textures.length; i < l; i++){
			temp = textures[i];
			textureMap[temp.uuid] = temp;
		}

		//add assets into userData		
		setAssets(scene.object);
		delete scene.textures;		
	};
	//get wsms SG from current scene
	var getWSG = function() {
		var exporter = new THREE.ObjectExporter();
		var scene = exporter.parse(scene);
		var geometries = scene.geometries;
		var materials = scene.materials;
		var textures = [];
		var geoMap = {}, matMap = {};


		//build geometry map
		var i, l, temp;
		for(i = 0, l = geometries.length; i < l; i++){
			temp = geometries[i];
			geoMap[temp.uuid] = temp;
		}

		//build material map
		for(i = 0, l = materials.length; i < l; i++){
			temp = materials[i];
			matMap[temp.uuid] = temp;
		}

		var setGeometryNode = function(mesh, assetId) {
			var geometry = geoMap[mesh.geometry.uuid];
			geometry.data = {};
			geometry.assetId = assetId;
		};

		var setMaterialNode = function(mesh, type, texture) {
			var material = matMap[mesh.material.uuid];
			material[type] = texture.uuid;
			textures.push(texture);
		};	

		//handle the assets info in userData
		scene.traverse(function eachChild(child) {
		
			if (editor.getObjectType(child) === 'Mesh'){
				var assets = child.userData.assets;
				for ( var type in assets ) {
					if (assets.hasOwnProperty(type)){
						switch(type){
							case 'geometry':
								setGeometryNode(child, assets[type]);
							break;
							default:
								setMaterialNode(child, type, assets[type]);
							break;
						}
					}
				}
				child.userData = {};
			}
		});

		scene.textures = textures;
		return scene;
	};

	this.retrieve = function() {
		var scope = this;

		//save scene
		var formData = new FormData();  

		// Add the file to the request.
		formData.append('sceneId', '9BE88E13-8F5C-406F-8B0D-22A91D7DA7A1');
		formData.append('preVersion', currentVersion);

		// Set up the request.
		var xhr = new XMLHttpRequest();

		// Open the connection.
		xhr.open('GET', 'retrieve', true);

		// Set up a handler for when the request finishes.
		xhr.onload = function () {
			if (xhr.status === 200 && xhr.readyState === 4) {

				var scene = JSON.parse(xhr.responseText).scene;

				scene = getThreeSG(scene);
				var loader = new THREE.ObjectLoader();
				var result = loader.parse( scene );
				scope.setScene( result );

				loadAssets();
				
			} else {
			  alert('An error occurred!');
			}
		};

		// Send the Data.
		xhr.send(formData);
	};

	this.commit = function() {
		var scene = getWSG();
		var uuid = scene.object.uuid;
		//save scene
		var formData = new FormData();  

		// Add the file to the request.
		formData.append('sceneId', uuid);
		formData.append('preVersion', currentVersion);
		formData.append('scene', JSON.stringify(scene));

		// Set up the request.
		var xhr = new XMLHttpRequest();

		// Open the connection.
		xhr.open('POST', 'commit', true);

		// Set up a handler for when the request finishes.
		xhr.onload = function () {
			if (xhr.status === 200) {

			} else {
			  alert('An error occurred!');
			}
		};

		// Send the Data.
		xhr.send(formData);
	};
}