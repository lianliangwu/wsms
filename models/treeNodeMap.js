"use strict";
var mongoose = require("mongoose");

var TreeNodeMapSchema = new mongoose.Schema({
  id: String,
  nodeId: String,
  sceneId: String,
});

TreeNodeMapSchema.statics.findById = function(id, callback) {
    this.find({'id': id}, callback);
};

TreeNodeMapSchema.statics.getAllTreeNodeMaps = function(callback) {
    this.find(callback);
};


var TreeNodeMap = mongoose.model('TreeNodeMap', TreeNodeMapSchema);

module.exports = TreeNodeMap;
