"use strict";
var mongoose = require("mongoose");

var ImgSchema = new mongoose.Schema({
  uuid: String,
  path: String,
  name: String,
  count: {type: Number, default: 0}
});

ImgSchema.statics.findByUuid = function (uuid, callback){
  this.find({uuid:new RegExp(uuid, 'i')}, callback);
};

var ImgAsset = mongoose.model('ImgAsset', ImgSchema);

module.exports = ImgAsset;