var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NotificationsSchema = new Schema({
  alertType: {type: String},
  alertDescription: {type: String},
  hospitalId: {type: Schema.ObjectId},
  pharmaId: {type: Schema.ObjectId},
  ownerId: {type: Schema.ObjectId},
  ownerAccountType: {type: Number},
  staffId: {type: Schema.ObjectId},
  originId: {type: Schema.ObjectId},
  destId: {type: Schema.ObjectId},
  generated: {type: Date, default: Date.now},
  created: {type: Date},
  referenceId: {type: String},
  orderId: {type: String},
  seen: {type: Boolean, default: false},
  meta: {type: Schema.Types.Mixed}
});


mongoose.model('notification', NotificationsSchema);
module.exports = mongoose.model('notification');