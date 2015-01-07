"use strict";
// Bring Mongoose into the project
var mongoose = require( 'mongoose' );
// Bring gridfs-stream into the project
var Grid = require('gridfs-stream');
var express = require('express');
Grid.mongo = mongoose.mongo;

// Build the connection string
var dbURI = 'mongodb://localhost/wsms';

// Create the database connection
var conn = mongoose.connect(dbURI);

// add for gridfs conn
var conn2 = mongoose.createConnection(dbURI);
conn2.once('open', function () {
	console.log('Mongoose start connected to ' + dbURI);
	var gfs = Grid(conn2.db);
	exports.gfs = gfs;
});

mongoose.connection.on('connected', function () {
	console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error',function (err) {
	console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
	console.log('Mongoose disconnected');
});

process.on('SIGINT', function() {
	mongoose.connection.close(function () {
		console.log('Mongoose disconnected through app termination');
		process.exit(0);
	});
});
