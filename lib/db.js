// Load configurations
// if test env, load example file
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config'),
    mongoose = require('mongoose'),
    pureautoinc  = require('mongoose-pureautoinc');

// Bootstrap db connection
if(!mongoose.connection.readyState){
	mongoose.connect(config.db);
}

mongoose.connection.on('connected', function(){
  console.log("DB Connected");
  
});
pureautoinc.init(mongoose);


// If the connection throws an error
mongoose.connection.on('error',function (err) {
  console.log(err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});



// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

module.exports = mongoose;

