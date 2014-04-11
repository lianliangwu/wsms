var mongoose = require("mongoose");

var SNodeSchema = new mongoose.Schema({
  uuid: String,
  data: String
});

SNodeSchema.statics.findByUuid = function(uuid, callback) {
  this.find({'uuid': uuid}, callback);
};


var SNodeSchema = mongoose.model('SNode', SNodeSchema);

module.exports = SNodeSchema;