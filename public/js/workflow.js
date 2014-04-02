var test_workflow = function(){
	var meshCount = 0;
	var box1, box2;
	var signals = editor.signals;
	var op1, op2, op3, op4, op5, op6, op7, op8;
	var position;


	var createBox = function(){
		var width = 100;
		var height = 100;
		var depth = 100;

		var widthSegments = 1;
		var heightSegments = 1;
		var depthSegments = 1;

		var texture = THREE.ImageUtils.loadTexture( 'img/crate.gif' );
		var geometry = new THREE.BoxGeometry( width, height, depth, widthSegments, heightSegments, depthSegments );

		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({map:texture}) );
		mesh.name = 'Box ' + ( ++ meshCount );
		mesh.material.emissive.set("#FF9900");

		return mesh;
	}

	
	function animate() {
		requestAnimationFrame( animate );

		TWEEN.update();
	}

	box1 = createBox();

	op1 = {
		type : 0,
		node : box1
	};

	position = box1.position.clone();
	position.x = 200;
	position.y = 50;

	op2 = {
		type : 1,
		nodeId : box1.uuid,
		key : "position",
		before : box1.position,
		after : position
	};

	box2 = createBox();
	
	op3 = {
		type : 0,
		node : box2
	};

	position = box2.position.clone();
	position.x = 300;
	position.y = 50;

	op4 = {
		type : 1,
		nodeId : box2.uuid,
		key : "position",
		before : box2.position,
		after : position
	};

	position = op2.after.clone();
	position.x = 0;
	op5 = {
		type : 1,
		nodeId : box1.uuid,
		key : "position",
		before : op2.after,
		after : position
	}

	position = op4.after.clone();
	position.x = 110;
	op6 = {
		type : 1,
		nodeId : box2.uuid,
		key : "position",
		before : op4.after,
		after : position
	};	

	position = op6.after.clone();
	position.y = 150;
	op7 = {
		type : 1,
		nodeId : box2.uuid,
		key : "position",
		before : op6.after,
		after : position
	};

	position = op7.after.clone();
	position.x = 0;
	op8 = {
		type : 1,
		nodeId : box2.uuid,
		key : "position",
		before : op7.after,
		after : position
	};

	editor.engine.execute(op1);
	editor.engine.execute(op2);
	editor.engine.execute(op3);
	editor.engine.execute(op4);

	animate();
	signals.playAnimations.dispatch({});

	var tween_box1 = new TWEEN.Tween(box1.position)
    .to( op5.after, 2000);
	var tween_box20 = new TWEEN.Tween(box2.position).delay(1000)
    .to( op6.after, 2000);
    var tween_box21 = new TWEEN.Tween(box2.position)
    .to(op7.after, 1000);
    var tween_box22 = new TWEEN.Tween(box2.position)
    .to(op8.after, 1000);

    tween_box20.chain(tween_box21.chain(tween_box22));

    tween_box1.chain(tween_box20);
    tween_box1.start();
};