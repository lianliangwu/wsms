var AssetWin = function ( editor ) {

	var container = new UI.Window("Asset Manager").setWidth('800').setHeight('400');

	var layoutDiv = new UI.Panel();
	var leftDiv = new UI.Panel().setWidth('30%');
	var rightDiv = new UI.Panel().setWidth('70%').setPosition('absolute').setTop('0px').setRight('0px');

	layoutDiv.add(leftDiv);
	layoutDiv.add(rightDiv);

	var fancySelect = new UI.FancySelect().setHeight('320px');
	leftDiv.add(fancySelect);


	container.add(layoutDiv);
	container.hide();

	return container;

}
