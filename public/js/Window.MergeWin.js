var MergeWin = function (editor) {
	var sceneWinA = new ViewerWin();
	var sceneWinB = new ViewerWin();
	var sceneWinD = new ViewerWin();
	var mergeEditor = new MergeEditor(sceneWinA.viewer, sceneWinB.viewer, sceneWinD.viewer);
	var mergeControlWin = new MergeControlWin(mergeEditor);
	var versionA, versionB;

	document.body.appendChild( sceneWinA.dom );
	document.body.appendChild( sceneWinB.dom );
	document.body.appendChild( sceneWinD.dom );
	document.body.appendChild( mergeControlWin.dom );	
	
	mergeEditor.signals.commitMerge.add(function () {
		editor.revCon.commit([versionNumA, versionNumB], sceneWinD.viewer.editor.scene);
	});

	mergeEditor.signals.cancelMerge.add(function () {
		sceneWinA.hide();
		sceneWinB.hide();
		sceneWinD.hide();
		mergeControlWin.hide();
	});


	this.show = function(sceneId, verA, verB, verC) {
		if(sceneId && verA && verB && verC){
			var temp;
			if (Number(verC) > Number(verA)){
				temp = verA;
				verA = verC;
				verC = temp;
			}
			if (Number(verC) > Number(verB)){
				temp = verB;
				verB = verC;
				verC = temp;
			}	

			editor.revCon.merge(sceneId, verA, verB, verC, function(err, result) {
				versionA = verA;
				versionB = verB;

				init(result);
			});		
		}
	};

	//set up the layout
	function init(mergeResult){
		var height = document.body.scrollHeight;
		var width = document.body.scrollWidth;

		//version A
		sceneWinA.show();
		sceneWinA.setPosition({
			top: '0px',
			left: '0px'
		});
		sceneWinA.setWidth(width/4*1.5);
		sceneWinA.setHeight(height/2);
		sceneWinA.setScene(mergeResult['sceneA']);

		//version B
		sceneWinB.show();
		sceneWinB.setPosition({
			top: '0px',
			left: width/4*1.5 + '0px'
		});
		sceneWinB.setWidth(width/4*1.5);
		sceneWinB.setHeight(height/2);		
		sceneWinB.setScene(mergeResult['sceneB']);

		//merged version D
		sceneWinD.show();
		sceneWinD.setPosition({
			top: height/2 + 'px',
			left: '0px'
		});
		sceneWinD.setWidth(width/4*3);
		sceneWinD.setHeight(height/2);				
		sceneWinD.setScene(mergeResult['mergedScene']);

		//merge control window
		mergeControlWin.show();
		mergeControlWin.setPosition({
			top: '0px',
			left: width/4*3 + 'px'
		});
		mergeControlWin.setWidth(width/4);
		mergeControlWin.setHeight(height);
		mergeControlWin.init({
			'versionA': versionA,
			'versionB': versionB,
			'mergeLog': mergeResult.mergeLog
		});

		mergeEditor.setDiffColor(mergeResult.mergeLog, versionA, versionB);
	}
	
	return this;

};


