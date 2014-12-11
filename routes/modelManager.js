"use strict";

var Scene = require('../models/scene.js');
var TreeNode = require('../models/treeNode.js');

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

exports.getTreeNodes = function(req, res) {

    // test insert data
    // treeNode.create({
    //     id: new Date(),
    //     pId: '0',
    //     name: 'name' + new Date()
    // },function onEnd(err, treeNode){
    //     // if(!err){
    //     //     console.log('new treeNode added '+ treeNode.name);
    //     //     res.send({
    //     //         'success':true
    //     //     });
    //     // }
    // });

    // get the tree node list
    TreeNode.getAllTreeNodes(function onEnd(err, result) {
        if(err){
            console.log("get all tree nodes err: "+ err);
        }
        if(!err){
            res.send({
                'treeNodes' : result
            });
        }
    });
};

