Menubar.RVC = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );
	container.setWidth('45px');

	var title = new UI.Panel();
	title.setTextContent( 'RVC' );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// Checkout

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Checkout' );
	option.onClick( function () {} );
	options.add( option );

	// Commit

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Commit' );
	option.onClick( function () {} );
	options.add( option );

	// Merge

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Merge' );
	option.onClick( function () {} );
	options.add( option );	

	// Branch
	options.add( new UI.HorizontalRule() );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'New Branch' );
	option.onClick( addBranch );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Remove Branch' );
	option.onClick( removeBranch );
	options.add( option );	

	// Tag
	options.add( new UI.HorizontalRule() );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'New Tag' );
	option.onClick( addTag );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Remove Tag' );
	option.onClick( removeTag );
	options.add( option );	

	// Version History
	options.add( new UI.HorizontalRule() );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Version History' );
	option.onClick( function () {} );
	options.add( option );

	function addBranch() {
		var name = prompt('New branch name', '');
		editor.revCon.addBranch({
			'name': name,
			'desc': ''
		}, function onEnd(err) {
			if(!err) {
				alert('New branch added.');
			}
		});
	}

	function removeBranch() {
		var name = prompt('Branch to be removed', '')
		editor.revCon.removeBranch({
			'name': name
		}, function onEnd(err) {
			if(!err) {
				alert('Branch removed.');
			}
		})
	}

	function addTag() {
		var name = prompt('New tag name', '');
		editor.revCon.addTag({
			'name': name,
			'desc': ''
		}, function onEnd(err) {
			if(!err) {
				alert('New tag added.');
			}
		});
	}

	function removeTag() {
		var name = prompt('Tag to be removed', '')
		editor.revCon.removeTag({
			'name': name
		}, function onEnd(err) {
			if(!err) {
				alert('Tag removed.');
			}
		})
	}

	return container;

}
