'use strict';


var db = require('../database.js'); 
var mongoose = require('mongoose');

exports.createVendor = function (req, res) {
	db.Vendors.create({}, function (err, vendor) {
		if (err){
			res.send(err,500); 
		}else{
			res.send({message:'Message Created',data:vendor},201);  
		}	
		// saved!
	});
};
