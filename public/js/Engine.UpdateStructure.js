/*global editor*/
var UpdateStructure = (function () {
	"use strict";

	function remove(object){
		editor.removeObject(object);
	}
	function parent(object, toParent){
		editor.parent( object, toParent );
	}
	return {
		remove: remove,
		parent: parent
	};	
})();