"use strict";
var Asset = require('../models/asset.js');
var SNode = require('../models/sNode.js');
var DNode = require('../models/dNode.js');
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
					if(asset.count === 0 && asset.autoRemove === true){
						//remove asset
						var path = "./public/" + asset.path;
						fs.unlink(path, function onEnd(err){
							if(!err){
								console.log('removeFile success.');
							}else{
								console.log(err);
							}
						});

						//remove screen shot
						if(asset.screenshot){
							path = "./public/" + asset.screenshot;
							fs.unlink(path, function onEnd(err) {
								if(err){
									console.log(err);
									return;
								}
								console.log('remove screenshot success.');
							});
						}
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
		'uuid': newAsset.uuid
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

function updateAsset(newAsset, callback) {
	delete newAsset.id;
	Asset.findOneAndUpdate({
		'uuid': newAsset.uuid
	}, {$set:newAsset}, callback);
}

// we can't remove asset when it's count > 0
function removeAsset(condition, callback) {
	Asset.findOne(condition, function onEnd(err, asset){
		if(err){
			callback&&callback(err);
		}
		if(asset.count > 0){
			callback&&callback("count is bigger than 0");
		}
		asset.remove(callback);
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
			res.send({
				success: false
			});
		}
		var newPath = "./public/" + DIR + newName;
		fs.writeFile(newPath, req.body.geometry, function (err) {
			if(err){
				console.log(err);
				res.send({
					success: false
				});
			}
			res.send({success: true});
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
				res.send({
					success: false
				});
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


exports.getGeoAsset = function(req, res) {
	var uuid = req.query['uuid'];

	Asset.findOne({
		'uuid': uuid
	}, function onEnd(err, asset){
		if(err){
			console.log(err);
			res.send({
				success: false
			});
		}
		res.send({
			success: true,
			data: asset
		});
	});
};

exports.getImgAsset = function(req, res) {
  var uuid = req.query['uuid'];

	Asset.findOne({
		'uuid': uuid
	}, function onEnd(err, asset) {
		if (err) {
			console.log(err);
			res.send({
				success: false
			});
		}
		res.send({
			success: true,
			data: asset
		});
	});
};

exports.updateGeoAsset = function(req, res) {
	var asset = JSON.parse(req.body.asset);
	updateAsset(asset, function onEnd(err) {
		if(err){
			console.log(err);
			res.send({
				success: false
			});
		}
		res.send({
			success: true
		});
	});
};

exports.updateImgAsset = function(req, res) {
	var asset = JSON.parse(req.body.asset);
	updateAsset(asset, function onEnd(err) {
		if(err){
			console.log(err);
			res.send({
				success: false
			});
		}
		res.send({
			success: true
		});
	});
};

exports.removeGeoAsset = function(req, res) {
	var uuid = req.body.uuid;

	removeAsset({
		'uuid': uuid,
		'type': 'geo'
	}, function onEnd(err) {
		if(err){
			console.log(err);
			res.send({
				success: false
			});
		}
		res.send({
			success: true
		});
	});
};

exports.removeImgAsset = function(req, res) {
	var uuid = req.body.uuid;

	removeAsset({
		'uuid': uuid,
		'type': 'img'
	}, function onEnd(err) {
		if(err){
			console.log(err);
			res.send({
				success: false
			});
		}
		res.send({
			success: true
		});
	});	
};

exports.addDirectory = function(req, res) {
	var name = req.body.name;
	var parentId = req.body.parentId;

	//test if it's a ObjectId
	if(!(/^[0-9a-fA-F]{24}$/.test(parentId))){
		parentId = undefined;
	}
	var dNode = DNode.create({
		'name': name,
		'parentId': parentId
	}, function onEnd (err, node){
		if(err){
			console.log(err);
			res.send({
				success: false
			});
		}
		res.send({
			success: true
		});
	});
};

exports.removeDirectory = function(req, res) {
	var id = req.query.id;

	DNode.findById(id, function onEnd(err, node){
		if(node.editable === true){
			node.remove(function onEnd(err){
				if(err){
					console.log(err);
					res.send({
						success: false
					});
				}
				res.send({
					success: true
				});		
			});
		}else{
			console.log("err: dNode can't be edited");
			res.send({
				success: false
			});
		}
	});
};

exports.updateDirectory = function(req, res) {
	var dNode = JSON.parse(req.body.dNode);

	var id = dNode.id;
	delete dNode.id;
	DNode.findById(id, function onEnd(err, node){
		if(node.editable === true){
			node.update({
				'id': id
			}, {$set:dNode}, function onEnd(err){
				if(err){
					console.log(err);
					res.send({
						success: false
					});
				}
				res.send({
					success: true
				});				
			});
		}else{
			console.log("err: dNode can't be edited");
			res.send({
				success: false
			});
		}
	});
};

exports.getDirTree =  function (req, res){
	//here we assume all the dNodes belong to the same tree
	DNode.find({}, function onEnd(err, nodes){
		if(err){
			console.log(err);
			res.send({
				success: false
			});
		}

		var nodeMap = {};
		var dNodes = [];
		var root;

		//build map
		nodes.forEach(function onEach(node){
			nodeMap[node.id] = JSON.parse(JSON.stringify(node));
			nodeMap[node.id].children = [];
			dNodes.push(nodeMap[node.id]);
		});

		//buld tree
		dNodes.forEach(function onEnd(node){
			var parent;

			if(node.parentId){
				parent = nodeMap[node.parentId];
				parent.children.push(node);
			}else{
				root = node;
			}
		});

		res.send({
			success: true,
			tree: root
		});
	});
};
/*
 * list the assets in the directory
 */
exports.listDirContent = function(req, res){
	var id = req.query.id;

	if(!id){
		Asset.find({}, function onEnd(err, assets){
			if(err){
				console.log(err);
				res.send({
					success: false
				});
			}

			var result = [];
			assets.forEach(function onEach(asset){
				if(asset.parentId === undefined){
					result.push(asset);
				}
			});

			res.send({
				success: true,
				assets: result
			});
		});
	}

	Asset.find({
		'parentId': id
	}, function onEnd(err, assets){
		if(err){
			console.log(err);
			res.send({
				'success': false
			});
		}

		res.send({
			'success': true,
			'assets': assets
		});
	});
};