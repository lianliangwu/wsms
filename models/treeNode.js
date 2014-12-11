"use strict";
var mongoose = require("mongoose");

var TreeNodeSchema = new mongoose.Schema({
  id: String,
  pId: String,
  name: String,
  open: {type: Boolean, default: false}
});

TreeNodeSchema.statics.findById = function(id, callback) {
    this.find({'id': id}, callback);
};

TreeNodeSchema.statics.getAllTreeNodes = function(callback) {
    this.find(callback);
};


var TreeNode = mongoose.model('TreeNode', TreeNodeSchema);

module.exports = TreeNode;
