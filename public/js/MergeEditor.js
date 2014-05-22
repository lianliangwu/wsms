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

		selected = this.viewerD.editor.selected;
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
	resetDiffColor: function ( boo ) {
		this.viewerA.editor.diffColor.resetColor( boo );
//		this.viewerA.editor.signals.materialChanged.dispatch();
		this.viewerB.editor.diffColor.resetColor( boo );
//		this.viewerB.editor.signals.materialChanged.dispatch();
		this.viewerD.editor.diffColor.resetColor( boo );
	},
	setDiffColor: function ( infoMap , versionNumA, versionNumB) {
		var editorA = this.viewerA.editor;
		var editorB = this.viewerB.editor;
		var editorD = this.viewerD.editor;
		var getObjectType = editorD.getObjectType;
		var versionA = 'Version' + versionNumA;
		var versionB = 'Version' + versionNumB;		
		var objectA, objectB, objectD;
		var type;


		function paintSubScene( editor, object, type) {
			object.traverse(function ( child) {
				if(editor.getObjectType(object) === 'Mesh'){
					editor.diffColor.setColor(object, type);
				}
			});
		}


		for(var uuid in infoMap){
			if(infoMap.hasOwnProperty(uuid)){
				var nodeInfo = infoMap[uuid];

				//version D
				if(nodeInfo.isConflicted){
					type = nodeInfo.attrLog.length === 0 ? 'structConflict' : 'nodeConflict';
					objectD = editorD.getObjectByUuid(uuid);
					
					if(getObjectType(objectD) === 'Mesh'){
						objectD.diffColor.setColor(objectD, type);
					}else{
						//paint the subScene rooted at the conflicted node
						if(type === 'nodeConflict'){
							paintSubScene(this.viewerD, objectD, type);
						}else{
							//paint every structure conflicted subScene 
							_.each(nodeInfo.subScene, function onEach( subScene ){
								var object = editorD.getObjectByUuid(subScene.uuid);
								if(object !== undefined){
									paintSubScene(editorD, object, type);
								}
							});
						}
					}					
				}

				if( nodeInfo.isMerged ){
					type = nodeInfo.attrLog.length === 0 ? 'structureDiff' : 'nodeDiff';
					objectA = editorA.getObjectByUuid( uuid );
					objectB = editorB.getObjectByUuid( uuid );

					//version A
					if(type === 'nodeDiff'){
						if(nodeInfo.nodeLog[versionA] !== 'unchanged'){
							if(getObjectType( objectA ) === 'Mesh'){
								editorA.diffColor.setColor( objectA, type );
							}else{
								//paint the subScene rooted at the changed node
								paintSubScene( editorA, objectA, type );
							}	
						}						
					}else{
						//paint every structure changed subScene 
						_.each(nodeInfo.subScene, function onEach( subScene ){
							if(subScene[versionA] !== 'unchanged'){
								var object = editorA.getObjectByUuid( subScene.uuid );
								if( object !== undefined ){
									paintSubScene( editorA, object, type );
								}								
							}
						});
					}

					//version B
					if(type === 'nodeDiff'){
						if(nodeInfo.nodeLog[versionB] !== 'unchanged'){
							if(getObjectType( objectB ) === 'Mesh'){
								editorB.diffColor.setColor( objectB, type );
							}else{
								//paint the subScene rooted at the changed node
								paintSubScene( editorB, objectB, type );
							}	
						}						
					}else{
						//paint every structure changed subScene 
						_.each(nodeInfo.subScene, function onEach( subScene ){
							if(subScene[versionB] !== 'unchanged'){
								var object = editorB.getObjectByUuid( subScene.uuid );
								if( object !== undefined ){
									paintSubScene( editorB, object, type );
								}								
							}
						});
					}
				}
			}
		}
	}
};
