/*global _, UI*/
var AssetWin = function ( editor ) {
	"use strict";
	var container = new UI.Window("Asset Manager").setWidth('800px').setInnerHeight('400px');

	var layoutDiv = new UI.Panel();
	var leftDiv = new UI.Panel().setWidth('20%');
	var rightDiv = new UI.Panel().setWidth('80%').setPosition('absolute').setTop(container.getHeaderHeight()).setRight('0px');

	layoutDiv.add(leftDiv);
	layoutDiv.add(rightDiv);

	//left part
	var fancySelect = new UI.FancySelect().setHeight('400px').setBorderTop('0px').setBorderLeft('0px').setBorderBottom('0px');
	initDirectory(fancySelect);
	leftDiv.add(fancySelect);

	//right part
	var headerRow = new UI.Panel().setPadding('3px 10px').setBackgroundColor('#ddd');

	var importBtn = new UI.Button('Import');
	var applyBtn = new UI.Button('Apply');
	// var makeDirBtn = new UI.Button('makeDir');
	headerRow.add(importBtn);
	headerRow.add(applyBtn);
	// headerRow.add(makeDirBtn);

	var searchRow = new UI.Panel().setDisplay('inline-block').setFloat('right');
	var searchInput = new UI.Input();
	var searchBtn = new UI.Button('Search');
	searchRow.add(searchInput);
	searchRow.add(searchBtn);

	headerRow.add(searchRow);

	rightDiv.add(headerRow);

	container.add(layoutDiv);
	container.hide();

	container.signals.windowResized.add(function onResized(){
		fancySelect.setHeight(container.getInnerHeight());
	});

	function initDirectory(fancySelect) {
		var tree = {
			name: "Server",
			children: [
				{
					name: "Geometry"
				},
				{
					name: "Image"
				}
			]
		};
		var count = 1;
		var pad = '&nbsp;&nbsp;&nbsp;';
		var options = {};

		buildDir(tree, 1);
		options[count] = pad + "Local";
		fancySelect.setOptions(options);

		function buildDir(root, level) {
			var space = "";
			for(var i = level; i > 0; i--){
				space += pad;
			}
			options[count++] = space + root.name;

			_.each(root.children, function onEach(child){
				buildDir(child, level + 1);
			});
		}

	}
	// function initDirectory(fancySelect) {
	// 	editor.asset.getDirTree(function onEnd(err, result){
	// 		if(err){
	// 			console.log("err", err);
	// 			return;
	// 		}

	// 		var count = 1;
	// 		var pad = '&nbsp;&nbsp;&nbsp;';
	// 		var options = {};

	// 		if(result.success === true){
	// 			buildDir(result.tree, 1);
	// 			options[count] = pad + "Local";
	// 			fancySelect.setOptions(options);
	// 		}

	// 		function buildDir(root, level) {
	// 			var space = "";
	// 			for(var i = level; i > 0; i--){
	// 				space += pad;
	// 			}
	// 			options[count++] = space + root.name;

	// 			_.each(root.children, function onEach(child){
	// 				buildDir(child, level + 1);
	// 			});
	// 		}
	// 	});
	// }

	return container;

};
