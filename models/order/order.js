
/**
 * Module dependencies.
 */
var mongoose = require('mongoose-q')(),
    Schema = mongoose.Schema,
    textSearch = require('mongoose-text-search');
    xInStr = require('../../lib/utils.js').xInStr;




var OrderStatusSchema = new Schema({
  date: {type: Date},
  orderStatus: {type: Number, required: true},
  orderCharge: {type: Schema.ObjectId},
});    

/**
 * Orders Schema
 */
var OrderSchema = new Schema({
  orderAmount: {type: Number, default: '0'},
  orderDate: {type: Date},
  itemId: {type: Schema.ObjectId},
  perItemPrice: {type: Number},
  finalPrice: {type: Number},
  /**
   * the account / user objectId of the distributor / manager / pharma who received 
   * the order
   * @type {Object}
   */
  orderSupplier: {
    supplierId: {type: Schema.ObjectId},
    supplier_type: Number
  },
  /**
   * the staff who is responsible for delivering this order
   * @type {Object}
   */
  orderCharge: {type: Schema.ObjectId},
  /**
   * orderStatus values 
   * -1: order canceld
   * 0 : quote request
   * 1: quote reply
   * 2: order accepted // at this point, disputes about who takes charge of the order is settled
   * 3: order confirmed
   * 4: order in transit
   * 5: order supplied
   * 6: order paid
   * @type {Object}
   */
  status: {type: Number, default: 0},
  statusLog: [OrderStatusSchema],
  orderVisibility: {type: Boolean, default: true},
  //This is the id of the hospital placing the order, order author..blah
  hospitalId: {type: Schema.ObjectId},
  originWard: {type: String},
  orderId: {type: String, unique: true},
  amountSupplied: {type: Number},
  eta: {type: Date},
  reason: {type: String},
});


OrderSchema.virtual('lastUpdate')
.get(function () {
  if (this.statusLog) {
    return this.statusLog[this.statusLog.length - 1].date;
  }
});
OrderSchema.virtual('idmask')
.get(function () {
  if (this.orderId) {
    return xInStr(this.orderId);
  }
});

OrderSchema.set('toObject' , {
  getters: true,
  virtuals: true
});
OrderSchema.set('toJSON' , {
  getters: true,
  virtuals: true
});

/**
 * Statics
 */

OrderSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email username')
      .populate('comments.user')
      .exec(cb);
  },

  /**
   * List articles
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {};
    var q = this.find(criteria);
    q.sort({orderDate: -1});
    q.exec(cb);
  }
};

var InvoiceSchema = new Schema({
  order: [OrderSchema],
  invoicedDate: {type: Date},
  status: {type: Number}
})

OrderSchema.plugin(textSearch);
OrderSchema.index({orderId: 'text'});


mongoose.model('Order', OrderSchema);
mongoose.model('OrderStatus', OrderStatusSchema);

module.exports.Order = mongoose.model('Order');
module.exports.OrderStatus = mongoose.model('OrderStatus');