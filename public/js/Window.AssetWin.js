/*global _, UI, GeoViewerWin*/
var AssetWin = function ( editor ) {
	"use strict";
	var dirMap = {};

	var container = new UI.Window("Asset Manager").setWidth('800px').setInnerHeight('400px');
	var layoutDiv = new UI.Panel();
	var leftDiv = new UI.Panel().setWidth('20%');
	var rightDiv = new UI.Panel().setWidth('80%').setPosition('absolute').setTop(container.getHeaderHeight()).setRight('0px');


	//left part
	var fancySelect = new UI.FancySelect().setHeight('400px').setBorderTop('0px').setBorderLeft('0px').setBorderBottom('0px');
	initDirectory(fancySelect);
	leftDiv.add(fancySelect);

	//right part
	var headerRow = new UI.Panel().setPadding('3px 10px').setBackgroundColor('#ddd');
	var assetsPanel = new UI.Panel();

	var importBtn = new UI.Button('Import');
	var applyBtn = new UI.Button('Apply');

	var searchRow = new UI.Panel().setDisplay('inline-block').setFloat('right');
	var searchInput = new UI.Input();
	var searchBtn = new UI.Button('Search');
	searchRow.add(searchInput);
	searchRow.add(searchBtn);

	headerRow.add(importBtn);
	headerRow.add(applyBtn);	
	headerRow.add(searchRow);

	rightDiv.add(headerRow);
	rightDiv.add(assetsPanel);
	layoutDiv.add(leftDiv);
	layoutDiv.add(rightDiv);
	container.add(layoutDiv);
	container.hide();

	container.signals.windowResized.add(function onResized(){
		fancySelect.setHeight(container.getInnerHeight());
	});

	container.getAssetIds = function (callback){
		if(container.isCalling === true){
			console.log('assetWin is already under calling');
			alert('assetWin is already under calling');
			return;
		}
		container.isCalling = true;
		container.callback = callback;
		container.show();
	};

	searchBtn.onClick(function onEvent(){
		var nameStr = searchInput.getValue();

		editor.asset.searchAssets({
			'nameStr': nameStr,
			'type': ""
		},function onEnd(err, result){
			if(err){
				console.log(err);
				return;
			}

			if(result.success === true){
				listContent(result.assets);
			}else{
				alert("list fail");
			}			
		});
	});

	applyBtn.onClick(function onEvent(){
		if(container.isCalling){
			var selectedIds = getSelected();
			if(selectedIds.length <= 0){
				alert('no assets selected!');
				return;
			}
			container.hide();
			container.isCalling = false;
			container.callback&&container.callback(null, selectedIds);
		}
	});

	fancySelect.onChange(function onEvent(){
		var dir = dirMap[fancySelect.getValue()];

		if(dir.name === 'Geometry'){
			editor.asset.listGeoAsset({
				'start': 0,
				'limit': 12
			}, function onEnd(err, result){
				if(err){
					console.log(err);
					return;
				}

				if(result.success === true){
					listContent(result.assets);
				}else{
					alert("list fail");
				}
			});
		}
		if(dir.name === 'Image'){
			editor.asset.listImgAsset({
				'start': 0,
				'limit': 10
			}, function onEnd(err, result){
				if(err){
					console.log(err);
					return;
				}

				if(result.success === true){
					listContent(result.assets);
				}else{
					alert("list fail");
				}
			});
		}
	});

	rightDiv.onDblclick(function onEvent(event){
		event.preventDefault();
		if(event.target.className === 'Image'){
			var assetId = event.target.id;
			var geoWin = new GeoViewerWin();
			document.body.appendChild( geoWin.dom );

			geoWin.setAsset(assetId);			
		}
	});

	rightDiv.onClick(function onEvent(event){
		event.preventDefault();
		var target = event.target;
		if(target.className === 'Image'){
			select(target);
		}
	});

	function select(dom){
		var color = dom.style.borderColor;
		color =dom.selected ? "#ccc" : "#FFD800";
		dom.style.borderColor = color;
		dom.selected = color === "#ccc" ? false : true;		
	}

	function getSelected(){
		var imgs = rightDiv.dom.getElementsByTagName('img');
		var selectedId = [];

		_.each(imgs, function onEach(img){
			if(img.selected === true){
				selectedId.push(img.id);
			}
		});

		return selectedId;
	}

	function listContent(assets){
		assetsPanel.clear();

		_.each(assets, function onEach(asset){
			var imgBox;
			var url;

			if(asset.type === 'geo'){
				url = asset.snapshot;
			}
			if(asset.type === 'img'){
				url = asset.path;
			}
			
			imgBox = newImgBox(asset.uuid, url, asset.name);
			assetsPanel.add(imgBox);
		});
	}

	function newImgBox(assetId, url, name){
		var box = new UI.Panel()
						.setWidth("100px")
						.setHeight("100px")
						.setMarginLeft("10px")
						.setMarginTop("10px")
						.setFloat("left");
		var img = new UI.Image(url)
						.setBorder("3px solid #ccc")
						.setId(assetId);
		var nameT = new UI.Text(name);
		var height = Number(img.getHeight);
		var width = Number(img.getWidth);
		if(height > width){
			img.setHeight("90px");
		}else{
			img.setWidth("90px");
		}

		box.add(img);
		box.add(nameT);
		box.setTextAlign("center");
		box.setCursor("pointer");
		return box;	
	}

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
		var ltree = {
			name: "Local",
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
		buildDir(ltree, 1);
		fancySelect.setOptions(options);

		function buildDir(root, level) {
			var space = "";
			for(var i = level; i > 0; i--){
				space += pad;
			}
			options[count] = space + root.name;
			dirMap[count] = root;
			count++;

			_.each(root.children, function onEach(child){
				buildDir(child, level + 1);
			});
		}

	}

	return container;

};
