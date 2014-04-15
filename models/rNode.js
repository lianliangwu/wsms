var mongoose = require("mongoose");

var RNodeSchema = new mongoose.Schema({
  versionNum: Number,
  sceneId: String,
  prevs: [String],
  nodeMap: String
});

var RNode = mongoose.model('RNode', RNodeSchema);

module.exports = RNode;