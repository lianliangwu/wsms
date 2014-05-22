var MergeControlWin = function(mergeEditor){
	"use strict";
	var container = new UI.Window("Merged Information").setId("mergeInforWin");

	var controlBtns = new MergeControlWin.ControlBtns(mergeEditor);
	var stateList = new MergeControlWin.StateList(mergeEditor);
	var attrList = new MergeControlWin.AttrList(mergeEditor);
	var structureList = new  MergeControlWin.StructureList(mergeEditor);

	container.add(controlBtns);
	container.add(stateList);
	container.add(attrList);
	container.add(structureList);

	//container configuration
	container.setOverflow('scroll');
	container.setWidth(300);
	container.setLeft(document.body.scrollWidth/3 + 'px');
	container.hide();

	container.init = function (options) {
		stateList.setInfo(options);
		attrList.setInfo(options);
		structureList.setInfo(options);
	};

	return container;
};