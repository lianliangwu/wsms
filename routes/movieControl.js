"use strict";
/*
 * wll 2015.1.07
**/

var db = require('../models/db');
var fs = require('fs');

var async = require("async");
var Movie = require('../models/movie.js');
var TreeMovie = require('../models/treeMovie.js');
var TreeNodeMap = require('../models/treeMovieMap.js');

// movie upload
exports.upload = function(req, res) {

	var tempfile    = req.files.file.path;
	console.log(tempfile);
	var origname    = req.files.file.name;
	console.log(origname);
    console.log(req.body.movieType);
    
	var writestream = db.gfs.createWriteStream({ filename: origname });
	// open a stream to the temporary file created by Express...
	fs.createReadStream(tempfile)
		.on('end', function() {
			res.send('upload OK');
		})
		.on('error', function() {
			res.send('upload ERR');
		})
		// and pipe it to gfs
		.pipe(writestream);
};

// movie download
exports.download = function(req, res) {
	// TODO: set proper mime type + filename, handle errors, etc...
	db.gfs
	// create a read stream from gfs...
	.createReadStream({ filename: req.param('filename') })
	// and pipe it to Express' response
	.pipe(res);
};

// Functions on Tree

// Description: get tree nodes list
exports.getTreeNodes = function(req, res) {
	// for first default root node insert
    // console.log('-------------come to add tree node function -------------');
    // var id = "1";
    // var pId = "0";
    // var name = "root";

    // var element = new TreeMovie({
    //     'id':id, 'pId':pId, 'name':name
    // });
    // element.save(function onEnd(err, element) {
    // 	console.log('------------- save -------------');
    //     if(!err){
    //         res.send({
    //             'success': true
    //         });
    //     }
    // });

    // get the tree node list
    TreeMovie.getAllTreeMovies(function onEnd(err, result) {
    	console.log('-------------get -------------');
        if(err){
            console.log("get all tree nodes err: "+ err);
        }
        if(!err){
            console.log("get all tree nodes success");
            res.send({
                'treeNodes' : result
            });
        }
    });
    console.log('-------------xxxxxxxxxxxx -------------');

};

// Description: rename tree node
exports.editTreeNode = function(req, res) {

    var id = req.body.id;
    var name = req.body.name;
    if (!name){
        name = 'default node';
    }

    TreeMovie.findOne({
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
    TreeMovie.findOneAndRemove({'id': id}, function onEnd(err) {
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

    var element = new TreeMovie({
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

exports.getModels2 = function(req, res) {

    // console.log('Information: come to getModels2!!! ')
    var start = req.query['start'];
    var limit = req.query['limit'];
    var treeNodeId = req.query['treeNodeId'];

    var models = [];
    var treeNodeMaps = null;

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
                var id = element.path;
                Movie.findOne({'uuid': id}).exec(function onEnd(err, result){
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
};
