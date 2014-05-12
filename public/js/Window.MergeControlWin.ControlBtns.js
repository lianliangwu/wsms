MergeControlWin.ControlBtns = function (mergeEditor) {
	var container = new UI.Panel();
	var btnRow = new UI.Panel();
	
	var cancelBtn = new UI.Button( 'Cancel' ).setMarginLeft( '7px' ).onClick( function () {
		mergeEditor.signals.cancelMerge.dispatch();
	} );
	var commitBtn = new UI.Button( 'Commit' ).setMarginLeft( '7px' ).onClick( function () {
		mergeEditor.signals.commitMerge.dispatch();
	} );

	var snap = new UI.Checkbox( true ).setMarginLeft('7px').setMarginTop('5px').onChange( function () {
		mergeEditor.resetDiffColor(snap.getValue());
	} );


	btnRow.add( cancelBtn );
	btnRow.add( commitBtn );
	btnRow.add( new UI.Break() );
	btnRow.add( snap );
	btnRow.add( new UI.Text( 'color' ) );	

	container.add( new UI.Break() );
	container.add(btnRow);

	return container;
};
