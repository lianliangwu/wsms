/*global UI, Ajax*/
var ModelWin = function ( editor ) {
	"use strict";
	var container = new UI.Window("Model Manager"),
		modelSelect = new UI.FancySelect().setId( 'modelSelect' ),
		modelControlRow = new UI.Panel(),
		newModelBtn = new UI.Button( 'New' ).setMarginLeft( '7px' ).onClick(addModel),
		loadModelBtn = new UI.Button( 'Load' ).setMarginLeft( '7px' ).onClick( loadModel ),
		versionBtn = new UI.Button( 'View Versions' ).setMarginLeft( '7px' ).onClick( viewVersions ),
		removeBtn = new UI.Button( 'Remove' ).setMarginLeft( '7px' ).onClick(removeModel),
		// will add 1 line 
		// modelSelect2 = new UI.Panel().setId( 'modelSelect2' ),
		sceneMap = {};

	
	// container.setInnerHeight("300px");
	// container.setInnerWidth("250px");
	container.setInnerHeight("600px");
	container.setInnerWidth("950px");

	modelControlRow.add( newModelBtn );
	modelControlRow.add( loadModelBtn );
	modelControlRow.add( removeBtn );
	modelControlRow.add( versionBtn );	
	modelControlRow.setMargin("10px");
	modelControlRow.setTextAlign('center');

	container.add( modelSelect );
	// will add 1 line 
	// $("#modelSelect2").append("<div id=\"jstree_demo_div\"></div>");
	// container.add( modelSelect2 );
	container.add( modelControlRow );
	loadModelInfo();
	container.hide();

	function loadModelInfo() {
		var params = {
			start: 0,
			limit: 10
		};

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
				// will add follow lines
				// modelSelect2.setOptions(options);
				// $("#modelSelect2").append("<div id=\"jstree_demo_div\"></div>");
				var jstr = document.createElement('div');
				jstr.className = 'jstree_demo_div';
				// container.dom.appendChild("<div id=\"jstree_demo_div\"></div>");
				container.dom.appendChild(jstr);
				var customMenu = function (node) {
				    // The default set of all items
				    var items = {
				        renameItem: { // The "rename" menu item
				            label: "Rename",
				            action: function () {alert(1)}
				        },
				        deleteItem: { // The "delete" menu item
				            label: "Delete",
				            action: function () {alert(2)}
				        }
				    };

				    // if ($(node).hasClass("folder")) {
				    //     // Delete the "delete" menu item
				    //     delete items.deleteItem;
				    // }

				    return items;
				}
				
				// $('.jstree_demo_div').jstree({ 'core' : {
				// 	"check_callback" : true,
				//     'data' : [
				//        'Simple root node',
				//        {
				//          'text' : 'Root node 2',
				//          'state' : {
				//            'opened' : true,
				//            'selected' : true
				//          },
				//          'children' : [
				//            { 'text' : 'Child 1' },
				//            'Child 2'
				//          ]
				//       }
				//     ]
				// },
				// "plugins" : [ "contextmenu", "dnd" ],
				// "contextmenu": {"items": customMenu}
				// });
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
