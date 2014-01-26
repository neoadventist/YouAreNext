'use strict';


var db = require('../database.js'); 
var mongoose = require('mongoose');


//Twilio Credentials 
var accountSid = 'AC2a2dd305a97c253a61b43ebd590318f1'; 
var authToken = '66cf621512c2ec00e094d98e19005c22'; 
 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 

/*
client.messages.create({  
	from: "+15109240044",
	to:"8185886314",
	body:"Hey, This is Spencer!!"
}, function(err, message) { 
	console.log(err);
	console.log(message.sid); 
});
*/

client.messages.list( {}, function(err, data) {
	data.messages.forEach(function(message) {
		console.log(message.body);
	});
});

exports.createVendor = function (req, res) {
	var shortcodeId = req.body.shortcodeId.toLowerCase();
	shortcodeId = shortcodeId.toLowerCase();
	db.Vendors.create({shortcodeId:shortcodeId}, function (err, vendor) {
		if (err){
			res.send(err,500); 
		}else{
			res.send({message:'Vendor Created',vendorId:vendor._id},201);  
		}	
		// saved!
	});
};

exports.getVendorInfo = function(req,res){
	var vendorId=req.params.vendorId;
	
	db.Vendors.findOne({_id:vendorId},function(err,vendor){
		if(err){
			res.send(err,500);
		}else{
			db.Visitors.find({vendorId:vendorId}, function(err, visitors) {

				var lastPosition = visitors.length == 0 ? 1 : visitors.length;
				var currentlySeen = visitors.filter(function(visitor){
					if(visitor.finished==true){
						return visitor;
					}
				}).length;
				var shortcodeId = vendor.shortcodeId; 
				db.Shortcodes.findOne({_id:shortcodeId},function(err,shortcode){
					if(err){
						res.send(err,500);
					}else{
						shortcode.vendorId = vendorId; 
						shortcode.save();
						res.send({visitors:visitors,vendor:vendor,lastPosition:lastPosition,currentlySeen:currentlySeen,shortcode:shortcode.code},200);
					}
				})
				
				
			});
			
		}
	});
};

exports.addVisitor = function(req,res){
	
	
	var shortcode = req.body.Body.toLowerCase();
	var phone = req.body.from;
	
	db.Shortcodes.findOne({code:shortcode},function(err,s){
		console.log(s);
		var obj = {	vendorId:s.vendorId};
		
		db.Visitors.find(obj,function(err,result){
				var n = result.length;
				var v = new db.Visitors({position:n,vendorId:s.vendorId,phone:phone});
				v.save(function(err,data){
					res.send(data);
				});
				//for(var vuser=0;vuser<n;vuser++){
				//	if(n[vuser].position<)
				//}
				if(result.length>0){
				var from = '15109240044';
				var to = phone;
				var message = 'Welcome! There are '+n+' People in front of you!';
				var xml = '<?xml version="1.0" encoding="UTF-8"?><Response><Sms>'+message+'</Sms></Response>';
				res.header('Content-Type','text/xml').send(xml);
		}else{
			var from = '15109240044';
			var to = phone;
			var message = 'YAY!!';
			var xml = '<?xml version="1.0" encoding="UTF-8"?><Response><Sms >'+message+'</Sms></Response>';


			res.header('Content-Type','text/xml').send(xml)
		}
			});	
		
	});
	
	
}

exports.finishVisitor = function(req,res){

	var visitorId = req.body.visitorId;

	
	
	db.Visitors.update({_id:visitorId},{$set: { finished: true }},function(err,result){
		console.log(err);
		console.log(result);
		if(err){
			res.send(err,500);
		}else{
					
			res.send(result,200);
			
		}

	});


};

var url = 'https://api.twilio.com/2010-04-01/Accounts/accountSid/Messages';


	
var http = require("http");
var https = require("https");

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
var getMessages= function()
{
	var options = {
		    host: 'api.twilio.com',
		    port: 443,
		    path: '/2010-04-01/Accounts/'+'66cf621512c2ec00e094d98e19005c22'+'/Messages',
		    method: 'GET'
		};	   

    var prot = options.port == 443 ? https : http;
    var req = prot.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            console.log(output);
        });
    });

    req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });

    req.end();
};
getMessages();