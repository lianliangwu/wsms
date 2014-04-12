var Asset = function(editor){
	var scene = editor.scene;
	var signals = editor.signals;

	//get wsms SG from current scene
	var getWSG = function() {
		var exporter = new THREE.ObjectExporter();
		var scene = exporter.parse(scene);
		var geometries = scene.geometries;
		var materials = scene.materials;
		var textures = [];
		var geoMap = {}, matMap = {};


		//build geometry map
		var temp;
		for(i = 0, l = geometries.length; i < l; i++){
			temp = geometries[i];
			geoMap[temp.uuid] = temp;
		}

		//build material map
		for(i = 0, l = materials.length; i < l; i++){
			temp = materials[i];
			matMap[temp.uuid] = temp;
		}

		var setGeometryNode = function(mesh, geoId) {
			var geometry = geoMap[mesh.geometry.uuid];
			geometry.data = {};
			geometry.geoId = geoId;
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

	this.commit = function(){
		var scene = getWSG();
		var uuid = scene.object.uuid;
		//save scene
		var formData = new FormData();  

		// Add the file to the request.
		formData.append('uuid', uuid);
		formData.append('version',-1);
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