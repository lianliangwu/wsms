var Engine = function(editor){
	var scene = editor.scene;
	var signals = editor.signals;
	var object = null;

	var getByUuid = function ( uuid ) {//wzh
		var scope = this;
		var object = null

		scene.traverse( function ( child ) {

			if ( child.uuid === uuid ) {

				object = child;
				return;
			}

		} );

		return object;
	};

	this.execute = function(op){
		switch(op.type){
		case 0://create node
			editor.addObject(op.node);

			break;
		case 1://update node
			object = getByUuid(op.nodeId);

			if ( object != null ){
				object[op.key] = op.after; 

				signals.objectChanged.dispatch( object );
			}

			break;
		case 2:
			break;
		default:

			break;
		}
	}

	this.undo = function(){

	}
}