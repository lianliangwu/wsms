var mongoose = require("mongoose");

var RNodeSchema = new mongoose.Schema({
  verisonNum: Number,
  sceneId: String,
  preViewsions: Array,
  nodeMap: String
});

var RNode = mongoose.model('RNode', RNodeSchema);

module.exports = RNode;