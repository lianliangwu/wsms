var DiffColor = (function(){
	//Class variable
	var color = {
		'nodeDiff': '#37f838', //green
		'structDiff': '#40a2f7', //blue
		'nodeConflict': '#e01f1f', //red
		'structConflict': '#f7bf25' //yellow
	};

	function DiffColor ( editor ){
		//instance variable
		this.oldColor = {};
		this.newColor = {};
		this.materials = [];
		this.signals = editor.signals;
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

	return DiffColor;
})();