//ztree
var setting = {
	view: {
		addHoverDom: addHoverDom,
		removeHoverDom: removeHoverDom,
		selectedMulti: false
	},
	edit: {
		enable: true,
		editNameSelectAll: true,
		showRemoveBtn: showRemoveBtn,
		showRenameBtn: showRenameBtn
	},
	data: {
		simpleData: {
			enable: true
		}
	},
	callback: {
		beforeDrag: beforeDrag,
		beforeEditName: beforeEditName,
		beforeRemove: beforeRemove,
		beforeRename: beforeRename,
		onRemove: onRemove,
		onRename: onRename,
		onDblClick: zTreeOnDblClick
	}
};

var zNodes =[];

var log, className = "dark";
function beforeDrag(treeId, treeNodes) {
	return false;
}
function beforeEditName(treeId, treeNode) {
	className = (className === "dark" ? "":"dark");
	showLog("[ "+getTime()+" beforeEditName ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
	var zTree = $.fn.zTree.getZTreeObj("treeDemo");
	zTree.selectNode(treeNode);
	return confirm("进入节点 -- " + treeNode.name + " 的编辑状态吗？");
}
function beforeRemove(treeId, treeNode) {
	className = (className === "dark" ? "":"dark");
	showLog("[ "+getTime()+" beforeRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
	var zTree = $.fn.zTree.getZTreeObj("treeDemo");
	zTree.selectNode(treeNode);
	return confirm("确认删除 节点 -- " + treeNode.name + " 吗？");
}
function onRemove(e, treeId, treeNode) {
	showLog("[ "+getTime()+" onRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
	// rename tree node
	var params = {
		'id': treeNode.id
	};
	Ajax.post({
		'url': 'removeMovieTreeNode',
		'params': params
	}, function onEnd(err, result) {
		if(result.success === true){
			//
		} else {
			alert("Remove tree node Error!");
		}
	});
}
function beforeRename(treeId, treeNode, newName, isCancel) {
	className = (className === "dark" ? "":"dark");
	showLog((isCancel ? "<span style='color:red'>":"") + "[ "+getTime()+" beforeRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name + (isCancel ? "</span>":""));
	if (newName.length == 0) {
		alert("节点名称不能为空.");
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		setTimeout(function(){zTree.editName(treeNode)}, 10);
		return false;
	}
	return true;
}
function onRename(e, treeId, treeNode, isCancel) {
	showLog((isCancel ? "<span style='color:red'>":"") + "[ "+getTime()+" onRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name + (isCancel ? "</span>":""));
	// console.log(treeNode.name);
	// rename tree node
	var params = {
		'id': treeNode.id,
		'name': treeNode.name
	};
	Ajax.post({
		'url': 'editMovieTreeNode',
		'params': params
	}, function onEnd(err, result) {
		if(result.success === true){
			//
		} else {
			alert("Rename tree node Error!");
		}
	});
	
}
function zTreeOnDblClick(event, treeId, treeNode) {
	// add a method to show the right selcet model list on double click event
	// alert(treeNode ? treeNode.tId + ", " + treeNode.name : "isRoot");
	loadModelInfo2(treeNode.id);
};

function showRemoveBtn(treeId, treeNode) {
	//return !treeNode.isFirstNode;
	return true;
}
function showRenameBtn(treeId, treeNode) {
	// if is last node, cann't rename
	// return !treeNode.isLastNode;
	return true;
}
function showLog(str) {
	if (!log) log = $("#log");
	log.append("<li class='"+className+"'>"+str+"</li>");
	if(log.children("li").length > 8) {
		log.get(0).removeChild(log.children("li")[0]);
	}
}
function getTime() {
	var now= new Date(),
	h=now.getHours(),
	m=now.getMinutes(),
	s=now.getSeconds(),
	ms=now.getMilliseconds();
	return (h+":"+m+":"+s+ " " +ms);
}

var newCount = 1;
function addHoverDom(treeId, treeNode) {
	var sObj = $("#" + treeNode.tId + "_span");
	if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
	var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
		+ "' title='add node' onfocus='this.blur();'></span>";
	sObj.after(addStr);
	var btn = $("#addBtn_"+treeNode.tId);
	if (btn) btn.bind("click", function(){
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		var name = prompt('node name', '');
		zTree.addNodes(treeNode, {id:(100 + newCount), pId:treeNode.id, name:name });
		// add node method	
		if(name){
			var params = {
				'name': name,
				'pId': treeNode.id,
				'id': THREE.Math.generateUUID()
			};
			Ajax.post({
				'url': 'addMovieTreeNode',
				'params': params
			}, function onEnd(err, result) {
				if(result.success === true){
					// 
				} else {
					alert("add node error!");
				}
			});
		}

		return false;
	});
};

function removeHoverDom(treeId, treeNode) {
	$("#addBtn_"+treeNode.tId).unbind().remove();
};

