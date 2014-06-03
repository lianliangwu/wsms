"use strict";
var mongoose = require("mongoose");
var SIGNALS = require("signals");

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

SNode.signals = {
	nodeAdded: new SIGNALS.Signal(),
	nodeRemoved: new SIGNALS.Signal()
};

module.exports = SNode;