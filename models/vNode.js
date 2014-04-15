var mongoose = require("mongoose");

var VNodeSchema = new mongoose.Schema({
  versionNum: Number,
  sceneId: String,
  preVs: String,
  nodeMap: String
});

var VNode = mongoose.model('VNode', VNodeSchema);

module.exports = VNode;