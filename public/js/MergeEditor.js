var MergeEditor = function (viewerA, viewerB, viewerD) {
	var SIGNALS = signals; 
	var selectedNode = null;
	var scope = this;

	this.signals = {

		// actions

		commitMerge: new SIGNALS.Signal(),
		cancelMerge: new SIGNALS.Signal(),

		// notifications

		nodeSelected: new SIGNALS.Signal(),

	};

	viewerA.signals.objectSelected.add(function onObjectSelected(object){
		if(object){
			scope.selectObject(object.uuid);			
		}
	});
	viewerB.signals.objectSelected.add(function onObjectSelected(object){
		if(object){
			scope.selectObject(object.uuid);			
		}
	});
	viewerD.signals.objectSelected.add(function onObjectSelected(object){
		if(object){
			scope.selectObject(object.uuid);			
		}
	});		

	this.viewerA = viewerA;
	this.viewerB = viewerB;
	this.viewerD = viewerD;
	this.selectedNode = selectedNode;
};

MergeEditor.prototype = {
	selectObject: function (uuid){
		this.selectedNode = uuid;

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

		this.signals.nodeSelected.dispatch(uuid);		
	},
	updateNode: function (key, value) {
		var updateObject = this.viewerD.editor.engine.updateObject;
		var object = this.viewerD.editor.selected;

		if(key === 'matrix'){
			var matrix = new THREE.Matrix4(
				value[0],value[4],value[8],value[12],
				value[1],value[5],value[9],value[13],
				value[2],value[6],value[10],value[14],
				value[3],value[7],value[11],value[15]);
			updateObject.setMatrix(object, matrix);
		}
		if(key === 'name'){
			updateObject.setName(object, value);
		}		
	},
	updateGeometry: function () {},
	updateMaterial: function () {},
	addScene: function () {},
	removeScene: function () {},
	parentScene: function () {},
	setDiffColor: function (infoMap) {
		var object;
		var type;
		for(uuid in infoMap){
			if(infoMap.hasOwnProperty(uuid)){
				nodeInfo = infoMap[uuid];
				if(nodeInfo.isConflicted || nodeInfo.isMerged){
					type = nodeInfo.isConflicted ? 'conflicted' : 'merged';
					object = this.viewerD.editor.getObjectByUuid(uuid);
					if(this.viewerD.editor.getObjectType(object) === 'Mesh'){
						this.viewerD.editor.diffColor.setColor(object, type);
					}					
				}
			}
		}
	}
};
