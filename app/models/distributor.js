var mongoose = require('mongoose'),
    Schema = mongoose.Schema,


DistrubutorSchema = new Schema({
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

mongoose.model('Distributor', DistrubutorSchema);

module.exports = mongoose.model('Distributor');