
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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
   * 0 : in cart
   * 1: order placed
   * 2: order received // at this point, disputes about who takes charge of the order is settled
   * 3: order confirmed
   * 4: order in transit
   * 5: order supplied
   * 6: order paid
   * @type {Object}
   */
  orderStatus: {type: Number, default: 0},
  orderVisibility: {type: Boolean, default: true},
  //This is the id of the hospital placing the order, order author..blah
  hospitalId: {type: Schema.ObjectId},
  orderId: {type: String, unique: true},
  amountSupplied: {type: Number},
});

var OrderStatusSchema = new Schema({
  orderId: {type: String},
  date: {type: Date, default: Date.now},
  //shospitalId: {type: String},
  orderStatus: {type: Number, required: true},
  orderCharge: {type: Schema.ObjectId},
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

module.exports.Order = mongoose.model('Order');
module.exports.OrderStatus = mongoose.model('OrderStatus');