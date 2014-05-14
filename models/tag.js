var mongoose = require("mongoose");

var TagSchema = new mongoose.Schema({
  sceneId: String,
  name: String,
  versionNum: String,
  description: String
});

TagSchema.statics.getAllTages = function(sceneId, callback) {
	this.find({'sceneId': sceneId}, callback);
};

var Tag = mongoose.model('Tag', TagSchema);

module.exports = Tag;