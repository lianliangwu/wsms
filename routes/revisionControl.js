
var getNodeSet = function(scene) {
	var nodes = [];

	//translate scene tree into object nodes recursively
	var getObject = function(object) {
		var children = object.children;
		var i, l, tempId;

		for(i = 0, l = children.length; i < l; l++) {
			tempId = children[i].uuid;
			getObject(children[i]);
			children[i] = tempId;
		}

		nodes.push(object);
	};

	getObject(scene.object);

	scene.geometries.forEach(function each(e) {
		nodes.push(e);
	});
	scene.materials.forEach(function each(e) {
		nodes.push(e);
	});
	scene.textures.forEach(function each(e) {
		nodes.push(e)
	});

	return nodes;
};

exports.commit = function(req, res){
	
}
