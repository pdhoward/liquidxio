var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



// routes and express framework
//
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

//Add the section needed to run Local or on IBM SoftLayer Technologies Cloud and Cloud Foundry --
app.set('port', process.env.VCAP_APP_PORT || 3000);
app.set('host', process.env.VCAP_APP_HOST || 'localhost');


//Set URL for MongoDB based on Cloud or local host deployment

var mongoUrl;
if(process.env.VCAP_SERVICES) {
  var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
  for (var svcName in vcapServices) {
    if (svcName.match(/^mongo.*/)) {
      mongoUrl = vcapServices[svcName][0].credentials.uri;
      mongoUrl = mongoUrl || vcapServices[svcName][0].credentials.url;
      break;
    }
  }
} else {
  mongoUrl = "mongodb://localhost:27017/liquidxio";
}
console.log('Mongo URL: ' + mongoUrl);
//liquidxio database
//
var mongo = require('mongoskin');
var db = mongo.db(mongoUrl, {native_parser:true});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

http.createServer(app).listen(app.get('port'), function()
		{
		console.log('Express HTTP Server listening on port ' + app.get('port') + ' Host' + app.get('host'));
		});

module.exports = app;
