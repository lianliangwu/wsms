//Window
//wzhscirpt 2014.4.11
(function(){
	function get (el) {
	  if (typeof el == 'string') return document.getElementById(el);
	  return el;
	}	

	function getNumber (value) {
		var r = parseInt(value);
		return isNaN(r) ? 0 : r;
	}

	function mouseX (e) {
	  if (e.pageX) {
	    return e.pageX;
	  }
	  if (e.clientX) {
	    return e.clientX + (document.documentElement.scrollLeft ?
	      document.documentElement.scrollLeft :
	      document.body.scrollLeft);
	  }
	  return null;
	}

	function mouseY (e) {
	  if (e.pageY) {
	    return e.pageY;
	  }
	  if (e.clientY) {
	    return e.clientY + (document.documentElement.scrollTop ?
	      document.documentElement.scrollTop :
	      document.body.scrollTop);
	  }
	  return null;
	}

	function dragable (p,t) {
	  var drag = false;
	  offsetX = 0;
	  offsetY = 0;
	  var mousemoveTemp = null;

	  if (t) {
	    var move = function (x,y) {
	      t.style.left = (parseInt(t.style.left)+x) + "px";
	      t.style.top  = (parseInt(t.style.top) +y) + "px";
	    }
	    var mouseMoveHandler = function (e) {
	      e = e || window.event;

	      if(!drag){return true};

	      var x = mouseX(e);
	      var y = mouseY(e);
	      if (x != offsetX || y != offsetY) {
	        move(x-offsetX,y-offsetY);
	        offsetX = x;
	        offsetY = y;
	      }
	      return false;
	    }
	    var start_drag = function (e) {
	      e = e || window.event;

	      offsetX=mouseX(e);
	      offsetY=mouseY(e);
	      drag=true; // basically we're using this to detect dragging

	      // save any previous mousemove event handler:
	      if (document.body.onmousemove) {
	        mousemoveTemp = document.body.onmousemove;
	      }
	      document.body.onmousemove = mouseMoveHandler;
	      return false;
	    }
	    var stop_drag = function () {
	      drag=false;      

	      // restore previous mousemove event handler if necessary:
	      if (mousemoveTemp) {
	        document.body.onmousemove = mousemoveTemp;
	        mousemoveTemp = null;
	      }
	      return false;
	    }
	    p.onmousedown = start_drag;
	    p.onmouseup = stop_drag;
	  }
	}

	function resizable (p,t) {
	  var drag = false;
	  offsetX = 0;
	  offsetY = 0;
	  var mousemoveTemp = null;
	  var width, height;

	  if (t) {
	    var resize = function (x,y) {
	      width += x;
	      height += y;	
	      t.setWidth(width);
	      t.setHeight(height);
	    }
	    var mouseMoveHandler = function (e) {
	      e = e || window.event;

	      if(!drag){return true};

	      var x = mouseX(e);
	      var y = mouseY(e);
	      if (x != offsetX || y != offsetY) {
	        resize(x-offsetX,y-offsetY);
	        offsetX = x;
	        offsetY = y;
	      }
	      return false;
	    }
	    var start_drag = function (e) {
	      e = e || window.event;

	      offsetX=mouseX(e);
	      offsetY=mouseY(e);
	      width = t.getWidth();
	      height = t.getHeight();
	      drag=true; // basically we're using this to detect dragging

	      // save any previous mousemove event handler:
	      if (document.body.onmousemove) {
	        mousemoveTemp = document.body.onmousemove;
	      }
	      document.body.onmousemove = mouseMoveHandler;
	      return false;
	    }
	    var stop_drag = function () {
	      drag=false;      

	      // restore previous mousemove event handler if necessary:
	      if (mousemoveTemp) {
	        document.body.onmousemove = mousemoveTemp;
	        mousemoveTemp = null;
	      }
	      return false;
	    }
	    p.onmousedown = start_drag;
	    p.onmouseup = stop_drag;
	  }
	}	

	UI.Window = (function(){

		var Window = function( name ) {

			UI.Element.call( this );

			var SIGNALS = signals; 
			
			this.signals = {

				// notifications
				windowOpened: new SIGNALS.Signal(),
				windowCloase: new SIGNALS.Signal(),
				windowResized: new SIGNALS.Signal()

			};

			var scope = this;

			var dom = document.createElement( 'div' );
			dom.className = 'Window';
			dom.style.paddingTop = "30px";
			dom.style.paddingBottom = "25px";
			dom.style.border = "1px solid gray";
			dom.style.backgroundColor = "#fff";
			dom.style.position = "absolute";
			dom.style.left = '10px';
			dom.style.top = '32px';
			dom.style.width = "500px";
			dom.style.height = "500px";
			dom.style.zIndex = String(this.getIndex());
			dom.addEventListener('click', function onClick(event){
				dom.style.zIndex = String(scope.getIndex());
			}, false);

			var head = document.createElement('div');
			head.style.backgroundColor = "#eee";
			head.style.position = "absolute";
			head.style.top = '0px';
			head.style.width = '100%';
			head.style.height = '30px';
			head.className = 'head';

			var title = document.createElement('span');
			title.style.color = "#888";
			title.style.padding = "8px";
			title.style.display = "inline-block";
			title.innerText = name;

			head.appendChild(title);
			dragable(head, dom);

			var footer = document.createElement('div');
			footer.style.backgroundColor = "#eee";
			footer.style.position = "absolute";
			footer.style.bottom = '0px';
			footer.style.width = '100%';
			footer.style.height = '25px';	
			footer.className = 'footer'

			var closeBtn = document.createElement('img');
			closeBtn.src = "img/close.png";
			closeBtn.style.position = "absolute";
			closeBtn.style.right = "5px";
			closeBtn.style.top = "5px";
			closeBtn.style.cursor = "pointer";
			closeBtn.style.width = "20px";
			closeBtn.addEventListener( 'click', function ( event ) {

				scope.hide();

			}, false );

			var maxBtn = document.createElement('img');
			maxBtn.src = "img/max.png";
			maxBtn.style.position = "absolute";
			maxBtn.style.right = "30px";
			maxBtn.style.top = "5px";
			maxBtn.style.cursor = "pointer";
			maxBtn.style.width = "20px";
			maxBtn.addEventListener( 'click', function ( event ) {

				scope.max();

			}, false );

			var minBtn = document.createElement('img');
			minBtn.src = "img/min.png";
			minBtn.style.position = "absolute";
			minBtn.style.right = "55px";
			minBtn.style.top = "5px";
			minBtn.style.cursor = "pointer";
			minBtn.style.width = "20px";
			minBtn.addEventListener( 'click', function ( event ) {

				scope.hide();

			}, false );

			var resizeBtn = document.createElement('img');
			resizeBtn.src = "img/resize.png";
			resizeBtn.style.position = "absolute";
			resizeBtn.style.right = "2px";
			resizeBtn.style.bottom = "2px";
			resizeBtn.style.cursor = "se-resize";
			resizeBtn.style.width = "20px";
			resizable(resizeBtn, this);


			dom.appendChild(head);
			dom.appendChild(footer);
			dom.appendChild(closeBtn);
			dom.appendChild(maxBtn);
			dom.appendChild(minBtn);
			dom.appendChild(resizeBtn);
			this.dom = dom;
			this.head = head;
			this.footer = footer;

			return this;
		};

		Window.prototype = Object.create( UI.Element.prototype );

		Window.prototype.add = function () {

			for ( var i = 0; i < arguments.length; i ++ ) {

				this.dom.appendChild( arguments[ i ].dom );

			}

			return this;

		};

		Window.prototype.remove = function () {

			for ( var i = 0; i < arguments.length; i ++ ) {

				this.dom.removeChild( arguments[ i ].dom );

			}

			return this;

		};

		Window.prototype.clear = function () {

			while ( this.dom.children.length ) {

				this.dom.removeChild( this.dom.lastChild );

			}

		};

		Window.prototype.show = function() {
			this.dom.style.display = "";
			this.signals.windowOpened.dispatch();
			return this;
		};

		Window.prototype.hide = function() {
			this.dom.style.display = "none";
			this.signals.windowCloase.dispatch();
			return this;
		};

		Window.prototype.max = function() {

			if(this.isMaxed){
				this.dom.style.width = this.preStatus.width;
				this.dom.style.height = this.preStatus.height;
				this.dom.style.left = this.preStatus.left;
				this.dom.style.top = this.preStatus.top;	
			}else{
				this.preStatus = {
					'width': this.dom.offsetWidth + 'px',
					'height': this.dom.offsetHeight - this.head.offsetHeight - this.footer.offsetHeight + 'px',
					'left': this.dom.style.left,
					'top': this.dom.style.top
				};

				this.dom.style.width = document.body.scrollWidth + 'px';
				this.dom.style.height = document.body.scrollHeight - this.head.offsetHeight - this.footer.offsetHeight + 'px';
				this.dom.style.left = "0px";
				this.dom.style.top = "0px";
			}
			this.isMaxed = this.isMaxed ? false : true;

			this.signals.windowResized.dispatch();
			return this;
		};		

		Window.prototype.min = function() {
			this.dom.style.display = "none";

			return this;
		};		

		Window.prototype.toggle = function() {
			var display = this.dom.style.display;

			if(display === "none"){
				this.show();
			}else{
				this.hide();
			}

			return this;
		};

		Window.prototype.getWidth = function(){
			return this.dom.offsetWidth;
		};

		Window.prototype.getHeight = function(){
			return this.dom.offsetHeight;
		};

		Window.prototype.setWidth = function(width){
			var borderL = getNumber(this.dom.style.borderLeftWidth);
			var borderR = getNumber(this.dom.style.borderRightWidth);
			var paddingL = getNumber(this.dom.style.paddingLeft);
			var paddingR = getNumber(this.dom.style.paddingRight);

			this.dom.style.width = width - borderL - borderR - paddingL - paddingR + 'px';
			this.signals.windowResized.dispatch();

			return this;
		};
		Window.prototype.setHeight = function(height){
			var borderT = getNumber(this.dom.style.borderTopWidth);
			var borderB = getNumber(this.dom.style.borderBottomWidth);
			var paddingT = getNumber(this.dom.style.paddingTop);
			var paddingB = getNumber(this.dom.style.paddingBottom);

			this.dom.style.height = height - borderT - borderB - paddingT - paddingB + 'px';
			this.signals.windowResized.dispatch();

			return this;
		};
		Window.prototype.getInnerWidth = function(){
			var borderL = getNumber(this.dom.style.borderLeftWidth);
			var borderR = getNumber(this.dom.style.borderRightWidth);
			var paddingL = getNumber(this.dom.style.paddingLeft);
			var paddingR = getNumber(this.dom.style.paddingRight);

			return this.getWidth() - borderL - borderR - paddingL - paddingR;			
		};
		Window.prototype.getInnerHeight = function(){
			var borderT = getNumber(this.dom.style.borderTopWidth);
			var borderB = getNumber(this.dom.style.borderBottomWidth);
			var paddingT = getNumber(this.dom.style.paddingTop);
			var paddingB = getNumber(this.dom.style.paddingBottom);

			return this.getHeight() - borderT - borderB - paddingT - paddingB;
		};
		Window.prototype.setPosition = function(position){
			if(position.top !== undefined){
				this.dom.style.top = position.top;
			}
			if(position.left !== undefined){
				this.dom.style.left = position.left;
			}
			if(position.bottom !== undefined){
				this.dom.style.bottom = position.bottom;
			}
			if(position.right !== undefined){
				this.dom.style.right = position.right;
			}

			return this;
		};
		Window.prototype.getIndex = function(){
			var index = 0;//static variable 
			return function(){
				index++;
				return index;
			};
		}();

		return Window;
	})();	

	UI.DAG = function( url ) {

		UI.Element.call( this );

		var scope = this;

		var dom = document.createElement( 'div' );
		dom.className = 'DAG';

		dom.innerHTML = '<svg><g transform="translate(20,20)"/></svg>';

		this.dom = dom;

		return this;
	};

	UI.DAG.prototype = Object.create( UI.Element.prototype );
	UI.DAG.prototype.clear = function () {
		this.dom.innerHTML = '<svg><g transform="translate(20,20)"/></svg>';
	};

	UI.DAG.prototype.draw = function ( states, edges ) {
	    var renderer = new dagreD3.Renderer();
	    var oldDrawNodes = renderer.drawNodes();


	    this.clear();
	    states = states.map(function(s) {
	                  return { id: s, value: { label: s } };       
	             });


	    renderer.drawNodes(function(graph, root) {
	      var svgNodes = oldDrawNodes(graph, root);
	      svgNodes.attr("id", function(u) {
	        return "node-" + u; 
	      });
	      return svgNodes;
	    });

	    //
	    var layout = dagreD3.layout()
	                        .rankDir("LR");    
	    var result = renderer.layout(layout).run(dagreD3.json.decode(states, edges), d3.select("svg g"));

	    d3.select("svg")
	      .attr("width", result.graph().width + 40)
	      .attr("height", result.graph().height + 40);


	    //  
        this.nodes = this.dom.getElementsByClassName('node');

        _.each(this.nodes, function onEach(node){
          node.valueStr = node.getElementsByTagName('tspan')[0].innerHTML;  
          node.selected = false;
          node.rect = node.getElementsByTagName('rect')[0];
          node.style.cursor = "pointer";

          node.addEventListener('click',function(e) {
            e.preventDefault();
			this.selected = this.selected === true? false: true;
			if(this.selected){
				this.rect.style.fill = "#7f7";
			}else{
				this.rect.style.fill = "#fff";
			}            
          },false)               
        });        
		return this;
	};	
	UI.DAG.prototype.getSelected = function(){
		var selected = [];
		_.each(this.nodes, function onEach(node){
			if(node.selected === true){
				selected.push(node.valueStr);
			}
		});
		return selected;
	};

	UI.Viewer = function() {
		UI.Element.call( this );

		var dom = document.createElement( 'div' );
		dom.className = 'Viewer';

		var editor = new Editor();
		var sidebar = new Sidebar( editor );
		var signals = editor.signals;

		var scene = editor.scene;
		var sceneHelpers = editor.sceneHelpers;

		var objects = [];

		// helpers

		var grid = new THREE.GridHelper( 500, 25 );
		sceneHelpers.add( grid );

		//

		var camera = new THREE.PerspectiveCamera( 50, 1, 1, 5000 );
		camera.position.fromArray( [500, 250, 500]);
		camera.lookAt( new THREE.Vector3().fromArray( [0, 0, 0] ) );	

		//

		var selectionBox = new THREE.BoxHelper();
		selectionBox.material.depthTest = false;
		selectionBox.material.transparent = true;
		selectionBox.visible = false;
		sceneHelpers.add( selectionBox );

		// var transformControls = new THREE.TransformControls( camera, dom );
		// transformControls.addEventListener( 'change', function () {

		// 	controls.enabled = true;

		// 	if ( transformControls.axis !== null ) {

		// 		controls.enabled = false;

		// 	}

		// 	if ( editor.selected !== null ) {

		// 		signals.objectChanged.dispatch( editor.selected );

		// 	}

		// } );
		// sceneHelpers.add( transformControls );

		// fog

		var oldFogType = "None";
		var oldFogColor = 0xaaaaaa;
		var oldFogNear = 1;
		var oldFogFar = 5000;
		var oldFogDensity = 0.00025;

		// object picking

		var ray = new THREE.Raycaster();
		var projector = new THREE.Projector();

		// events

		var getIntersects = function ( event, object ) {

			var rect = dom.getBoundingClientRect();
			x = ( event.clientX - rect.left ) / rect.width;
			y = ( event.clientY - rect.top ) / rect.height;
			var vector = new THREE.Vector3( ( x ) * 2 - 1, - ( y ) * 2 + 1, 0.5 );

			projector.unprojectVector( vector, camera );

			ray.set( camera.position, vector.sub( camera.position ).normalize() );

			if ( object instanceof Array ) {

				return ray.intersectObjects( object );

			}

			return ray.intersectObject( object );

		};

		var onMouseDownPosition = new THREE.Vector2();
		var onMouseUpPosition = new THREE.Vector2();

		var onMouseDown = function ( event ) {

			event.preventDefault();

			var rect = dom.getBoundingClientRect();
			x = (event.clientX - rect.left) / rect.width;
			y = (event.clientY - rect.top) / rect.height;
			onMouseDownPosition.set( x, y );

			document.addEventListener( 'mouseup', onMouseUp, false );

		};

		var onMouseUp = function ( event ) {

			var rect = dom.getBoundingClientRect();
			x = (event.clientX - rect.left) / rect.width;
			y = (event.clientY - rect.top) / rect.height;
			onMouseUpPosition.set( x, y );

			if ( onMouseDownPosition.distanceTo( onMouseUpPosition ) == 0 ) {

				var intersects = getIntersects( event, objects );

				if ( intersects.length > 0 ) {

					var object = intersects[ 0 ].object;

					if ( object.userData.object !== undefined ) {

						// helper

						editor.select( object.userData.object );

					} else {

						editor.select( object );

					}

				} else {

					editor.select( null );

				}

				render();

			}

			document.removeEventListener( 'mouseup', onMouseUp );

		};

		var onDoubleClick = function ( event ) {

			var intersects = getIntersects( event, objects );

			if ( intersects.length > 0 && intersects[ 0 ].object === editor.selected ) {

				controls.focus( editor.selected );

			}

		};

		dom.addEventListener( 'mousedown', onMouseDown, false );
		dom.addEventListener( 'dblclick', onDoubleClick, false );

		// controls need to be added *after* main logic,
		// otherwise controls.enabled doesn't work.

		var controls = new THREE.EditorControls( camera, dom );
		controls.center.fromArray( [0, 0, 0] )
		controls.addEventListener( 'change', function () {

//			transformControls.update();
			signals.cameraChanged.dispatch( camera );

		} );

		// signals

		signals.themeChanged.add( function ( value ) {

			switch ( value ) {

				case 'css/light.css':
					grid.setColors( 0x444444, 0x888888 );
					clearColor = 0xaaaaaa;
					break;
				case 'css/dark.css':
					grid.setColors( 0xbbbbbb, 0x888888 );
					clearColor = 0x333333;
					break;

			}
			
			renderer.setClearColor( clearColor );

			render();

		} );

		signals.transformModeChanged.add( function ( mode ) {

//			transformControls.setMode( mode );

		} );

		signals.snapChanged.add( function ( dist ) {

//			transformControls.setSnap( dist );

		} );

		signals.spaceChanged.add( function ( space ) {

//			transformControls.setSpace( space );

		} );

		signals.rendererChanged.add( function ( type ) {

			dom.removeChild( renderer.domElement );

			renderer = new THREE[ type ]( { antialias: true } );
			renderer.autoClear = false;
			renderer.autoUpdateScene = false;
			renderer.setClearColor( clearColor );
			renderer.setSize( dom.offsetWidth, dom.offsetHeight);

			dom.appendChild( renderer.domElement );

			render();

		} );

		signals.sceneReseted.add( function () {

			scene = editor.scene;
			
		} );

		signals.sceneLoaded.add( function () {
			loadAssets();
		});

		signals.sceneGraphChanged.add( function () {

			render();

		} );



		var saveTimeout;

		signals.cameraChanged.add( function () {

			if ( saveTimeout !== undefined ) {

				clearTimeout( saveTimeout );

			}

			render();

		} );

		signals.objectSelected.add( function ( object ) {

			selectionBox.visible = false;
//			transformControls.detach();

			if ( object !== null ) {

				if ( object.geometry !== undefined &&
					 object instanceof THREE.Sprite === false ) {

					selectionBox.update( object );
					selectionBox.visible = true;

				}

				if ( object instanceof THREE.PerspectiveCamera === false ) {

//					transformControls.attach( object );

				}

			}

			render();

		} );

		signals.objectAdded.add( function ( object ) {

			var materialsNeedUpdate = false;

			object.traverse( function ( child ) {

				if ( child instanceof THREE.Light ) materialsNeedUpdate = true;

				objects.push( child );

			} );

			if ( materialsNeedUpdate === true ) updateMaterials();

		} );

		signals.objectChanged.add( function ( object ) {

//			transformControls.update();

			if ( object !== camera ) {

				if ( object.geometry !== undefined ) {

					selectionBox.update( object );

				}

				if ( editor.helpers[ object.id ] !== undefined ) {

					editor.helpers[ object.id ].update();

				}

			}

			render();

		} );

		signals.objectRemoved.add( function ( object ) {

			var materialsNeedUpdate = false;

			object.traverse( function ( child ) {

				if ( child instanceof THREE.Light ) materialsNeedUpdate = true;

				objects.splice( objects.indexOf( child ), 1 );

			} );

			if ( materialsNeedUpdate === true ) updateMaterials();

		} );

		//wzh, add assets(geometry, map...) information to mesh
		signals.assetAdded.add(function(option) {
			var target = option.target;
			var uuid = option.uuid;
			var type = option.type;
			var texture, assets;

			target.userData.assets = target.userData.assets||{};
			assets = target.userData.assets;

			switch(type){
			case 'geometry':
				assets[type] = uuid;
				break;
			default:
				if (typeof assets[type] === 'undefined'){
					assets[type] = {
						uuid: THREE.Math.generateUUID(),
						assetId:null
					};
				}
				assets[type].assetId = uuid;
				break;
			}
		});

		signals.helperAdded.add( function ( object ) {

			objects.push( object.getObjectByName( 'picker' ) );

		} );

		signals.helperRemoved.add( function ( object ) {

			objects.splice( objects.indexOf( object.getObjectByName( 'picker' ) ), 1 );

		} );

		signals.materialChanged.add( function ( material ) {

			render();

		} );

		signals.fogTypeChanged.add( function ( fogType ) {

			if ( fogType !== oldFogType ) {

				if ( fogType === "None" ) {

					scene.fog = null;

				} else if ( fogType === "Fog" ) {

					scene.fog = new THREE.Fog( oldFogColor, oldFogNear, oldFogFar );

				} else if ( fogType === "FogExp2" ) {

					scene.fog = new THREE.FogExp2( oldFogColor, oldFogDensity );

				}

				updateMaterials();

				oldFogType = fogType;

			}

			render();

		} );

		signals.fogColorChanged.add( function ( fogColor ) {

			oldFogColor = fogColor;

			updateFog( scene );

			render();

		} );

		signals.fogParametersChanged.add( function ( near, far, density ) {

			oldFogNear = near;
			oldFogFar = far;
			oldFogDensity = density;

			updateFog( scene );

			render();

		} );

		signals.windowResize.add( function () {

			camera.aspect = dom.offsetWidth / dom.offsetHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( dom.offsetWidth, dom.offsetHeight );

			render();

		} );

		signals.playAnimations.add( function (animations) {
			
			function animate() {

				requestAnimationFrame( animate );
				
				for ( var i = 0; i < animations.length ; i ++ ) {

					animations[i].update(0.016);

				} 

				render();
			}

			animate();

		} );

		//

		var clearColor, renderer;



		if ( System.support.webgl === true ) {

			renderer = new THREE.WebGLRenderer( { antialias: true } );

		} else {

			renderer = new THREE.CanvasRenderer();

		}

		renderer.autoClear = false;
		renderer.autoUpdateScene = false;	
		renderer.setClearColor( '#aaaaaa' );		
		dom.appendChild( renderer.domElement );

		animate();

		//
		function loadAssets() {
			var asset  = editor.asset;
			var url;
			editor.scene.traverse(function eachChild(child) {

				if (editor.getObjectType(child) === 'Mesh'){

					var assets = child.userData.assets;
					for ( var type in assets ) {
						if (assets.hasOwnProperty(type)){
							switch(type){
								case 'geometry':
									asset.getGeoAsset(assets[type], function onEnd(geometry) {
										setGeometry(geometry);
									});	
								break;
								default:
									asset.getImgAsset(assets[type].assetId, function onEnd(img, name) {
										setTexture(type, img, name, assets[type]);
									});
								break;
							}
						}
					}					
					
					var setGeometry = function(data){
						var loader = new THREE.JSONLoader();
						var result = loader.parse( data );
						var geometry = result.geometry;


						//change the mesh with new geometry and old material
						geometry.uuid = child.geometry.uuid;
						var mesh = new THREE.Mesh( geometry, child.material );
						editor.addObject( mesh );

						mesh.name = child.name;
						mesh.applyMatrix(child.matrix);
						mesh.uuid = child.uuid;
						mesh.userData = child.userData;			
						
						editor.removeObject(child);			
					}

					var setTexture = function(type, img, name, uuid) {
						var texture = new THREE.Texture( img );
						var mapRow = editor.materialSiderbar.mapRow;
						texture.sourceFile = name;
						texture.needsUpdate = true;
						texture.uuid = uuid;

						editor.select(child);
						mapRow.texture.setValue(texture);
						mapRow.checkbox.setValue(true);
						editor.materialSiderbar.update();
					};
				}
			});
		}		

		function updateMaterials() {

			editor.scene.traverse( function ( node ) {

				if ( node.material ) {

					node.material.needsUpdate = true;

					if ( node.material instanceof THREE.MeshFaceMaterial ) {

						for ( var i = 0; i < node.material.materials.length; i ++ ) {

							node.material.materials[ i ].needsUpdate = true;

						}

					}

				}

			} );

		}

		function updateFog( root ) {

			if ( root.fog ) {

				root.fog.color.setHex( oldFogColor );

				if ( root.fog.near !== undefined ) root.fog.near = oldFogNear;
				if ( root.fog.far !== undefined ) root.fog.far = oldFogFar;
				if ( root.fog.density !== undefined ) root.fog.density = oldFogDensity;

			}

		}

		function animate() {

			requestAnimationFrame( animate );

		}

		function render() {

			sceneHelpers.updateMatrixWorld();
			scene.updateMatrixWorld();

			renderer.clear();
			renderer.render( scene, camera );
			renderer.render( sceneHelpers, camera );

		}

		this.dom = dom;
		this.editor = editor;
		this.signals = editor.signals;

		this.render = function(width, height) {
			render();
		};
		this.resize = function(width, height) {
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize( width, height );	
			render();
		};

		return this;
	};
	UI.Viewer.prototype = Object.create( UI.Element.prototype );


})();



