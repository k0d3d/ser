/**
 * Module dependencies.
 */
var mongoose = require('mongoose-q')(),
    Schema = mongoose.Schema;

var HospitalSchema =  new Schema({
  name: {type: String},
  address: {type: String},
  state: {type: String},
  lga: {type: String},
  phone: {type: String},
  lga_ward: {type: String},
  userId:{type: Schema.ObjectId, ref: 'User'},
  personel: {type: String},
  personelContactNumber: {type: String},
  summary: {type: String},
  twitter: {type: String},
  facebook: {type: String},
  favicon: {type: String},
  isValidated : {type: Boolean, default: false},
  validation: {
    lga: {type: String},
    lga_ward: {type: String},
    facilityName: {type: String},
    facilityType: {type: String},
    ownership: {type: String},
    stateCode: {type: Number},
    lgaCode: {type: Number},
    facilityTypeCode: {type: Number},
    ownershipCode: {type: Number},
    facilityNoCode: {type: String}
  },
  contactPerson: {type: String},
  contactPersonPhone: {type: String},
  alt_email: {type: String},
  lastActivity: {type: Date, default: Date.now()},
  quotesSince: {type: Number},
  image: {type: String, default: 'facility-avatar-400.jpg'}

});

// HospitalSchema.virtual('stateName').get


mongoose.model('Hospital', HospitalSchema);

module.exports = mongoose.model('Hospital');