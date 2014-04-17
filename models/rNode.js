var mongoose = require("mongoose");

var RNodeSchema = new mongoose.Schema({
  versionNum: String,
  sceneId: String,
  prevs: [String],
  nodeMap: String
});

RNodeSchema.statics.getAllVersions = function(sceneId, callback) {
	this.find({'sceneId': sceneId}, callback);
};
var RNode = mongoose.model('RNode', RNodeSchema);

module.exports = RNode;