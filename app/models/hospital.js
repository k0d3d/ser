/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    pureautoinc  = require('mongoose-pureautoinc'),
    _ = require('underscore');

var HospitalSchema =  new Schema({
  hospitalId: {type: Number},
  name: {type: String},
  address: {type: String},
  phonenumber: {type: String},
  location: {type: String},
  user:{type: Schema.ObjectId, ref: 'User'},
  personel: {type: String},
  favicon: {type: String}
});

HospitalSchema.plugin(pureautoinc.plugin, {
  model: 'Hospital',
  field: 'hospitalId',
  start: 1000
});

mongoose.model('Hospital', HospitalSchema);