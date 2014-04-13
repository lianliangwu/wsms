var mongoose = require("mongoose");

var SNodeSchema = new mongoose.Schema({
  uuid: String,
  type: String,
  versionNum: Number,
  children:Array,
  data:String
});

var SNode = mongoose.model('SNode', SNodeSchema);

SNodeSchema.statics.findByUuid = function(uuid, callback) {
  this.find({'uuid': uuid}, callback);
};



module.exports = SNode;