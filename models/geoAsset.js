/*global ObjectId*/
"use strict";
var mongoose = require("mongoose");

var GeoSchema = new mongoose.Schema({
  uuid: String,
  path: String,
  name: String,
  count: {type: Number, default: 0},
  directory: ObjectId
});

GeoSchema.statics.findByUuid = function (uuid, callback){
  this.find({uuid:new RegExp(uuid, 'i')}, callback);
};

var GeoAsset = mongoose.model('GeoAsset', GeoSchema);

module.exports = GeoAsset;
