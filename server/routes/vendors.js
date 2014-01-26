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
