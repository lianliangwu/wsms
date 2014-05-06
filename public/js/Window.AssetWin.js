var AssetWin = function ( editor ) {

	var container = new UI.Window("Asset Manager").setWidth('800px').setInnerHeight('400px');

	var layoutDiv = new UI.Panel();
	var leftDiv = new UI.Panel().setWidth('20%');
	var rightDiv = new UI.Panel().setWidth('80%').setPosition('absolute').setTop(container.getHeaderHeight()).setRight('0px');

	layoutDiv.add(leftDiv);
	layoutDiv.add(rightDiv);

	//left part
	var fancySelect = new UI.FancySelect().setHeight('400px').setBorderTop('0px').setBorderLeft('0px').setBorderBottom('0px');
	var options = {};
	makeOptions(options);
	fancySelect.setOptions(options);
	leftDiv.add(fancySelect);

	//right part
	var headerRow = new UI.Panel().setPadding('3px 10px').setBackgroundColor('#ddd');

	var importBtn = new UI.Button('Import');
	var applyBtn = new UI.Button('Apply');
	headerRow.add(importBtn);
	headerRow.add(applyBtn);

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

	function makeOptions(options) {
		var count = 1;
		var pad = '&nbsp;&nbsp;&nbsp;';

		options[count++] = pad + 'Server';
		options[count++] = pad + pad + 'Geometry';
		options[count++] = pad + pad + 'Image';

		options[count++] = pad + 'Loaded';
		options[count++] = pad + pad + 'Geometry';
		options[count++] = pad + pad + 'Image';
	}

	return container;

}
