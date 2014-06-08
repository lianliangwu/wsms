var DiffColor = (function(){
	//Class variable
	var color = {
		'stateDiff': '#66FF00', //green 66FF00
		'structureDiff': '#00FFFF', //Aqua 00FFFF
		'stateConflict': '#FF0000', //red FF0000
		'structureConflict': '#FFD800' //yellow FFD800
	};

	function DiffColor ( editor ){
		//instance variable
		this.oldColor = {};
		this.newColor = {};
		this.materials = [];
		this.outlines = [];
		this.signals = editor.signals;
		this.sceneHelpers = editor.sceneHelpers;
	};

	DiffColor.prototype.setColor = function( object, type ){
		var material = object.material;
		//catch color
		if(this.oldColor[material.uuid] === undefined){
			this.oldColor[material.uuid] = '#' + object.material.color.getHexString();
			this.materials.push(material);
		}
		//set color
		this.newColor[material.uuid] = color[type];
		object.material.color.setStyle( color[type] );
		this.signals.materialChanged.dispatch( material );
	};
	
	DiffColor.prototype.resetColor = function( boo ){
		var color;
		var scope = this;
		_.each(this.materials, function onEach( material ){
			color = boo ? scope.newColor[material.uuid] : scope.oldColor[material.uuid];
			material.color.setStyle( color );
		});
		this.signals.materialChanged.dispatch( );
	};

	DiffColor.prototype.setOutline = function (mesh, type) {
		var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: color[type], side: THREE.BackSide } );
		var outlineMesh1 = new THREE.Mesh( mesh.geometry.clone(), outlineMaterial1 );

		outlineMesh1.applyMatrix(mesh.matrixWorld);
		outlineMesh1.scale.multiplyScalar(1.2);

		this.outlines.push(outlineMesh1);
		this.sceneHelpers.add(outlineMesh1);
		this.signals.sceneGraphChanged.dispatch();
	};	

	DiffColor.prototype.resetOutlines = function (boo) {
		var scope = this;
		_.each(this.outlines, function onEach( outline ){
			outline.visible = boo;
		});
		this.signals.sceneGraphChanged.dispatch();
	};
	return DiffColor;
})();