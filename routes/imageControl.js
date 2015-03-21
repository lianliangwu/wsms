"use strict";
/*
 * wll 2015.1.23
**/

// Description: bing image search 
exports.search = function(req, res) {

	var searchString = req.body.searchString;
	console.log(searchString);
	var searchResult;

    var Bing = require('node-bing-api')({ accKey: "gfn/M6cO7wHzrLWPJlj/RRCOWtJqg5kQ8vkveXw1aHE" });

	Bing.images(searchString, function(error, res, body){
		console.log(body);
		searchResult = body.d.results;
		console.log(searchResult);
	}, {
		skip: 50
	});

	res.send({
		'images': searchResult,
		'success': true
	});
};