/**
 * Module dependencies.
 */
 var mongoose = require('mongoose'),
 util = require('util'),
 User = mongoose.model('User'),
 passport = require('passport');

 function UserController(){

 }

 UserController.prototype.constructor = UserController;



/**
 * Auth callback
 */
 UserController.prototype.authCallback = function(req, res, next) {
  res.redirect('/');
};

/**
 * Show login form
 */
UserController.prototype.signin = function(req, res) {
  var msg = req.flash('error');
  res.render('user/signin', {
    title: 'Signin',
    message: msg[0]
  });
};

/**
 * Show sign up form
 */
UserController.prototype.signup = function(req, res) {
  res.render('user/signup', {
    title: 'Sign up',
    user: new User()
  });
};

/**
 * Logout
 */
UserController.prototype.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * handles authentication when a user tries to log
 * into his account. It also handles what page a user
 * gets redirected to after a successful login.
 * The redirect page is based on the account type and
 * roles / permission assigned to that account.
 * 
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
UserController.prototype.session = function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json(401, {message: 'Username / Password  is wrong.'});
    }
    req.login (user, function (err) {
      if (err) {
        next(err);
      } else {
        res.json(200, {nextUrl: '/'});
      }
    });
  })(req, res, next);
};

/**
 * Session
 */
UserController.prototype.apiSession = function(req, res) {
  res.json(202, true);
};

/**
 * Create user
 */
 UserController.prototype.create = function(body, callback) {
  var user = new User(body);
  user.save(function(err) {
    if(err){
      callback(err);
    }else{
      callback(user);
    }
  });
};

/**
 *  Show profile
 */
UserController.prototype.show = function(req, res) {
  var user = req.profile;

  res.render('users/show', {
    title: user.name,
    user: user
  });
};

/**
 * Send User
 */
UserController.prototype.me = function(req, res) {
  res.jsonp(req.user || null);
};

/**
 * Find user by id           
 */
UserController.prototype.user = function(req, res, next, id) {
  User
  .findOne({
    _id: id
  })
  .exec(function(err, user) {
    if (err) return next(err);
    if (!user) return next(new Error('Failed to load User ' + id));
    req.profile = user;
    next();
  });
};

module.exports.users  = UserController;
var users = new UserController();

module.exports.routes = function(app, passport, auth){
  app.get('/signin', users.signin);
  app.get('/signup', users.signup);
  app.get('/signout', users.signout);
  app.get('/user-registered', function(req, res) {
    res.render('user/user-registered');
  });
  app.get('/profile', auth.requiresLogin, function (req, res) {
    res.render('index', {
      userData : req.user
    });
  });

  //Handle Public user registration
  app.post('/users', function (req, res, next){
    users.create(req.body, function (r){
      if (util.isError(r)) {
        next(r);
      } else {
        res.json(200, {nextUrl: '/user-registered'});
      }
    });
  });
  //Handle Public user registration
  app.put('/users/profile', function (req, res, next){
    users.update(req.body, function (r){
      if (util.isError(r)) {
        next(r);
      } else {
        res.json(200, {nextUrl: '/user-registered'});
      }
    });
  });

  //Handle Public User Login
  app.post('/users/session', users.session);


  app.post('/api/users/session', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password.'
  }), users.session);
  app.post('/api/session', passport.authenticate('basic', {session: false}), users.apiSession);

  app.get('/users/me', users.me);
  app.get('/users/:userId', users.show);

  //Finish with setting up the userId param
  app.param('userId', users.user);     
}