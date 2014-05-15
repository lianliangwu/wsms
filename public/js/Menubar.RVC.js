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
	option.onClick( checkout );
	options.add( option );

	// Commit

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Commit' );
	option.onClick( commit );
	options.add( option );

	// Merge

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Merge' );
	option.onClick( merge );
	options.add( option );	

	// Branch
	options.add( new UI.HorizontalRule() );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Add Branch' );
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
	option.setTextContent( 'Add Tag' );
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
	option.onClick( viewHistory );
	options.add( option );

	function checkout() {
		var name = prompt('checkout', '');

		if(!name) {
			return;
		}

		editor.revCon.checkout({
			'name': name
		}, function onEnd(err, scene) {
			if(!err){
				//checkout success
				editor.setScene(scene);
				console.log('checkout success.');
			}
		});
	}

	function commit() {
		editor.revCon.commit();
	}

	function merge() {}

	function addBranch() {
		var name = prompt('add branch', '');

		if(!name) {
			return;
		}

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
		var name = prompt('remove branch', '')

		if(!name) {
			return;
		}

		editor.revCon.removeBranch({
			'name': name
		}, function onEnd(err) {
			if(!err) {
				alert('Branch removed.');
			}
		})
	}

	function addTag() {
		var name = prompt('add tag', '');
		
		if(!name) {
			return;
		}

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
		var name = prompt('remove tag', '')
		
		if(!name) {
			return;
		}

		editor.revCon.removeTag({
			'name': name
		}, function onEnd(err) {
			if(!err) {
				alert('Tag removed.');
			}
		})
	}

	function viewHistory() {}

	return container;

}
