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

SNodeSchema.statics.removeByUuid = function(uuid, versionNum, callback) {
    this.findOneAndRemove({
        'uuid': uuid,
        'versionNum': versionNum
    },function onEnd(err, node) {
        if(!err){
            console.log('snode removed', node);
            SNode.signals.nodeRemoved.dispatch(node);
        }
        callback(err);
    });
};

SNode.signals = {
	nodeAdded: new SIGNALS.Signal(),
	nodeRemoved: new SIGNALS.Signal()
};

module.exports = SNode;