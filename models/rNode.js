var mongoose = require("mongoose");

var RNodeSchema = new mongoose.Schema({
  uuid: String,
  data: String
});

RNodeSchema.statics.findByUuid = function(uuid, callback) {
  this.find({'uuid': uuid}, callback);
};


var RNodeSchema = mongoose.model('RNode', RNodeSchema);

module.exports = RNodeSchema;