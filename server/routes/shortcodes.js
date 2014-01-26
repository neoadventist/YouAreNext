'use strict';


var db = require('../database.js'); 
var mongoose = require('mongoose');

exports.create = function (req, res) {
	var suggestedCode = req.body.shortcode;
console.log(req.body);
	db.Shortcodes.findOne({code:suggestedCode}, function (err, result) {
		if (err){
			res.send(err,500); 
		}else{ 
			if(result!=(undefined || null)){ //a code if found, then the user can not have this code
				res.send({message:'Code is Already Taken,try again'},200);
			}
			else{
				db.Shortcodes.create({code:suggestedCode}, function (err, shortcode) {
					if (err){
						res.send(err,500); 
					}else{	
						res.send({message:'Code Has been Created!',shortcodeId:shortcode._id},201);
						
					}
	
					// saved!
				});
			}
		}
		// saved!
	})	  
};

