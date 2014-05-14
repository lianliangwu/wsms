var Ajax = (function(){
	var getJSON = function(options, callback) {
		var url = options.url;
		var params = options.params;

		var formData = new FormData();  

		// Set up the request.
		var xhr = new XMLHttpRequest();

		var count = 0;
		for(var key in  params){
			if(params.hasOwnProperty(key)){
				url = url + (count === 0 ? '?' : '&');
				url += key + '=' + params[key];
				count++;
			}
		}

		// Open the connection.
		xhr.open('GET', url , true);

		// Set up a handler for when the request finishes.
		xhr.onload = function () {
			if (xhr.status === 200 && xhr.readyState === 4) {
				var result = JSON.parse(xhr.responseText);
				callback(null, result);
				
			} else {
				callback('getJSON error!');
			}
		};

		// Send the Data.
		xhr.send(formData);		
	};

	var post = function(options, callback) {
		var url = options.url;
		var params = options.params;

		var formData = new FormData();  

		// Add requests.
		for(var key in  params){
			if(params.hasOwnProperty(key)){
				formData.append(key, params[key]);
			}
		}		

		// Set up the request.
		var xhr = new XMLHttpRequest();

		// Open the connection.
		xhr.open('POST', url, true);

		// Set up a handler for when the request finishes.
		xhr.onload = function () {
			if (xhr.status === 200 && xhr.readyState === 4) {

				var result = JSON.parse(xhr.responseText);
				callback(null, result);

			} else {
			  	callback('post error!');
			}
		};

		// Send the Data.
		xhr.send(formData);
	};
	
	return {
		'getJSON': getJSON,
		'post': post
	};
})();