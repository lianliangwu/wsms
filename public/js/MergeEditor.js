/*global signals, THREE, _ */
var MergeEditor = (function module(){
	"use strict";
	function MergeEditor (viewerA, viewerB, viewerD) {
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
	}

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
		setDiffColor: function ( mergeLog , versionA, versionB ) {
			var editorA = this.viewerA.editor;
			var editorB = this.viewerB.editor;
			var editorD = this.viewerD.editor;
			var getObjectType = editorD.getObjectType;
			var objectA, objectB, objectD;
			var scope = this;
			var type;


			function paintSubScene( editor, object, type ) {
				object.traverse(function ( child ) {
					if(editor.getObjectType(object) === 'Mesh'){
						editor.diffColor.setColor(object, type);
					}
				});
			}

			function paintColor( editor, object, type ) {
					if(getObjectType(object) === 'Mesh'){
						editor.diffColor.setColor(object, type);
					}else{
						//paint the subScene rooted at the conflicted node
						paintSubScene(editor, object, type);
					}
			}

			_.each(mergeLog.stateLog, function onEach( logItem ) {
				var uuid = logItem.uuid;

				if(logItem.isConflicted){
					var objectD = editorD.getObjectByUuid(uuid);
					objectD&&paintColor(editorD, objectD, 'stateConflict');
				}
				var objectA = editorA.getObjectByUuid(uuid);
				var objectB = editorB.getObjectByUuid(uuid);

				objectA&&paintColor(editorA, objectA, 'stateDiff');
				objectB&&paintColor(editorB, objectB, 'stateDiff');		
			});

			_.each(mergeLog.structureLog, function onEach( logItem ) {
				var uuid = logItem.uuid;

				if(logItem.isConflicted){
					var objectD = editorD.getObjectByUuid(uuid);
					objectD&&paintColor(editorD, objectD, 'structureConflict');
				}
				var objectA = editorA.getObjectByUuid(uuid);
				var objectB = editorB.getObjectByUuid(uuid);

				objectA&&paintColor(editorA, objectA, 'structureDiff');
				objectB&&paintColor(editorB, objectB, 'structureDiff');			
			});
		}
	};	

	return MergeEditor;
})();


