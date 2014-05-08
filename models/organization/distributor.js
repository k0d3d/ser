var mongoose = require('mongoose'),
    Schema = mongoose.Schema,


DistrubutorSchema = new Schema({
  userId: {type: Schema.ObjectId, ref: 'User'},
  name : {type: String, default: 'Full Name or Company Name'},
  coverage: {type: String, default: 'Coverage'},
  position: {type: String, default: 'Position'},
  employer: [{
    employerId :{type: Schema.ObjectId},
    dateAdded : {type: Date, default: Date.now}
  }],  
  summary: {type: String, default: 'Profile Summary'},
  twitter: {type: String, default: 'Twitter Handle'},
  facebook: {type: String, default: 'Facebook Id'},
  address: {type: String, default: 'Office Address'},
  phone: {type: String, default: 'Phone Number'},
  image: {type: String, default: 'distributor-avatar-400.jpg'},
  drugs: [{
    drug: {type: Schema.ObjectId},
    notes: {type: String, default: ''}
  }],
  allowedNotifications: {
    email : {type: Boolean, default: true},
    sms : {type: Boolean, default: false},
    portal: {type: Boolean, default: false},
    mobile: {type: Boolean, default: false}
  },
  approvedNotices: {}
});

mongoose.model('Distributor', DistrubutorSchema);

module.exports = mongoose.model('Distributor');