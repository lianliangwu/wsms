/*global Ajax, THREE*/
var Model = function(editor){
    "use strict";
    

    this.addModel = function (options, callback){
        var params = {
            nameStr: options.nameStr,
            type: options.type
        };

        Ajax.getJSON({
            'url': 'searchAssets',
            'params': params
        }, callback);       
    };

};