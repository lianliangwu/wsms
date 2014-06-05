/*global */
"use strict";
var mongoose = require("mongoose");

var AssetSchema = new mongoose.Schema({
  uuid: String,
  path: String,
  screenshot: String,
  name: String,
  type: String,
  count: {type: Number, default: 0},
  dirId: mongoose.Schema.Types.ObjectId,
  autoRemove: {type: Boolean, default: true}
});

var Asset = mongoose.model('Asset', AssetSchema);

module.exports = Asset;
