var mongoose = require("mongoose");

var SceneSchema = new mongoose.Schema({
  uuid: String,
  data: String,
  newestVersion: Number
});

SceneSchema.statics.findByUuid = function(uuid, callback) {
  this.find({'uuid': uuid}, callback);
};

SceneSchema.statics.saveScene = function(scene, callback) {

};

SceneSchema.statics.getScene = function(uuid, callback) {
	
};

var Scene = mongoose.model('Scene', SceneSchema);

module.exports = Scene;