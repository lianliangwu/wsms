var Asset = function(editor){
	var scene = editor.scene;
	var signals = editor.signals;

	var exportGeometry = function ( geometry ) {
		var exporterClass = null;
		var exporter; 
		var output;

		if ( geometry instanceof THREE.BufferGeometry ) {

			exporterClass = THREE.BufferGeometryExporter ;

		} else if ( geometry instanceof THREE.Geometry2 ) {

			exporterClass = THREE.Geometry2Exporter ;

		} else if ( geometry instanceof THREE.Geometry ) {

			exporterClass = THREE.GeometryExporter ;

		}else{
			console.log("not supported geometry type");
		}

		exporter = new exporterClass();

		output = JSON.stringify( exporter.parse( geometry ), null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );


		return output;
	};

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
	
	this.getImgAsset = function(uuid, callback) {
		// Set up the request.
		var xhr = new XMLHttpRequest();

		// Open the connection.
		xhr.open('GET', 'getImgAsset?uuid='+ uuid, true);

		// Set up a handler for when the request finishes.
		xhr.onload = function () {
			if (xhr.status === 200 && xhr.readyState === 4) {

				var data = JSON.parse(xhr.responseText).data;
				if (data) {
					loadImg(data.path);
				}
				
			} else {
			  alert('An error occurred!');
			}
		};

		function loadImg(url) {

	      var image = document.createElement( 'img' );
	      image.src = url;

	      image.addEventListener( 'load', function onEnd( event ) {
	      	callback&&callback(this);
	      });

		}

		// Send the Data.
		xhr.send();			
	};

	this.addGeoAsset = function(geometry){
		var geoAsset = exportGeometry(geometry);
		var formData = new FormData();

		formData.append('geometry', geoAsset);
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

	this.getGeoAsset = function(uuid, callback) {
		// Set up the request.
		var xhr = new XMLHttpRequest();

		// Open the connection.
		xhr.open('GET', 'getGeoAsset?uuid='+ uuid, true);

		// Set up a handler for when the request finishes.
		xhr.onload = function () {
			if (xhr.status === 200 && xhr.readyState === 4) {

				var data = JSON.parse(xhr.responseText).data;
				if (data) {
					loadGeo(data.path);
				}
				
			} else {
			  alert('An error occurred!');
			}
		};

		function loadGeo(url) {

	      var xhr = new XMLHttpRequest();
	      xhr.open('GET', url, true);

	      xhr.onload = function () {
	        if (xhr.status === 200 && xhr.readyState === 4) {

	        	callback&&callback(JSON.parse(xhr.responseText));
	          
	        } else {
	          alert('An error occurred!');
	        }
	      };

	      // Send the Data.
	      xhr.send(); 

		}

		// Send the Data.
		xhr.send();		
	};

	this.addGeoAssetOfObject = function(object) {

		var scope = this;

		if(editor.getObjectType(object) === 'Mesh'){

			this.addGeoAsset(object.geometry);
			signals.assetAdded.dispatch({
				type: 'geometry',
				target: object,
				uuid: object.geometry.uuid
			});
			
			return;
		}
		object.traverse( function ( child ) {

			if(editor.getObjectType(child) === 'Mesh'){
				
				scope.addGeoAsset(object.geometry);
				signals.assetAdded.dispatch({
					type: 'geometry',
					target: object,
					uuid: geometry.uuid
				});
				return;
			}

		} );
	};

}