Sidebar.Geometry.BoxGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var geometry = object.geometry;

	// width

	var widthRow = new UI.Panel();
	var width = new UI.Number( geometry.width ).onChange( update );

	widthRow.add( new UI.Text( 'Width' ).setWidth( '90px' ) );
	widthRow.add( width );

	container.add( widthRow );

	// height

	var heightRow = new UI.Panel();
	var height = new UI.Number( geometry.height ).onChange( update );

	heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ) );
	heightRow.add( height );

	container.add( heightRow );

	// depth

	var depthRow = new UI.Panel();
	var depth = new UI.Number( geometry.depth ).onChange( update );

	depthRow.add( new UI.Text( 'Depth' ).setWidth( '90px' ) );
	depthRow.add( depth );

	container.add( depthRow );

	// widthSegments

	var widthSegmentsRow = new UI.Panel();
	var widthSegments = new UI.Integer( geometry.widthSegments ).setRange( 1, Infinity ).onChange( update );

	widthSegmentsRow.add( new UI.Text( 'Width segments' ).setWidth( '90px' ) );
	widthSegmentsRow.add( widthSegments );

	container.add( widthSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UI.Panel();
	var heightSegments = new UI.Integer( geometry.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	// depthSegments

	var depthSegmentsRow = new UI.Panel();
	var depthSegments = new UI.Integer( geometry.depthSegments ).setRange( 1, Infinity ).onChange( update );

	depthSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
	depthSegmentsRow.add( depthSegments );

	container.add( depthSegmentsRow );

	//
	//wzh
	var updateByEngine = (function(){
		var funcArrays = [];
		var precision = 2;

		function toFixedNumber(n){
			return parseFloat(n.toFixed(precision));
		}

		function checkWidth(geometry){
			var newWidth = width.getValue();
			var oldWidth = geometry.width;

			if(oldWidth === newWidth){
				return;
			}
			var operation = new Operation(Operation.UPDATE_STATE,{
				'target': geometry,
				'key': 'width'
			});
			operation.after = newWidth;

			return operation;
		}
		funcArrays.push(checkWidth);

		function checkHeight(geometry){
			var newHeight = height.getValue();
			var oldHeight = geometry.height;

			if(oldHeight === newHeight){
				return;
			}
			var operation = new Operation(Operation.UPDATE_STATE,{
				'target': geometry,
				'key': 'height'
			});
			operation.after = newHeight;
			
			return operation;
		}
		funcArrays.push(checkHeight);	

		function checkDepth(geometry){
			var newDepth = depth.getValue();
			var oldDepth = geometry.height;

			if(oldDepth === newDepth){
				return;
			}
			var operation = new Operation(Operation.UPDATE_STATE,{
				'target': geometry,
				'key': 'depth'
			});
			operation.after = newDepth;
			
			return operation;
		}
		funcArrays.push(checkDepth);				

		return function (geometry){
			var operation = null;
			var r = false;//log if object is updated

			_.each(funcArrays, function onEach(func) {
				operation = func(geometry); 
				if(operation){
					editor.engine.exec(operation);
					r = true; 
				}
			});

			return r;
		};
	})();

	function update() {

		var boo = updateByEngine(object.geometry);
		if(boo){//if updated by engine
			return;
		}		

		delete object.__webglInit; // TODO: Remove hack (WebGLRenderer refactoring)

		object.geometry.dispose();

		object.geometry = new THREE.BoxGeometry(
			width.getValue(),
			height.getValue(),
			depth.getValue(),
			widthSegments.getValue(),
			heightSegments.getValue(),
			depthSegments.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.objectChanged.dispatch( object );

	}

	return container;

}
