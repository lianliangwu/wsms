MergeControlWin.ControlBtns = function (mergeEditor) {
	var container = new UI.Panel();
	var btnRow = new UI.Panel();
	
	var cancelBtn = new UI.Button( 'Cancel' ).setMarginLeft( '7px' ).onClick( function () {
		mergeEditor.signals.cancelMerge.dispatch();
	} );
	var commitBtn = new UI.Button( 'Commit' ).setMarginLeft( '7px' ).onClick( function () {
		mergeEditor.signals.commitMerge.dispatch();
	} );

	btnRow.add(cancelBtn);
	btnRow.add(commitBtn);

	container.add( new UI.Break() );
	container.add(btnRow);

	return container;
};
