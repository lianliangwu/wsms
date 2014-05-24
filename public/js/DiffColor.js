var DiffColor = (function(){
	//Class variable
	var color = {
		'stateDiff': '#37f838', //green 37f838
		'structDiff': '#40a2f7', //blue 40a2f7
		'stateConflict': '#e01f1f', //red e01f1f
		'structConflict': '#f7bf25' //yellow f7bf25
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