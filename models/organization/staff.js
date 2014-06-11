var mongoose = require('mongoose-q')(),
    Schema = mongoose.Schema,
    textSearch = require('mongoose-text-search');


var StaffSchema = new Schema({
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
  alt_email: {type: String}
});

StaffSchema.plugin(textSearch);
StaffSchema.index({phone: 'text'});

mongoose.model('Staff', StaffSchema);

module.exports = mongoose.model('Staff');