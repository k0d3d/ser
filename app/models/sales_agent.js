var mongoose = require('mongoose'),
    Schema = mongoose.Schema,


SalesAgentSchema = new Schema({
  userId: {type: Schema.ObjectId, ref: 'User'},
  name : {type: String},
  coverage: {type: String},
  position: {type: String},
  employer: {type: String},
  summary: {type: String},
  twitter: {type: String},
  facebook: {type: String},
  address: {type: String},
  phone: {type: String}
});

mongoose.model('SalesAgent', SalesAgentSchema);

module.exports = mongoose.model('SalesAgent');