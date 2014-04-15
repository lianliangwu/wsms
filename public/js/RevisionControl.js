var RevisionControl = function(editor){
	var signals = editor.signals;
	var currentVersion = -1;
	var commitable = true;
	var maps = ['map', 'bumpMap', 'lightMap', 'normalMap', 'specularMap', 'envMap'];

	//get a loadable JSON scene data from WSG
	var getThreeSG = function(scene) {
		var geometries = scene.geometries;
		var materials = scene.materials;
		var textures = scene.textures;
		var geoIndex = {}, matIndex = {}, textureMap = {};
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
			var geometry = geometries[geoIndex[uuid]];

			if(typeof geometry.assetId !== 'undefined'){
				
				object.userData.assets.geometry = geometry.assetId;

				//set a temporary box geometry
				geometry = JSON.parse(JSON.stringify(tempGeometry));
				geometry.uuid = uuid;				
				geometries[geoIndex[uuid]] = geometry;
			}
		};

		var setMaterialNode = function(object) {
			var uuid = object.material;
			var material = materials[matIndex[uuid]];

			maps.forEach(function each(type){
				
				if (typeof material[type] !== 'undefined'){
					var texture = textureMap[material[type]];

					object.userData.assets[type] = texture;

					delete material[type];
				}
			});
		};

		var setAssets = function(object) {
			var children = object.children;
			var i, l, temp;

			//check if object is a mesh
			if (typeof object.geometry !== 'undefined'){
				object.userData = {};
				object.userData.assets = {};

				setGeometryNode(object);
				setMaterialNode(object);
			}

			
			if(typeof children !== 'undefined'){
				for(i = 0, l = children.length; i < l ; i++){
					temp = children[i];
					setAssets(temp);
				} 				
			}
		};

		//build geometry index map
		var i, l, temp;
		for(i = 0, l = geometries.length; i < l; i++){
			temp = geometries[i];
			geoIndex[temp.uuid] = i;
		}

		//build material index map
		for(i = 0, l = materials.length; i < l; i++){
			temp = materials[i];
			matIndex[temp.uuid] = i;
		}

		//build texture map
		for(i = 0, l = textures.length; i < l; i++){
			temp = textures[i];
			textureMap[temp.uuid] = temp;
		}

		//add assets into userData		
		setAssets(scene.object);
		delete scene.textures;		

		return scene;
	};
	//get wsms SG from current scene
	var getWSG = function() {
		var exporter = new THREE.ObjectExporter();
		var scene = exporter.parse(editor.scene);
		var geometries = scene.geometries;
		var materials = scene.materials;
		var textures = [];
		var geoMap = {}, matMap = {}, meshMap = {};


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

		//build mesh map
		var buildMeshMap = function(object) {
			var i, l, children;
			children = object.children;

			if(object.type === "Mesh"){
				meshMap[object.uuid] = object;
			}
			if(typeof children !== 'undefined'){
				for(i = 0, l = children.length; i < l; i++){
					buildMeshMap(children[i]);
				}
			}
		};
		buildMeshMap(scene.object);

		var setGeometryNode = function(mesh, assetId) {
			var geometry = geoMap[mesh.geometry];
			geometry.data = {};
			geometry.assetId = assetId;
		};

		var setMaterialNode = function(mesh, type, texture) {
			var material = matMap[mesh.material];
			material[type] = texture.uuid;
			textures.push(texture);
		};	

		//handle the assets info in userData
		editor.scene.traverse(function eachChild(child) {
		
			if (editor.getObjectType(child) === 'Mesh'){
				var mesh = meshMap[child.uuid];
				var assets = child.userData.assets;

				if(typeof assets !== 'undefined'){
					for ( var type in assets ) {
						if (assets.hasOwnProperty(type)){
							switch(type){
								case 'geometry':
									setGeometryNode(mesh, assets[type]);
								break;
								default:
									setMaterialNode(mesh, type, assets[type]);
								break;
							}
						}
					}
					delete mesh.userData;					
				}
			}
		});

		scene.textures = textures;
		return scene;
	};

	this.retrieve = function(sceneId, versionNum) {
		var scope = this;
		sceneId = "D295CF6E-F268-48BB-A72B-35B9E0808BC9";
		versionNum = prompt("choose the version to retrive:","");
		//versionNum = 4;
		//save scene
		var formData = new FormData();  

		// Set up the request.
		var xhr = new XMLHttpRequest();

		// Open the connection.
		xhr.open('GET', 'retrieve?sceneId='+sceneId+'&versionNum='+versionNum, true);

		// Set up a handler for when the request finishes.
		xhr.onload = function () {
			if (xhr.status === 200 && xhr.readyState === 4) {

				var scene = JSON.parse(xhr.responseText).scene;

				scene = getThreeSG(scene);
				var loader = new THREE.ObjectLoader();
				var result = loader.parse( scene );
				editor.setScene( result );

				editor.loadAssets();
				currentVersion = versionNum;
				
			} else {
			  alert('An error occurred!');
			}
		};

		// Send the Data.
		xhr.send(formData);
	};

	this.commit = function() {
		if(!commitable){
			console.log("unable to commit!");
		}
		commitable = false; //prevent user from committing
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
			if (xhr.status === 200 && xhr.readyState === 4) {

				var result = JSON.parse(xhr.responseText);
				currentVersion = result.versionNum;
				commitable = true; // allow for committing
			} else {
			  alert('An error occurred!');
			}
		};

		// Send the Data.
		xhr.send(formData);
	};
}