MergeControlWin.ControlBtns = function (mergeEditor) {
	var container = new UI.Panel();
	var btnRow = new UI.Panel();
	var initiated = false;
	
	var cancelBtn = new UI.Button( 'Cancel' ).setMarginLeft( '7px' ).onClick( function () {
		mergeEditor.signals.cancelMerge.dispatch();
	} );
	var commitBtn = new UI.Button( 'Commit' ).setMarginLeft( '7px' ).onClick( function () {
		mergeEditor.signals.commitMerge.dispatch();
	} );

	var colorSet = new UI.Checkbox( false ).setMarginLeft('7px').setMarginTop('5px').onChange( function () {
		if(initiated === false){
			mergeEditor.signals.initDiffColor.dispatch();
			initiated = true;

			mergeEditor.resetOutlines(outlineSet.getValue());
		}else{
			mergeEditor.resetDiffColor(colorSet.getValue());
		}
	} );
	var outlineSet = new UI.Checkbox( false ).setMarginLeft('7px').setMarginTop('5px').onChange( function () {
		if(initiated === false){
			mergeEditor.signals.initDiffColor.dispatch();
			initiated = true;

			mergeEditor.resetDiffColor(colorSet.getValue());		
		}else{
			mergeEditor.resetOutlines(outlineSet.getValue());
		}
	} );


	// btnRow.add( new UI.Break() );
	btnRow.add( colorSet );
	btnRow.add( new UI.Text( 'color' ) );
	btnRow.add( outlineSet );
	btnRow.add( new UI.Text( 'outline' ) );	
	// btnRow.add( cancelBtn );
	btnRow.add( commitBtn );	

	container.add( new UI.Break() );
	container.add(btnRow);

	return container;
};
