/*global UI*/
function HistoryWin(editor) {
	"use strict";
	UI.Window.call(this, "History");

	
	this.hide();
}

HistoryWin.prototype = Object.create(UI.Window.prototype);


