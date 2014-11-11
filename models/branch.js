var mongoose = require("mongoose");

var BranchSchema = new mongoose.Schema({
  sceneId: String,
  name: String,
  privilege: String,
  versionNum: String,
  desc: String
});

BranchSchema.statics.getAllBranches = function(sceneId, callback) {
  this.find({'sceneId': sceneId}, callback);
};


var Branch = mongoose.model('Branch', BranchSchema);

module.exports = Branch;