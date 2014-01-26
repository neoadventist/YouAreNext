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

exports.createVendor = function (req, res) {
	var shortcodeId = req.body.shortcodeId;
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
					if(visitor.finished){
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
	
	client.messages.list(function(err, data) {
		data.messages.forEach(function(message) {
			console.log(message.Body);
		});
	});

	
	var shortcode = req.body.shortcode;
	
	db.Shortcodes.findOne({code:shortcode},function(err,s){
		
		var obj = {	vendorId:s.vendorId};
		
		db.Visitors.find(obj,function(err,result){
			var n = result.length;
			console.log(result);
			var v = new db.Visitors({position:n,vendorId:s.vendorId});
			v.save(function(err,data){
				res.send(data);
			});
			
			
		});		
	});
	
	
}

exports.finishVisitor = function(req,res){

	var visitorId = req.body.visitorId;

	
	var obj = {'vendorId':v.toString()};
	db.Visitors.update({_id:visitorId},{$set: { finished: true }},function(err,visitors){
		
		if(err){
			res.send(err,500);
		}else{
					
			res.send(visitors,200);
			
		}

	});


};
