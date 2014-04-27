var MergeControlWin = function(mergeEditor){
	var container = new UI.Window("Merged Information").setId("mergeInforWin");

	var controlBtns = new MergeControlWin.ControlBtns(mergeEditor);
	var nodeList = new MergeControlWin.NodeList(mergeEditor);
	var attrList = new MergeControlWin.AttrList(mergeEditor);
	var subSceneList = new  MergeControlWin.SubSceneList(mergeEditor);

	container.add(controlBtns);
	container.add(nodeList);
	container.add(attrList);
	container.add(subSceneList);

	//container configuration
	container.setOverflow('scroll');
	container.setWidth(300);
	container.setLeft(document.body.scrollWidth/3 + 'px');
	container.hide();

	container.init = function (versionA, versionB, infoMap) {

		nodeList.setInfo(versionA, versionB, infoMap);
		attrList.setInfo(versionA, versionB, infoMap);
		subSceneList.setInfo(versionA, versionB, infoMap);
	};

	return container;
};