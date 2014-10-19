"use strict";
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var rc = require('./routes/revisionControl');
var am = require('./routes/assetManage');
var http = require('http');
var path = require('path');
var db = require('./models/db');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'test')));


app.get('/', routes.index);
app.post('/saveScene', routes.saveScene);
app.get('/loadScene', routes.loadScene);
app.get('/getAllScenes', routes.getAllScenes);

app.get('/login', routes.renderLogin);
app.post('/login', routes.login);

app.get('/getAsset', am.getAsset);
app.post('/addImgAsset', am.addImgAsset);
app.get('/getImgAsset', am.getImgAsset);
app.post('/updateImgAsset', am.updateImgAsset);
app.post('/removeImgAsset', am.removeImgAsset);
app.get('/listImgAsset', am.listImgAsset);
app.post('/addGeoAsset', am.addGeoAsset);
app.get('/getGeoAsset', am.getGeoAsset);
app.post('/updateGeoAsset', am.updateGeoAsset);
app.post('/removeGeoAsset', am.removeGeoAsset);
app.get('/listGeoAsset', am.listGeoAsset);
app.post('/updateSnapshot', am.updateSnapshot);
app.get('/searchAssets', am.searchAssets);


app.post('/addDirectory', am.addDirectory);
app.post('/removeDirectory', am.removeDirectory);
app.get('/listDirContent', am.listDirContent);
app.post('/updateDirectory', am.updateDirectory);
app.get('/getDirTree', am.getDirTree);

app.get('/getAllVersions', rc.getAllVersions);
app.get('/retrieve', rc.retrieve);
app.post('/commit', rc.commit);
app.get('/merge', rc.merge);
app.post('/removeVersion', rc.removeVersion);
app.get('/checkout', rc.checkout);
app.post('/addBranch', rc.addBranch);
app.post('/removeBranch', rc.removeBranch);
app.get('/getBranches', rc.getBranches);
app.post('/addTag', rc.addTag);
app.post('/removeTag', rc.removeTag);
app.get('/getTags', rc.getTags);
app.get('/getRHG', rc.getVersionHistory);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
