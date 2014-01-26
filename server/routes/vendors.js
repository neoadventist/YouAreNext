'use strict';


var db = require('../database.js'); 
var mongoose = require('mongoose');

exports.createVendor = function (req, res) {
	db.Vendors.create({}, function (err, vendor) {
		if (err){
			res.send(err,500); 
		}else{
			res.send({message:'Message Created',vendorId:vendor._id},201);  
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
			res.send(vendor,200);
		}
	});
};

exports.addVisitor = function(req,res){
	var shortcode = req.body.code;
	console.log(req.body); 
	db.Shortcodes.findOne({code:shortcode},function(err,shortcode){
		if(err){
			res.send(err,500);
		}else{
			var vendorId = shortcode.vendorId; 
	
		db.Visitors.find({vendorId:vendorId,position:{ $gt: 0 }}),function(err,visitors){
		
		var lastPosition = visitors.length==0 ? 1 : visitors.length; 
		
		db.Visitors.create({vendorId:vendorId,position:lastPosition},function(err,visitor){
			if(err){
				res.send(err,500);
			}else{
				res.send(visitor,201);
			}		
		});
		}
		}
	})
};

exports.finishVisitor = function(req,res){

	var visitorId = req.params.visitorId;
	var vendorId = req.params.vendorId;
	db.Visitors.find({vendorId:vendorId},function(err,visitors){
		if(err){
			res.send(err,500);
		}else{
			for(var visitor=0;visitor<visitors.length;visitor++){
				if(visitors[visitor].visitorId == visitorId){
					visitors[visitor].time.out = new Date();
				}else{
					visitors[visitor].position--;
					if(visitor[visitor].position<5){
						//send notification to person that they will be next
					}
				}
			}
		
			visitors.save();
			res.send(visitors,200);
			
		}

	});


};
