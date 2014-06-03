/*global */
"use strict";
var mongoose = require("mongoose");

var AssetSchema = new mongoose.Schema({
  uuid: String,
  path: String,
  name: String,
  type: String,
  count: {type: Number, default: 0},
  directory: mongoose.Schema.Types.ObjectId
});

var Asset = mongoose.model('Asset', AssetSchema);

module.exports = Asset;
