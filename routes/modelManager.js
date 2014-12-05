"use strict";

var Scene = require('../models/scene.js');
var revisionControl = require('./revisionControl.js');

exports.addModel = function(req, res){
    var uuid = req.body.modelId;

    req.body.sceneId = req.body.modelId;
    revisionControl.commit(req, res); // commit the first version
    Scene.findOne({'uuid': uuid}, function onEnd(err, model) {
        if(!err) {
            if(model) {
                model.isModel = true;
                model.save();
                res.send({success: true});
            }
        }
    });
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
            'scenes':models
        });
    });
};

