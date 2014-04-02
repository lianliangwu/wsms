var mongoose = require("mongoose");

var ImgSchema = new mongoose.Schema({
  uuid: String,
  path: String
});

ImgSchema.statics.findByUuid = function (uuid, callback){
  this.find({uuid:new RegExp(uuid, 'i')}, callback);
}

var ImgAsset = mongoose.model('ImgAsset', ImgSchema);

module.exports = ImgAsset;