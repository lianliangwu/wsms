"use strict";

var GeoAsset = require('../models/geoAsset.js');
var ImgAsset = require('../models/imgAsset.js');
var SNode = require('../models/sNode.js');
var fs = require('fs');
var DIR = 'upload2/';


SNode.signals.nodeAdded.add(function onEvent(node) {
	var uuid;
	switch(node.type){
	case "geometry":
		updateCount(node, GeoAsset);
		break;
	case "texture":
		updateCount(node, ImgAsset);
		break;
	default:
		break;
	}

	function updateCount(node, Asset){
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
	var uuid;
	switch(node.type){
	case "geometry":
		updateCount(node, GeoAsset);
		break;
	case "texture":
		updateCount(node, ImgAsset);
		break;
	default:
		break;
	}

	function updateCount(node, Asset){
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

/*
 * GET home page.
 */

function addGeoAsset(uuid, path, name){
	var newGeoAsset = new GeoAsset({
		uuid: uuid,
		path: path,
		name: name
	});

	GeoAsset.findByUuid(newGeoAsset.uuid, function(err, geoAsset){
		if(geoAsset.length > 0){
			return;
		}
		//如果不存在，则新增资源
		newGeoAsset.save(function(err, geoAsset){
			if(err){
				console.log("err: fail to save geoAsset "+ uuid);
			}
			console.log(uuid);
		});
	});
}

function addImgAsset(uuid, path, name){
	var newImgAsset = new ImgAsset({
		uuid: uuid,
		path: path,
		name: name
	});

	ImgAsset.findByUuid(newImgAsset.uuid, function(err, imgAsset){
		if(imgAsset.length > 0){
			return;
		}
		//如果不存在，则新增资源
		newImgAsset.save(function(err, imgAsset){
			if(err){
				console.log("err: fail to save geoAsset "+ imgAsset.uuid);
			}
			console.log(imgAsset);
		});
	});
}

exports.addGeoAsset = function(req, res){
	var newPath = "./public/" + DIR + req.body["uuid"] + ".js";
	fs.writeFile(newPath, req.body["geometry"], function (err) {
		res.send({success: true});
	});	
	addGeoAsset(req.body["uuid"], DIR + req.body["uuid"] + ".js", req.body["name"]);
};

exports.getGeoAsset = function(req, res) {
  var uuid = req.query['uuid'];

  GeoAsset.findByUuid(uuid, function onEnd(err, geoAsset) {
    if (err) {
      console.log("err: fail to get geoAsset "+ uuid);
    }
    res.send({
      success: true,
      data: geoAsset[0]
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

		addImgAsset(uuid, DIR + newName, oldName);
		fs.writeFile(newPath, data, function (err) {
		res.send({success: true});
		});
	});
};

exports.getImgAsset = function(req, res) {
  var uuid = req.query['uuid'];

  ImgAsset.findByUuid(uuid, function onEnd(err, imgAsset) {
    if (err) {
      console.log("err: fail to get imgAsset "+ uuid);
    }
    res.send({
      success: true,
      data: imgAsset[0]
    });
  });
};

