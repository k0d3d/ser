/**
 * Module dependencies.
 */
var db = require("../../lib/db.js");
var mongoose = require('mongoose'),
  env = process.env.NODE_ENV || 'development',
  config = require('../../config/config')[env],
  Schema = mongoose.Schema;


var DrugSchema = new Schema ({
  itemName : {type: String, default: '', required: true},
  sciName : {type: String, default: '', required: true},
  nafdacRegNo : {type: String, default: '', required: true},
  category : {type: String, default: '', required: true},
  currentPrice: {type: Number},
  lastUpdated: {type: Date},
  pharmaId: {type: Schema.ObjectId},
  images: [{type: String}]
});

DrugSchema.statics = {
  /**
  * Auto Complete
  * @param {regex} itemName
  * @param {function} cb
  * @api private
  */
  autocomplete: function(name, cb) {
    var wit = this.find({}).limit(20);
    wit.regex('productName',new RegExp(name, 'i')).exec(cb);
    //wit.exec(cb);
  }
};

var updateHistorySchema = new Schema({
  product_id: {type: Schema.ObjectId, ref: 'drug'},
  lastUpdated: {type: Date, default: Date.now},
  price: {type: Number}
});

mongoose.model('drug', DrugSchema);
mongoose.model('drugUpdateHistory', updateHistorySchema);
module.exports = mongoose.model('drug');
