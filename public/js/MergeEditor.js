var MergeEditor = function (viewerA, viewerB, viewerD) {
	var SIGNALS = signals; 
	
	this.signals = {

		// actions

		commitMerge: new SIGNALS.Signal(),
		cancelMerge: new SIGNALS.Signal(),

		// notifications

		nodeSelected: new SIGNALS.Signal(),

	};

	this.viewerA = viewerA;
	this.viewerB = viewerB;
	this.viewerD = viewerD;
};

MergeEditor.prototype = {
	selectObject: function (uuid){
		var selected = this.viewerA.editor.selected;		
		if(!selected || (selected&&selected.uuid !== uuid)){
			this.viewerA.editor.selectByUuid(uuid);	
		}

		selected = this.viewerB.editor.selected;
		if(!selected || (selected&&selected.uuid !== uuid)){
			this.viewerB.editor.selectByUuid(uuid);	
		}

		selected = this.viewerD.editor.selected
		if(!selected || (selected&&selected.uuid !== uuid)){
			this.viewerD.editor.selectByUuid(uuid);	
		}			
	},
	updateObject: function () {},
	updateGeometry: function () {},
	updateMaterial: function () {},
	addScene: function () {},
	removeScene: function () {},
	parentScene: function () {}
};
