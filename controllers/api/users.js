var 
    jwt = require('jsonwebtoken'),
    Notify = require('../../models/postman.js').Notify,    
    appConfig = require('config').express,
    user = require('../../models/user.js'),
    _ = require('lodash'),
    passport = require('passport');    

module.exports.routes = function (app) {
  var users = new user.User();




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
};