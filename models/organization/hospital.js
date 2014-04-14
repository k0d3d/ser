/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var HospitalSchema =  new Schema({
  hospitalId: {type: Number},
  name: {type: String},
  address: {type: String},
  state: {type: String},
  lga: {type: String},
  phone: {type: String},
  location: {type: String},
  userId:{type: Schema.ObjectId, ref: 'User'},
  personel: {type: String},
  personelContactNumber: {type: String},
  summary: {type: String},
  twitter: {type: String},
  facebook: {type: String},
  favicon: {type: String}
});


mongoose.model('Hospital', HospitalSchema);

module.exports = mongoose.model('Hospital');