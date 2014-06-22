var expressJWT = require('express-jwt'),
    jwt = require('jsonwebtoken'),
    appConfig = require('config').express,
    user = require('../../models/user.js'),
    _ = require('lodash'),
    passport = require('passport'),
    cors = require('cors'),
    util = require('util');    

module.exports.routes = function (app) {
  // var users = new user.User();

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
    //if we are requesting the 
    //authentication route, please skip 
    //to the next route.. 
    //should be handled 
    if (req.url === '/api/v1/users/session' && req.method === 'POST') {
      next();
    } else {
      console.log('esle');
      if (req.headers.authorization) {      
        expressJWT({secret: appConfig.secret, skip: ['/api/v1/users/session']})
        .call(null, req, res, next);
      } else {
        res.json(401, {status: 'not authd'});
      }
    }
  });
  // 
  //API CORS Middleware
  
  
  // app.use('/api/v1', expressJWT({secret: appConfig.secret}));

  // app.options('/api/v1/*', cors(appConfig.cors.options));
  // app.options('/api/v1/*', cors(appConfig.cors.options));



  //Authentication Api Routes
  app.route('/api/v1/users/session').post(passport.authenticate('local', { session: false }), function (req, res) {
    console.log(req.user);
    res.json({
      authorizationToken: jwt.sign(req.user, appConfig.secret, {expiresInMinutes: 60 * 30})
    });
  });
  

  app.route('/api/v1/activities')
  .get(function (req, res) {
    res.json(200, {status: 'authd'});
  });

  app.route('/api/v1/users/profile')
  .get(function (req, res) {
    res.json(200, {status: 'authd'});
  });



}