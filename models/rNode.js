'use strict';

var mongoose = require("mongoose");

var RNodeSchema = new mongoose.Schema({
  versionNum: String,
  sceneId: String,
  prevs: [String],
  nodeMap: String,
  path:String
});

RNodeSchema.statics.getAllVersions = function(sceneId, callback) {
	this.find({'sceneId': sceneId}, callback);
};
RNodeSchema.statics.saveWithPath = function(rNode) {//save with the extended standard materialized path
	var path;

	function savePath (path) {
		rNode.path = path;
		rNode.save();
	}

	if(rNode.prevs.length === 1){
		RNode.findOne({
			'sceneId': rNode.sceneId,
			'versionNum': rNode.prevs[0]
		}, function onEnd(err, result) {
			if(!err){
				path = result.path + '>' + rNode.versionNum;
				savePath(path);
			}
		});
	}else if(rNode.prevs.length === 2){
		RNode.findOne({
			'sceneId': rNode.sceneId,
			'versionNum': rNode.prevs[0]
		}, function onEnd(err, resultA) {
			if(!err){
				RNode.findOne({
					'sceneId': rNode.sceneId,
					'versionNum': rNode.prevs[1]
				}, function onEnd(err, resultB) {
					if(!err){
						path = '[(' + resultA.path + ')V(' + resultB.path + ')]>' + rNode.versionNum;
						savePath(path);
					}
				});
			}
		});
	}else if(rNode.prevs.length === 0){
		path = rNode.versionNum;
		savePath(path);
	}
};
var RNode = mongoose.model('RNode', RNodeSchema);

module.exports = RNode;