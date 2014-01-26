'use strict';

//TODO: Separate out all config settings to an external file.
//TODO: Extract out the routes to an external file

/* Load modules */
var http = require('http')
	, express = require('express')
	, passport = require('passport')
	, path = require('path');



/* Define the server */
var server = express();

/*Setup Binary Server */ 
var BinaryServer = require('binaryjs').BinaryServer;
var bs = BinaryServer({server: server});

/* Configure the server */
server.set('env', 'development');
server.set('port', 80);


/* Setup Express */
server.use(express.logger('dev'));
server.use(express.bodyParser());
server.use(express.methodOverride());
server.use(express.cookieParser());
server.use(express.static(path.join(__dirname, '../client')));
server.use(express.favicon());

/* Setup Session */
server.use(express.cookieParser());
server.use(express.session({secret: 'LineNext'}));


/* Setup Route Files */ 
var vendor = require('./routes/vendor.js');
var shortcode = require('./routes/shortcode.js');

/* Routes */
server.get('/', function (req, res) {
    res.sendfile(path.join(__dirname, '../client/index.html'));
});

server.post('/API/shortcode',shortcode.create);
server.post('/API/vendor',vendor.createVendor);
server.get('/API/vendor/:vendorId',vendor.getVenderInfo);
server.post('/API/visitor/',vendor.addVisitor);
server.post('/API/done/:vendorId/:sessionId',vendorFinishVisitor);


/* Start the server */
http.createServer(server).listen(server.get('port'), function () {
    console.log('Express server environment configuration is set for ' + server.get('env'));
    console.log('Express server listening on port ' + server.get('port'));
});
