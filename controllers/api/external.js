var expressJWT = require('express-jwt'),
    jwt = require('jsonwebtoken'),
    appConfig = require('config').express,
    user = require('../../models/user.js'),
    _ = require('lodash'),
    cors = require('cors'),
    util = require('util');    

module.exports.routes = function (app) {
  var users = new user.User();

  // app.route('/api/v1/*')
  // .get(function (req, res, next) {
  //   console.log(req.user);
  //     //CORS Headers
  //     res.header('Access-Control-Allow-Origin', '*');
  //     res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  //     next();     
  // });
  app.route('/api/v1/*')
  .all(cors(appConfig.cors.options), function (req, res, next) {
    if (req.header('Authorization')) {
      next();
    } else {
      res.json(401, {message: 'not authorized'});
    }
  },
  expressJWT({secret: appConfig.secret}));
  // 
  //API CORS Middleware
  
  
  // app.use('/api/v1', expressJWT({secret: appConfig.secret}));

  // app.options('/api/v1/*', cors(appConfig.cors.options));
  app.options('/api/v1/*', cors(appConfig.cors.options));



  //Authentication Api Routes
  app.route('/api/v1/users/session').post(users.session);
  

  app.route('/api/v1/activities')
  .get(function (req, res) {
    console.log('Send Message here');
    res.json(401, {status: 'not authd'});
  });

  app.route('/api/v1/users/profile')
  .get(function (req, res) {
    res.json(401, {status: 'not authd'});
  });



}