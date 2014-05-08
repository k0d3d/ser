/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
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
  allowedNotifications: {
    email : {type: Boolean, default: true},
    sms : {type: Boolean, default: false},
    portal: {type: Boolean, default: false},
    mobile: {type: Boolean, default: false}
  },
  approvedNotices: {}
});

// HospitalSchema.virtual('stateName').get


mongoose.model('Hospital', HospitalSchema);

module.exports = mongoose.model('Hospital');