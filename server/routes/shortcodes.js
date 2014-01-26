'use strict';


var db = require('../database.js'); 
var mongoose = require('mongoose');

exports.create = function (req, res) {
	var suggestedCode = req.body.code;
console.log(req.body);
	db.Shortcodes.findOne({code:suggestedCode}, function (err, result) {
		if (err){
			res.send(err,500); 
		}else{ 
			if(result!=(undefined || null)){ //a code if found, then the user can not have this code
				res.send({message:'Code is Already Taken,try again'},200);
			}
			else{
				db.Shortcodes.create({code:suggestedCode}, function (err, result) {
					if (err){
						res.send(err,500); 
					}else{	
						db.Vendors.create({}, function (err, vendor) {
					                if (err){
				                        res.send(err,500);
					                }else{
								db.Shortcodes.find({code:suggestedCode},function(err,scode){
	if(err){
		res.send(err,500);
	}else{
		scode.vendorId=vendor._id;
		scode.save();
		res.send({message:'Vendor Created',vendorId:vendor._id},201);
	}
});                    
					                }
				                // saved!
					        });

					}
	
					// saved!
				});
			}
		}
		// saved!
	})	  
};

