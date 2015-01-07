"use strict";
var mongoose = require("mongoose");

var TreeMovieMapSchema = new mongoose.Schema({
  id: String,
  nodeId: String,
  // 1 nodeId maps to many movie paths
  moviePath: String,
});

TreeMovieMapSchema.statics.findById = function(id, callback) {
    this.find({'id': id}, callback);
};

TreeMovieMapSchema.statics.getAllTreeMovieMaps = function(callback) {
    this.find(callback);
};


var TreeMovieMap = mongoose.model('TreeMovieMap', TreeMovieMapSchema);

module.exports = TreeMovieMap;
