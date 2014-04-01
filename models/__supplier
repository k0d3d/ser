
/**
 * Module dependencies.
 */
var db = require("../../lib/db.js");
var mongoose = require('mongoose'),
	env = process.env.NODE_ENV || 'development',
	config = require('../../config/config')[env],
	Schema = mongoose.Schema;

var SuppliersSchema = new Schema({
	supplierName: String,
	phoneNumber: String,
	email: String,
	address: String,
	otherContact: String,
	contactPerson: String,
	contactPersonPhone: String,
	daysSupply: String,
	daysPayment: String,
  user: {type: Schema.ObjectId},
	addedOn: {type: Date, default: Date.now}
});

/**
 * [statics SupplierSchema]
 * @type {Object}
 */
SuppliersSchema.statics = {
  /**
  * Auto Complete
  * @function autocomplete
  * @param {regex} itemName
  * @param {function} cb
  * @api private
  */
  autocomplete: function(name, cb){
  	console.log(name);
    var wit = this.find({},'supplierName');
    wit.regex('supplierName',new RegExp(name, 'i')).exec(cb);
    
  }
};
mongoose.model('Supplier', SuppliersSchema);