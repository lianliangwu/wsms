var Asset = function(editor){
	var scene = editor.scene;
	var signals = editor.signals;

	this.addImgAsset = function(file,uuid){

		var formData = new FormData();  

		// Add the file to the request.
		formData.append('myImg', file, file.name);
		formData.append('uuid', uuid);

		// Set up the request.
		var xhr = new XMLHttpRequest();

		// Open the connection.
		xhr.open('POST', 'addImgAsset', true);

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
	
	this.getImgAsset = function(){};

	this.addGeoAsset = function(geometry){
		var formData = new FormData();

		formData.append('geometry', JSON.stringify(geometry));
		formData.append('uuid', geometry.uuid);

		var xhr = new XMLHttpRequest();

		// Open the connection.
		xhr.open('POST', 'addGeoAsset', true);

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

	this.getGeoAsset = function(){};

	this.addGeoAssetOfObject = function(object){

		if(editor.getObjectType(object) === 'Mesh'){

			this.addGeoAsset(object.geometry);
			
			return;
		}
		object.traverse( function ( child ) {

			if(editor.getObjectType(child) === 'Mesh'){
				
				this.addGeoAsset(child.geometry);
				
				return;
			}

		} );
	};

}