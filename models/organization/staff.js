var mongoose = require('mongoose'),
    Schema = mongoose.Schema,


StaffSchema = new Schema({
  userId: {type: Schema.ObjectId, ref: 'User'},
  name : {type: String},
  coverage: [{type: String, unique: true}],
  facility: [{type: String, unique: true}],
  position: {type: String},
  employer: {
    employerId :{type: Schema.ObjectId},
    dateAdded : {type: Date}
  },
  manager: {
    managerId :{type: Schema.ObjectId},
    dateAdded : {type: Date}
  },
  summary: {type: String},
  twitter: {type: String},
  facebook: {type: String},
  address: {type: String},
  phone: {type: String},
  image: {type: String, default: 'staff-avatar-400.png'},
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

mongoose.model('Staff', StaffSchema);

module.exports = mongoose.model('Staff');