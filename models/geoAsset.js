var mongoose = require("mongoose");

var GeoSchema = new mongoose.Schema({
  uuid: String,
  geometry: String
});

GeoSchema.statics.findByUuid = function (uuid, callback){
  this.find({uuid:new RegExp(uuid, 'i')}, callback);
}

var GeoAsset = mongoose.model('GeoAsset', GeoSchema);

module.exports = GeoAsset;
