/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var HospitalSchema =  new Schema({
  hospitalId: {type: Number},
  name: {type: String},
  address: {type: String},
  phonenumber: {type: String},
  location: {type: String},
  user:{type: Schema.ObjectId, ref: 'User'},
  personel: {type: String},
  personelContactNumber: {type: String},
  favicon: {type: String}
});


mongoose.model('Hospital', HospitalSchema);

module.exports = mongoose.model('Hospital');