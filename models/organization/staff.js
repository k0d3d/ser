var mongoose = require('mongoose'),
    Schema = mongoose.Schema,


StaffSchema = new Schema({
  userId: {type: Schema.ObjectId, ref: 'User'},
  name : {type: String},
  coverage: {type: String},
  position: {type: String},
  employer: {
    employerId :{type: Schema.ObjectId},
    dateAdded : {type: Date, default: Date.now}
  },
  manager: {
    managerId :{type: Schema.ObjectId},
    dateAdded : {type: Date, default: Date.now}
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
  }]
});

mongoose.model('Staff', StaffSchema);

module.exports = mongoose.model('Staff');