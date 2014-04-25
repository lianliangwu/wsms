var MergeControlWin.ControlPanel = function (editor) {
	var container = new UI.Panel();

	var controlBtnRow = new UI.Panel();
	var cancelBtn = new UI.Button( 'Cancel' ).setMarginLeft( '7px' ).onClick( function () {
		
	} );
	var commitBtn = new UI.Button( 'Commit' ).setMarginLeft( '7px' ).onClick( function () {
		if(container.onCommit){
			container.onCommit();
		}
	} );

	controlBtnRow.add(cancelBtn);
	controlBtnRow.add(commitBtn);

	container.add( new UI.Break() );
	// container.add( new UI.Text( 'Control Panel' ).setClass('title') );
	// container.add( new UI.Break(), new UI.Break() );
	container.add(controlBtnRow);	
};
