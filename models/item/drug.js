/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


function getQuoteString (bool) {
  console.log(bool);
  return (bool === false) ? 'No' : 'Yes'; 
}
function setQuoteString (word) {
  return (word === 'No') ? false : true; 
}


var DrugSchema = new Schema ({
  itemName : {type: String, default: '', required: true},
  sciName : {type: String, default: '', required: false},
  nafdacRegNo : {type: String, default: '', required: false},
  category : {type: String, default: ''},
  currentPrice: {
    wholesale: {type: Number},
    retail: {type: Number},
    institution: {type: Number},
    staffPrice: {type: Number}
  },
  itemForm: {type: String, default: ''},
  itemPackaging: {type: String, default: ''},
  lastUpdated: {type: Date},
  indications : {type: String, default: ''},
  contradictions: {type: String, default: ''},
  warnings: {type: String, default: ''},
  precautions: {type: String, default: ''},
  reactions: {type: String, default: ''},
  dosage: {type: String, default: ''},
  //this represents the user who added this item.
  //possibly a distributor, pharma manager, or pharma comp.
  //supplier_type represend the account_type or account level 
  //of the supplier. It should be a number
  supplier: {
    supplierId: {type: Schema.ObjectId},
    supplier_type: {type: Number, required: true}
  },
  pharma: {
    pharmaId: {type: Schema.ObjectId},
    pharmaName: {type: String}
  },
  distributor: [{type: Schema.ObjectId}],
  images: [{type: String}],
  drugTags: [{type: String}],
  instantQuote: {type: Boolean, default: false, get: getQuoteString, set: setQuoteString},
  packageQty: {type: Number, default: 0}
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

module.exports.drug = mongoose.model('drug');
module.exports.drugUpdateHistory = mongoose.model('drugUpdateHistory');
