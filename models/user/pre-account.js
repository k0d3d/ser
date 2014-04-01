var mongoose = require('mongoose'),
    Schema = mongoose.Schema,

preAccountSchema = new Schema ({

  email : {type: String, required: true},
  phone : {type: String},
  activationToken: {type: String},
  created: {type: Date, default: Date.now},
  account_type: {type: String, required: true},
  password: {type: String},
  employerId: {type: Schema.ObjectId}

});



mongoose.model('preAccount', preAccountSchema);

module.exports = mongoose.model('preAccount');