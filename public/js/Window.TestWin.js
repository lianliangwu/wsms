/*global UI*/
var TestWin = (function () {
	"use strict";
	var container = new UI.Window("Test");

	var div = document.createElement( 'div' );
	div.id = "mocha";

	container.dom.appendChild(div);
	container.hide();
	
	document.body.appendChild(container.dom);
	container.clear = function(){
		
		div.innerHTML = "";
	};
	return container;
})();
