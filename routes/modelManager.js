"use strict";

var async = require("async");

var Scene = require('../models/scene.js');
var TreeNode = require('../models/treeNode.js');
var TreeNodeMap = require('../models/treeNodeMap.js');

var index = require('./index.js');

exports.addModel = function(req, res){
    req.body.isModel = true;
    index.addScene(req, res);
};

exports.removeModel = function(req, res){
    index.removeScene(req, res);
};

exports.getModels = function(req, res) {
    var start = req.query['start'];
    var limit = req.query['limit'];

    Scene.find({'isModel': true}).limit(limit).skip(start).exec(function onEnd(err, models){
        res.send({
            'success': true,
            'models':models
        });
    });
};

exports.getModels2 = function(req, res) {

    console.log('Information: come to getModels2!!! ')
    var start = req.query['start'];
    var limit = req.query['limit'];
    var treeNodeId = req.query['treeNodeId'];

    var models = [];
    var treeNodeMaps = null;

    // version 2
    // TreeNodeMap.find({'nodeId': treeNodeId}, function(err, treeNodeMaps){
    //     // pay attention to the asynchrose load  
    //     if (treeNodeMaps) {
    //         console.log('Information: treeNodeMaps is not null!!1');
    //         treeNodeMaps.forEach(function onEach(treeNodeMap) {
    //             var id = treeNodeMap.sceneId;
    //             Scene.findOne({'uuid': id}).exec(function onEnd(err, result){
    //                 if (!err) {
    //                     models.push(result);    
    //                 } else {
    //                     console.log('ERROR: get models error!!! ')                
    //                 }
    //             });
    //         });
    //     }
    //     res.send({
    //         'success': true,
    //         'models': models
    //     });
    // });

    //version 3: use the async plugin
    async.series([
        function(callback){
            TreeNodeMap.find({'nodeId': treeNodeId}, function(err, result){
                if (err) {
                    console.log('ERROR: get tree node map error!!! ') 
                    return callback(err);
                } else {
                    treeNodeMaps = result;
                    callback(null);
                }
            });  
        },
        function(callback){
            // do some more stuff ...
            async.forEach(treeNodeMaps, function(element, callback) {
                var id = element.sceneId;
                Scene.findOne({'uuid': id}).exec(function onEnd(err, result){
                    if (!err) {
                        models.push(result);  
                        callback(null);  
                    } else {
                        console.log('ERROR: get models error!!! '); 
                        return callback(err);
                    }
                });
            }, function(err) {
                if (err) return callback(err);
                callback(null);
            });
        }
    ],// optional callback
    function(err){
        // results is now equal to ['one', 'two']
        res.send({
            'success': true,
            'models': models
        });
    });
}

// Functions on Tree

// Description: get tree nodes list
exports.getTreeNodes = function(req, res) {
    // get the tree node list
    TreeNode.getAllTreeNodes(function onEnd(err, result) {
        if(err){
            console.log("get all tree nodes err: "+ err);
        }
        if(!err){
            console.log("Test information getTreeNodes");
            res.send({
                'treeNodes' : result
            });
        }
    });

};

// Description: rename tree node
exports.editTreeNode = function(req, res) {

    var id = req.body.id;
    var name = req.body.name;

    TreeNode.findOne({
        'id': id
        }, function onEnd(err, element){
            if(!err){
                element.name = name;
                element.save(function onEnd(err, element){
                    console.log("Information: tree node updated");
                    if(!err) {
                        res.send({
                        'success': true
                        });
                    }
                });
            }
    });
};

// Description: remove tree node
exports.removeTreeNode = function(req, res) {

    var id = req.body.id;
    TreeNode.findOneAndRemove({'id': id}, function onEnd(err) {
        if(!err){
            res.send({
                'success': true
            });
        }
    });
};

// Description: add tree node
exports.addTreeNode = function(req, res) {

    console.log('-------------come to add tree node function -------------');
    var id = req.body.id;
    var pId = req.body.pId;
    var name = req.body.name;

    var element = new TreeNode({
        'id':id, 'pId':pId, 'name':name
    });
    element.save(function onEnd(err, element) {
        if(!err){
            res.send({
                'success': true
            });
        }
    });
};

