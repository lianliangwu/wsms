/*global UI, Ajax*/
var TreeWin = function ( editor ) {
	
	"use strict";
	var container = new UI.Window("Tree Manager"),		
		modelSelect = new UI.FancySelect().setId( 'modelSelect' ).setMarginLeft( '250px' ).setMarginTop( '7px' ),
		modelControlRow = new UI.Panel(),
		newModelBtn = new UI.Button( 'New' ).setMarginLeft( '20px' ).onClick(addModel),
		loadModelBtn = new UI.Button( 'Load' ).setMarginLeft( '20px' ).onClick( loadModel ),
		versionBtn = new UI.Button( 'View Versions' ).setMarginLeft( '20px' ).onClick( viewVersions ),
		removeBtn = new UI.Button( 'Remove' ).setMarginLeft( '20px' ).onClick(removeModel),
		sceneMap = {};

	container.hide();
	container.setInnerHeight("600px");
	container.setInnerWidth("950px");

	modelControlRow.add( newModelBtn );
	modelControlRow.add( loadModelBtn );
	modelControlRow.add( removeBtn );
	modelControlRow.add( versionBtn );	
	modelControlRow.setMargin("10px");
	modelControlRow.setTextAlign('center');

	container.add( modelSelect );
	container.add( modelControlRow );


	container.customMethod = function ( ) {

		//ztree
		var ztreeDiv = document.createElement('ul');
		ztreeDiv.className = 'ztree';
		ztreeDiv.id = "treeDemo";
		container.dom.appendChild(ztreeDiv);
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
				onRename: onRename
			}
		};

		var zNodes =[
			{ id:1, pId:0, name:"父节点 1", open:true},
			{ id:11, pId:1, name:"叶子节点 1-1"},
			{ id:12, pId:1, name:"叶子节点 1-2"},
			{ id:13, pId:1, name:"叶子节点 1-3"},
			{ id:2, pId:0, name:"父节点 2", open:true},
			{ id:21, pId:2, name:"叶子节点 2-1"},
			{ id:22, pId:2, name:"叶子节点 2-2"},
			{ id:23, pId:2, name:"叶子节点 2-3"},
			{ id:3, pId:0, name:"父节点 3", open:true},
			{ id:31, pId:3, name:"叶子节点 3-1"},
			{ id:32, pId:3, name:"叶子节点 3-2"},
			{ id:33, pId:3, name:"叶子节点 3-3"}
		];

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
		}
		function showRemoveBtn(treeId, treeNode) {
			return !treeNode.isFirstNode;
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
				zTree.addNodes(treeNode, {id:(100 + newCount), pId:treeNode.id, name:"new node" + (newCount++)});
				return false;
			});
		};
		function removeHoverDom(treeId, treeNode) {
			$("#addBtn_"+treeNode.tId).unbind().remove();
		};
		
		//console.log(loadTreeNodeInfo());
		
		$.fn.zTree.init($(ztreeDiv), setting, zNodes);
		loadModelInfo();
	};

	function loadTreeNodeInfo() {
		// load tree information
		Ajax.getJSON({
			'url': 'getTreeNodes'
		}, function onEnd(err, result) {
			if(result.treeNodes){
				var options = {};
				result.treeNodes.forEach(function onEach(treeNode) {					
					// tmp
				});				
			}
		});
		return result.treeNodes;
	}

	function loadModelInfo() {
		var params = {
			start: 0,
			limit: 10
		};

		// load model information
		Ajax.getJSON({
			'url': 'getModels',
			'params': params
		}, function onEnd(err, result) {
			if(result.models){
				var options = {};
				result.models.forEach(function onEach(model) {
					sceneMap[model.uuid] = model;
					options[model.uuid] = model.name;
				});

				modelSelect.setOptions(options);				
			}
		});
	}

	function addModel() {
		var name = prompt('model name', '');
		// console.log(this);		
		if(name){
			editor.resetScene();
			editor.scene.name = name;
			var params = {
				'name': name,
				'uuid': editor.scene.uuid
			};

			Ajax.post({
				'url': 'addModel',
				'params': params
			}, function onEnd(err, result) {
				if(result.success === true){
					editor.scene.userData.currentVersion = result.versionNum;
					editor.scene.userData.branch = result.branch;
					console.log("model " + name + " added");
					loadModelInfo();
				}
			});
		}
	} 

	function loadModel() {
		var sceneId = modelSelect.getValue();

		editor.revCon.checkout({
			'name': 'master',
			'sceneId': sceneId
		}, function onEnd(err, scene) {
			if(!err){
				//checkout success
				editor.setScene(scene);
				console.log('checkout success.');
			}
		});		
	}

	function viewVersions() {
		var uuid = modelSelect.getValue();
		if(!uuid){
			alert("no model selected!");
		}else{
			editor.versionWin.show(modelSelect.getValue());	
		}
	}

	function removeModel() {
		var uuid = modelSelect.getValue(),
			params = {
			'sceneId': uuid
		};

		Ajax.post({
			'url': 'removeModel',
			'params': params
		}, function onEnd(err, result) {
			if(result.success === true){
				console.log("model " + name + " removed");
				loadModelInfo();
			}
		});
	}		
	
	return container;
};
