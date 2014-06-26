var mongoose = require('mongoose-q')();

var CheckInSchema = new mongoose.Schema ({
  userId: {type: mongoose.Schema.ObjectId},
  checkIn: {
    timeStamp: {type: Date},
    purpose: {type: String}
  },
  checkOut: {
    timeStamp: {type: Date},
    purpose: {type: String}
  },
  lat: {type: Number},
  lng: {type: Number}
});

mongoose.model('checkin', CheckInSchema);

module.exports = mongoose.model('checkin');