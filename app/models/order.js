
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
  orderType: {type: String, default: 'Medical Equipment'},
  nafdacRegNo: {type: String},
  nafdacRegName: {type: String},
  orderAmount: {type: Number, default: '0'},
  orderDate: {type: Date},
  orderSupplier: [{
    supplierID: {type: String, default: ''},
    supplierName: {type: String, default: ''}
  }],
  orderStatus: {type: String, default: 'pending order'},
  orderVisibility: {type: Boolean, default: true},
  hospitalId: {type: Number},
  h_order_Id: {type: String, unique: true},
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
