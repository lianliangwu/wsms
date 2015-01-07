"use strict";
// Bring Mongoose into the project
var mongoose = require( 'mongoose' );
// Bring gridfs-stream into the project
var Grid = require('gridfs-stream');
var fs = require('fs');
var express = require('express');

Grid.mongo = mongoose.mongo;

// Build the connection string
var dbURI = 'mongodb://localhost/wsms';
// Create the database connection
var conn = mongoose.connect(dbURI);



mongoose.connection.on('connected', function () {
	console.log('Mongoose connected to ' + dbURI);

	var gfs = Grid(conn, mongoose.mongo);
	// var app = express();

	// app.use(express.bodyParser());
	// app.post('/upload', function(req, res) {
	// 	var tempfile    = req.files.filename.path;
	// 	var origname    = req.files.filename.name;
	// 	var writestream = gfs.createWriteStream({ filename: origname });
	// 	// open a stream to the temporary file created by Express...
	// 	fs.createReadStream(tempfile)
	// 		.on('end', function() {
	// 			res.send('upload OK');
	// 		})
	// 		.on('error', function() {
	// 			res.send('upload ERR');
	// 		})
	// 		// and pipe it to gfs
	// 		pipe(writestream);
	// });
	// app.get('/download', function(req, res) {
	// 	// TODO: set proper mime type + filename, handle errors, etc...
	// 	gfs
	// 	// create a read stream from gfs...
	// 	.createReadStream({ filename: req.param('filename') })
	// 	// and pipe it to Express' response
	// 	.pipe(res);
	// });
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
