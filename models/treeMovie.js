"use strict";
var mongoose = require("mongoose");

var TreeMovieSchema = new mongoose.Schema({
  id: String,
  pId: String,
  name: String,
  open: {type: Boolean, default: false}
});

TreeMovieSchema.statics.findById = function(id, callback) {
    this.find({'id': id}, callback);
};

TreeMovieSchema.statics.getAllTreeMovies = function(callback) {
    this.find(callback);
};


var TreeMovie = mongoose.model('TreeMovie', TreeMovieSchema);

module.exports = TreeMovie;