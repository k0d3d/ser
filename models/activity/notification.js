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
  created: {type: Date, default: Date.now},
  referenceId: {type: Schema.ObjectId},
  seen: {type: Boolean, default: 0}
});


mongoose.model('notification', NotificationsSchema);
module.exports = mongoose.model('notification');