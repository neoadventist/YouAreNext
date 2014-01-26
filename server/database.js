var mongoose=require('mongoose');

var Schema = mongoose.Schema;

var shortcodesSchema = new Schema({code:{type: String, default: null},vendorId:{type: String, default: null}});
var Shortcodes = mongoose.model('Shortcodes', shortcodesSchema);

var vendorsSchema = new Schema({name:{type: String, default: null},email:{type: String, default: null},greeting:{type: String, default: null},shortcodeId:{type: String, default: null},visitors:[Schema.Types.Mixed]});
var Vendors = mongoose.model('Vendors', vendorsSchema);

var visitorsSchema = new Schema({name:{type: String, default: null},position:{type: Number, default: 0},vendorId:{type: String, default: null},in:{type: Date, default: new Date()},out:{type: Date, default: null},position:{type: Number, default: 0},finished:{type: Boolean, default: false},phone:{type: String, default: null}});
var Visitors = mongoose.model('Visitors', visitorsSchema);


function Models() {
        var self = this;
        this.Shortcodes = Shortcodes;
        this.Vendors = Vendors;
        this.Visitors = Visitors;
        var connection = mongoose.connect('mongodb://localhost/SaveMySpot');

        mongoose.connection.once('open', function () {
                console.log("Mongodb Database Connection Established");
                // all set!
        })
        this.connection = connection;
};


module.exports = new Models();
