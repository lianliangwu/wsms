/*global */
"use strict";
var mongoose = require("mongoose");

var GroupSchema = new mongoose.Schema({
    name: String,
    parentId: String, //its parent group
    users: [String],
    creator: String
});

var Group = mongoose.model('Group', GroupSchema);

module.exports = Group;