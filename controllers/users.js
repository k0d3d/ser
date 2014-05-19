var user = require('../models/user.js'),
    _ = require('lodash'),
    util = require('util');

module.exports.routes = function(app, passport, login, people){
  var users = new user.User();

  app.route('/signin')
  .get(function (req, res, next){res.locals.people = people; next(); }, users.signin);

  app.route('/login')
  .get(function (req, res, next){res.locals.people = people; next(); }, users.signin);
  
  app.route('/signup')
  .get(function (req, res, next){res.locals.people = people; next(); }, users.signup);
  
  app.route('/signout')
  .get(users.signout);

  app.route('/user-registered')
  .get(function(req, res) {
    res.render('user/user-registered');
  });

  app.route('/a/profile')
  .get(login.ensureLoggedIn('/signin'), function (req, res) {
    //console.log(req.user);
    res.render('index', {
      userData : req.user
    });
  });

  // app.route('/user/:userId/profile')
  // .get(login.ensureLoggedIn('/signin'), function (req, res) {
  //   //return console.log(req.user);
  //   res.render('index', {
  //     userData : req.user
  //   });
  // });

  //Handle Public user registration
  app.route('/users')
  .post(login.ensureLoggedIn('/signin'), function (req, res){
    users.create(req.body, function (r){
      if (util.isError(r)) {
        res.json(400, {message: r.message});
      } else {
        res.json(200, {nextUrl: '/user-registered'});
      }
    });
  });
  
  app.route('/api/internal/users', login.ensureLoggedIn('/signin'))
  .put(function (req, res, next) {
    var id = req.user._id;
    var body = {};

    body[req.body.name] = req.body.value;    
    users.update(id, body)
    .then(function () {
      res.json(200, {message: 'Saved'});
    })
    .fail(function (err) {
      console.log(err);
      next(err);
    });
  });

  app.route('/api/internal/users/profile', login.ensureLoggedIn('/signin'))
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
  })
  .put(function (req, res, next){
    var id = req.user._id;
    var body = {},
        account_type = req.user.account_type;

    body[req.body.name] = req.body.value;


    users.update(id, body, account_type)
    .then(function () {
      res.json(200, {message: 'Saved'});
    })
    .fail(function (err) {
      console.log(err);
      next(err);
    });
  });

  //Handle Public User Login
  app.route('/users/session').post(users.session);


  app.route('/api/users/session').get(passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password.'
  }), users.session);
  app.route('/api/session').get(passport.authenticate('basic', {session: false}), users.apiSession);


  //Finish with setting up the userId param
  app.param('userId', users.user);
};

