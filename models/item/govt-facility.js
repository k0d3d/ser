var mongoose = require('mongoose-q')(),
    Schema = mongoose.Schema;

var GovtFacSchema = new Schema({
  lga: {type: String},
  lga_ward: {type: String},
  facilityName: {type: String, index: true},
  facilityType: {type: String},
  ownership: {type: String},
  stateCode: {type: Number},
  lgaCode: {type: Number},
  facilityTypeCode: {type: Number},
  ownershipCode: {type: Number},
  facilityNoCode: {type: String},
  geo: [{
    lng: {type: Number},
    lat: {type: Number}
  }]
});

GovtFacSchema.index({geo: '2d'});

GovtFacSchema.statics = {
  /**
  * Auto Complete
  * @param {regex} itemName
  * @param {function} cb
  * @api private
  */
  autocomplete: function(name, field, cb) {
    var wit = this.find({}).limit(20);
    wit
    .distinct('', function (err, i) {
      
    })
    .regex('productName',new RegExp(name, 'i'))
    .exec(cb);
    //wit.exec(cb);
  },

  getStateLGA: function getStateLGA (stateId, cb) {
    this.distinct('lga', {stateCode: stateId},
    //this.find({lga: "AGEGE"},
    function (err, i) {
      if (err) {
        cb(err);
      } else {
        cb(i);
      }
    });
  }
};

mongoose.model('govtfacility', GovtFacSchema);
module.exports = mongoose.model('govtfacility');