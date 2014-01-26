'use strict';


var db = require('../database.js'); 
var mongoose = require('mongoose');

exports.create = function (req, res) {
	var suggestedCode = req.body.code;
	db.Shortcodes.findOne({code:suggestedCode}, function (err, code) {
		if (err){
			res.send(err,500); 
		}else{
			if(code.length>1){ //a code if found, then the user can not have this code
				res.send({message:'Code is Already Taken,try again'},200);
			}
			else{
				db.Shortcode.create({code:suggestedCode}, function (err, result) {
					if (err){
						res.send(err,500); 
					}else{
						res.send({message:'Code Created',data:result},201);  
					}
	
					// saved!
				});
			}
		}
		// saved!
	})	  
};

