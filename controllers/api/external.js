var expressJWT = require('express-jwt'),
    jwt = require('jsonwebtoken'),
    Notify = require('../../models/postman.js').Notify,    
    appConfig = require('config').express,
    user = require('../../models/user.js'),
    _ = require('lodash'),
    passport = require('passport'),
    cors = require('cors'),
    Order = require('../../models/order'),
    maps = require('googlemaps'),
    MedFac = require('../../models/facility'),
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
        expressJWT({secret: appConfig.secret, skip: ['/api/v1/users/session', '/api/v1/routetest']})
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
    if (req.user.account_type === 4) {    
      res.json({
        authorizationToken: jwt.sign(req.user, appConfig.secret, {expiresInMinutes: 60 * 30})
      });
    } else {
      res.json(401, {message: 'Authorized Staffs only.'});
    }
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

  //Check ins and Check Out
  //
  //Find Medical Facilities using the users current geo-location
  //or using his coverage area as fallback.
  app.get('/api/v1/users/checkin', function (req, res, next) {
    if (req.query.supl === 'get-location-marks') {

      if (!req.query.longitude || !req.query.latitude) {
        return res.json(400, {message: "latitude or longitude missing from query"});
      } else {
        console.log(req.query);
        console.log(req.query.latitude + ',' + req.query.longitude);
        maps.reverseGeocode(req.query.latitude + ',' + req.query.longitude, function (err, data) {
          console.log(err);
        // // maps.reverseGeocode('6.6035647,3.3470857', function (err, data) {
        //   console.log(data);
        //   res.json(200, data);

          var medfacs = new MedFac();
          var address = _.pluck(data.results[0].address_components, 'short_name');
          medfacs.searchGovtRegister(req.user._id, req.user.account_type, {
            limit: 200, 
            address : address,
            name: req.query.name,
            geo: {
              lat: req.query.latitude,
              lng: req.query.longitude
            }
          })
          .then(function (med_fac_list) {
            res.json(200, med_fac_list);
          });
        });
      }
    }
  });

  //save and tag a geo-coordinate to a medical facility
  app.post('/api/v1/facilities/:facId/geo-tag', function (req, res) {
    var medfacs = new MedFac();
    medfacs.saveGeoLocation(req.params.facId, req.body.latitude, req.body.longitude)
    .then(function () {
      res.json(200, true);
    }, function (err) {
      res.json(400, err.message);
    });
  });
};