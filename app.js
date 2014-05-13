
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var rc = require('./routes/revisionControl');
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
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', routes.index);
app.get('/test', routes.test);
app.post('/addImgAsset', routes.addImgAsset);
app.get('/getImgAsset', routes.getImgAsset);
app.post('/addGeoAsset', routes.addGeoAsset);
app.get('/getGeoAsset', routes.getGeoAsset);
app.post('/saveScene', routes.saveScene);
app.get('/loadScene', routes.loadScene);
app.get('/getAllScenes', routes.getAllScenes);

app.get('/getAllVersions', rc.getAllVersions);
app.get('/retrieve', rc.retrieve);
app.post('/commit', rc.commit);
app.get('/merge', rc.merge);
app.get('/checkout', rc.checkout);
app.post('/addBranch', rc.addBranch);
app.post('/removeBranch', rc.removeBranch);
app.get('/getBranches', rc.getBranches);
app.post('/addTag', rc.addTag);
app.post('/removeTag', rc.addTag);
app.get('/getTags', rc.getTags);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
