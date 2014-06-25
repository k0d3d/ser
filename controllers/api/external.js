var expressJWT = require('express-jwt'),
    jwt = require('jsonwebtoken'),
    Notify = require('../../models/postman.js').Notify,    
    appConfig = require('config').express,
    user = require('../../models/user.js'),
    _ = require('lodash'),
    passport = require('passport'),
    cors = require('cors'),
    Order = require('../../models/order.js'),
    util = require('util');    

module.exports.routes = function (app) {
  var users = new user.User();
  var order = new Order();

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
    res.json({
      authorizationToken: jwt.sign(req.user, appConfig.secret, {expiresInMinutes: 60 * 30})
    });
  });
  
  app.get('/api/v1/routetest', function (req, res) {
    res.json(200, true);
  });

  //
  //Activities 
  //
  app.route('/api/v1/activities')
  .get(function (req, res) {
    var notify = new Notify();
    var userId = req.user._id,
        accountType = req.user.account_type,
        noticesBulk = [],
        tasksList = ['myOrderNotices'];

    function __queueNotices () {
      var task = tasksList.pop();
      notify[task](userId, accountType)
      .then(function (r) {
        _.each(r, function (v) {
          noticesBulk.push(v);
        });
        if (tasksList.length) {
          __queueNotices();
        } else {
          res.json(200, noticesBulk);
        }
      }, function (err) {
        res.json(400, err);
      });
    }

    __queueNotices();

  });

  //
  //User Profile
  //
  app.route('/api/v1/users/profile')
  .get(function (req, res, next) {
    var userId = req.user._id;
    var account_type = req.user.account_type;
    users.getProfile(userId, account_type).then(function (r) {
      res.json(200, r);
      // res.json(200, _.extend(req.user.toJSON(), r));
      // res.render('user/profile', {
      //   userProfile: r || {},
      //   userData: req.user
      // });
    }, function (err) {
      next(err);
    });
  });


  //
  //Orders
  //
  app.get('/api/v1/orders/:orderStatus/display/:displayType',function(req, res){

    order.getOrders(req.params.orderStatus, req.params.displayType, req.user._id, req.user.account_type)
    .then(function(r){
      res.json(200, r);
    }, function (err) {
      res.json(400, err);
    });
  });  
};