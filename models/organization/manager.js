var mongoose = require('mongoose'),
    Schema = mongoose.Schema,


ManagerSchema = new Schema({
  userId: {type: Schema.ObjectId, ref: 'User'},
  name : {type: String},
  coverage: {type: String},
  position: {type: String},
  employer: {
    employerId :{type: Schema.ObjectId},
    dateAdded : {type: Date}
  },  
  summary: {type: String},
  twitter: {type: String},
  facebook: {type: String},
  address: {type: String},
  phone: {type: String},
  image: {type: String, default: 'manager-avatar-400.png'},
  drugs: [{
    drug: {type: Schema.ObjectId},
    notes: {type: String, default: ''}
  }]  
});

mongoose.model('Manager', ManagerSchema);

module.exports = mongoose.model('Manager');