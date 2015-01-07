"use strict";
var mongoose = require("mongoose");

var MovieSchema = new mongoose.Schema({
  uuid: String,
  path: String,
  name: String,
});

MovieSchema.statics.findByUuid = function(uuid, callback) {
    this.find({'uuid': uuid}, callback);
};

MovieSchema.statics.getAllMovies = function(callback) {
    this.find(callback);
};


var Movie = mongoose.model('Movie', MovieSchema);

module.exports = Movie;
