/*global UI, Ajax*/
var AsynCollaWin = function ( ) {
    "use strict";
    var container = new UI.Window("Asynchronous Collabration");
    container.setInnerWidth("300px");
    container.setInnerHeight("310px");

    var sceneTitle = new UI.Text( 'Collaborative Scene' ).setPadding('10px');
    var sceneSelect = new UI.FancySelect().setId( 'sceneSelect' );
    sceneSelect.onChange( function () {
        var sceneId = sceneSelect.getValue();
        loadBranchInfo(sceneId);
    } );
    container.add(sceneTitle);
    container.add(sceneSelect);

    var branchTitle = new UI.Text( 'Collaborative Branch' ).setPadding('10px');
    var branchSelect = new UI.FancySelect().setId( 'branchSelect' );
    sceneSelect.onChange( function () {

    } );
    container.add(branchTitle);
    container.add(branchSelect);
    
    var btnRow = new UI.Panel();
    btnRow.add(new UI.Button("Checkout")).setTextAlign("right");
    container.add(btnRow);

    container.show = function(sceneId){
        container.dom.style.display = "";
        loadSceneInfo();
    };

    var loadSceneInfo = function () {
        var params = {};

        Ajax.getJSON({
            'url': 'getAllScenes',
            'params': params
        }, function onEnd(err, result) {
            var options = {};
            var items = result.scenes;

            items.forEach(function onEach(item) {
                options[item.uuid] = item.name + '<span style="float:right">' + item.privilege + '</span>';
            });

            sceneSelect.setOptions(options);
        });
    };

    var loadBranchInfo = function (sceneId) {
        var params = {
            'sceneId' : sceneId
        };

        Ajax.getJSON({
            'url': 'getBranches',
            'params': params
        }, function onEnd(err, result) {
            var options = {};
            var items = result.branches;

            items.forEach(function onEach(item) {
                options[item.name] = item.name + '<span style="float:right">' + item.privilege + '</span>';
            });

            branchSelect.setOptions(options);
        });
    };

    container.hide();
    return container;
};
