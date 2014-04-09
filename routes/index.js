var GeoAsset = require('../models/geoAsset.js');
var ImgAsset = require('../models/imgAsset.js');
var Scene = require('../models/scene.js');
var fs = require('fs');
/*
 * GET home page.
 */

function addGeoAsset(uuid, path){
	var newGeoAsset = new GeoAsset({
		uuid: uuid,
		path: path
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

function addImgAsset(uuid, path){
	var newImgAsset = new ImgAsset({
		uuid: uuid,
		path: path
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

function saveScene(uuid, scene){
	Scene.findByUuid(uuid, function(err, scenes){
		console.log("scene.length: "+ scenes.length);
		if(scenes.length > 0){
			
			Scene.update({'uuid': uuid}, {'data': scene}, function(err, numberAffected, raw){
				if (err){
					console.log("err: fail to save scene "+ uuid);
				}
				console.log("scene saved "+ uuid);
			});
			return;
		}

		var newScene = new Scene({
			'uuid': uuid,
			'data': scene
		});
		console.log("newScene "+ newScene);
		newScene.save(function(err, scene){
			if(err){
				console.log("err: fail to save scene "+ uuid);
			}
			console.log(scene);
		});
	})
}

function loadScene(uuid, callback) {
	Scene.findByUuid(uuid, function(err, scenes){
		if(scenes.length > 0){
			callback&&callback(scenes[0]);
		}
	})
}

exports.index = function(req, res){
  res.render('index');
};

exports.test = function(req, res){
    //addGeoAsset("12233","234");
    //res.send("respond with a resource");
    res.render('test');
};

exports.addGeoAsset = function(req, res){
	var newPath = "./public/upload/" + req.body["uuid"] + ".js";
	fs.writeFile(newPath, req.body["geometry"], function (err) {
		res.send({success: true});
	});	
	addGeoAsset(req.body["uuid"], "upload/" + req.body["uuid"] + ".js");
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
}

exports.addImgAsset = function(req, res){
	var uuid = req.body["uuid"];

	fs.readFile(req.files.myImg.path, function (err, data) {
	  
	  var newPath = "./public/upload/" + req.files.myImg.name;

	  addImgAsset(uuid, "upload/" + req.files.myImg.name);
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

}

exports.saveScene = function(req, res){
	var uuid = req.body['uuid'];
	var scene = req.body['scene'];

	saveScene(uuid, scene);
	res.send({success: true});
};

exports.loadScene = function(req, res){
	var uuid = req.query['uuid'];

	loadScene(uuid, function(scene){
		res.send({
			'success': true,
			'scene':JSON.parse(scene.data)
		});
	});
}
