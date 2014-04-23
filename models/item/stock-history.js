
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
/**
 * Item Schema 
 */
var StockHistorySchema = new Schema({
  itemId: {type: Schema.ObjectId},
  // the userId of the user who is performing 
  // this stock action.
  originId: {type: Schema.ObjectId},
  //the account type of the user perfoming 
  //the stock action
  originType: {type: Number},
  dateInitiated: {type: Date, default: Date.now},
  amount: {type: Number},
  //the userId of the user receiving the stock action
  destId: {type: Schema.ObjectId},
  //the account type of the user receiving the 
  //stock action
  destType: {type: Number},
  //an array containing time stamps
  //changes where made to the stock request.
  statusLog: [{
    code: {type: Number},
    dateStated: {type: Date, default: Date.now}
  }],
  /**
   * -1 - request cancelled.
   * 0 - request sent
   * 1 - request verified and approved
   * @type {Object}
   */
  status: {type: Number},
  referenceId: {type: String},
  visible: {type: Number, default: 1},
  recordType: {type: String},
  transactionId: {type: String}
});


mongoose.model('StockHistory', StockHistorySchema);
module.exports = mongoose.model('StockHistory');
