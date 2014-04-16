//Window
//wzhscirpt 2014.4.11
(function(){
	function get (el) {
	  if (typeof el == 'string') return document.getElementById(el);
	  return el;
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

	function dragable (clickEl,dragEl) {
	  var p = get(clickEl);
	  var t = get(dragEl);
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

	UI.Window = (function(){

		var Window = function( name ) {

			UI.Element.call( this );

			var scope = this;

			var dom = document.createElement( 'div' );
			dom.className = 'Window';
			dom.style.paddingTop = "30px";
			dom.style.paddingBottom = "25px";
			dom.style.border = "1px solid gray";
			dom.style.backgroundColor = "#fff";
			dom.style.left = '10px';
			dom.style.top = '32px';

			var head = document.createElement('div');
			head.style.backgroundColor = "#eee";
			head.style.position = "absolute";
			head.style.top = '0px';
			head.style.width = '100%';
			head.style.height = '30px';

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

			var closeBtn = document.createElement('img');
			closeBtn.src = "img/close.png";
			closeBtn.style.position = "absolute";
			closeBtn.style.right = "-19px";
			closeBtn.style.top = "-19px";
			closeBtn.style.cursor = "pointer";
			closeBtn.addEventListener( 'click', function ( event ) {

				scope.hide();

			}, false );

			dom.appendChild(head);
			dom.appendChild(footer);
			dom.appendChild(closeBtn);
			this.dom = dom;

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

			return this;
		};

		Window.prototype.hide = function() {
			this.dom.style.display = "none";

			return this;
		};

		Window.prototype.toggle = function() {
			var display = this.dom.style.display;

			this.dom.style.display = display === "none" ? "" : "none";

			return this;
		};

		return Window;
	})();	
})();



