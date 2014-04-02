var mongoose = require("mongoose");

var SceneSchema = new mongoose.Schema({
  uuid: String,
  data: String
});

SceneSchema.statics.findByUuid = function (uuid, callback){
  this.find({'uuid': uuid}, callback);
}

var Scene = mongoose.model('Scene', SceneSchema);

module.exports = Scene;