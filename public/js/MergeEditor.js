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
	selectNode: function (uuid){},
	updateObject: function () {},
	updateGeometry: function () {},
	updateMaterial: function () {},
	addScene: function () {},
	removeScene: function () {},
	parentScene: function () {}
};
