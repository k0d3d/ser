var mongoose = require('mongoose'),
    Schema = mongoose.Schema,


PharmaCompSchema = new Schema({
  userId: {type: Schema.ObjectId, ref: 'User'},
  name : {type: String},
  coverage: {type: String},
  position: {type: String},
  summary: {type: String},
  twitter: {type: String},
  facebook: {type: String},
  address: {type: String},
  phone: {type: String},
  image: {type: String}
  
});

mongoose.model('PharmaComp', PharmaCompSchema);

module.exports = mongoose.model('PharmaComp');