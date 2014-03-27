
/**
 * Module dependencies.
 */
var db = require("../../lib/db.js");
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Orders Schema
 */
var OrderSchema = new Schema({
  nafdacRegNo: {type: String},
  nafdacRegName: {type: String},
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
  orderSupplier: {type: Schema.ObjectId},
  /**
   * the staff or manager who is responsible for delivering this order
   * @type {Object}
   */
  orderCharge: {type: Schema.ObjectId},
  /**
   * orderStatus values 
   * 0 : in cart
   * 1: order placed
   * 2: order received
   * 3: order confirmed
   * 4: order in transit
   * 5: order supplied
   * 6: order paid
   * @type {Object}
   */
  orderStatus: {type: Number, default: 0},
  orderVisibility: {type: Boolean, default: true},
  hospitalId: {type: Schema.ObjectId},
  orderId: {type: String, unique: true},
  amountSupplied: {type: Number}
});

var OrderStatusSchema = new Schema({
  order_id: {type: Schema.ObjectId},
  date: {type: Date, default: Date.now},
  hospitalId: {type: String},
  status: String,
  check: {type:String, unique: true}
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
}


mongoose.model('Order', OrderSchema);
mongoose.model('OrderStatus', OrderStatusSchema);

module.exports = mongoose.model('Order');