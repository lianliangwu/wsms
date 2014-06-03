"use strict";
var Asset = require('../models/asset.js');
var SNode = require('../models/sNode.js');
var fs = require('fs');
var DIR = 'upload2/';


SNode.signals.nodeAdded.add(function onEvent(node) {
	switch(node.type){
	case "geometry":
		updateCount(node);
		break;
	case "texture":
		updateCount(node);
		break;
	default:
		break;
	}

	function updateCount(node){
		var state = JSON.parse(node.data);
		var uuid = state.assetId;

		if(uuid){
			Asset.findOne({
				'uuid': uuid
			}, function onEnd(err, asset){
				if(!err){
					asset.count += 1;
					asset.save(function onEnd(err, asset){
						console.log("asset count updated ", asset);
					});
				}
			});
		}
	}
});

SNode.signals.nodeRemoved.add(function onEvent(node){
	switch(node.type){
	case "geometry":
		updateCount(node);
		break;
	case "texture":
		updateCount(node);
		break;
	default:
		break;
	}

	function updateCount(node){
		var state = JSON.parse(node.data);
		var uuid = state.assetId;

		if(uuid){
			Asset.findOne({
				'uuid': uuid
			}, function onEnd(err, asset){
				if(!err){
					asset.count -= 1;
					if(asset.count === 0){
						var path = "./public/" + asset.path;
						fs.unlink(path, function onEnd(err){
							if(!err){
								console.log('removeFile success');
							}else{
								console.log(err);
							}
						});
						asset.remove();
					}else{
						asset.save(function onEnd(err, asset){
							console.log("asset count updated ", asset);
						});
					}
				}
			});
		}
	}	
});

function addAsset(newAsset, callback){

	Asset.findOne({
		'uuid': newAsset.uuid,
		'type': newAsset.type
	}, function onEnd(err, asset) {
		if(err){
			console.log(err);
			return;
		}
		if(!asset){
			newAsset.save(callback);
		}
	});
}


exports.addGeoAsset = function(req, res){
	var uuid = req.body.uuid;

	var newName = uuid + '.js';
	var geoAsset = new Asset({
		'uuid': uuid,
		'name': req.body.name,
		'path': DIR + newName,
		'type': 'geo'
	});

	addAsset(geoAsset, function onEnd(err, asset) {
		if(err){
			console.log(err);
			return;
		}
		var newPath = "./public/" + DIR + newName;
		fs.writeFile(newPath, req.body.geometry, function (err) {
			if(err){
				console.log(err);
				return;
			}
			res.send({success: true});
		});
	});
};

exports.getGeoAsset = function(req, res) {
	var uuid = req.query['uuid'];

	Asset.findOne({
		'uuid': uuid,
		'type': 'geo'
	}, function onEnd(err, asset){
		if(err){
			console.log(err);
			return;
		}
		res.send({
			success: true,
			data: asset
		});
	});
};

exports.addImgAsset = function(req, res){
	var uuid = req.body["uuid"];

	fs.readFile(req.files.myImg.path, function (err, data) {
		var oldName = req.files.myImg.name;
		var arr = oldName.split('.');
		var newName = uuid + '.' + arr[arr.length - 1];
		var newPath = "./public/" + DIR + newName;

		var imgAsset = new Asset({
			'uuid': uuid,
			'name': oldName,
			'path': DIR + newName,
			'type': 'img'
		});

		addAsset(imgAsset, function onEnd(err, asset){
			if(err){
				console.log(err);
				return;
			}
			fs.writeFile(newPath, data, function (err) {
				if(err){
					console.log(err);
					return;
				}
				res.send({success: true});
			});
		});
	});
};

exports.getImgAsset = function(req, res) {
  var uuid = req.query['uuid'];

	Asset.findOne({
		'uuid': uuid,
		'type': 'img'
	}, function onEnd(err, asset) {
		if (err) {
			console.log(err);
			return;
		}
		res.send({
			success: true,
			data: asset
		});
	});
};
