/*global */
"use strict";
var mongoose = require("mongoose");

var DNodeSchema = new mongoose.Schema({
  name: String,
  directory: mongoose.Schema.Types.ObjectId, //its parent directory
  editable: {type: Boolean, default: true}
});

var DNode = mongoose.model('DNode', DNodeSchema);

module.exports = DNode;