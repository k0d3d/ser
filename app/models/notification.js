var mongoose = require('mongoose');

var NotificationsSchema = new mongoose.Schema({
  alertType: {type: String},
  alertDescription: {type: String},
  hospitalId: {type: mongoose.Schema.ObjectId},
  pharmaId: {type: mongoose.Schema.ObjectId},
  ownerId: {type: mongoose.Schema.ObjectId},
  staffId: {type: mongoose.Schema.ObjectId},
  created: {type: Date, default: Date.now},
  seen: {type: Boolean, default: 0}
});

NotificationsSchema.methods = {
  alertPeople : function (person, alertDoc) {

  }
}

mongoose.model('notification', NotificationsSchema);
module.exports = mongoose.model('notification');