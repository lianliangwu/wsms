"use strict";

var Scene = require('../models/scene.js');
var index = require('./index.js');

exports.addModel = function(req, res){
    req.body.isModel = true;
    index.addScene(req, res);
};

exports.removeModel = function(req, res){
    var uuid = req.query['uuid'];

    Scene.findOne({'uuid': uuid}, function onEnd(err, model) {
        
        if(!err && model) {
            model.remove();
            res.send({success: true});
        }
    });
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

