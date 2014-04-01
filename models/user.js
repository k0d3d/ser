/**
 * Module dependencies.
 */
 var mongoose = require('mongoose'),
 util = require('util'),
 User = require('../models/user/user.js') ,
 Q = require('q'),
 _ = require("underscore"),
 passport = require('passport'),
 Notification = require('./activity.js'),
 //Organization = require('./organization.js').Staff,
 staffUtils = require('./staff_utils.js'),


UserController = function (){
  console.log('Loading User Controller...');
};

UserController.prototype.constructor = UserController;

UserController.prototype.findUserByEmail = function (doc) {
  var d = Q.defer();

  User.findOne({'email' : doc.email })
  .exec(function (err, i) {
    if (err) {
      return d.reject(err);
    }
    if(!i || _.isEmpty(i)) {
      return d.reject(new Error('account not found'));
    }
    console.log('Account found');
    return d.resolve(i);
  });

  return d.promise;
};

/**
 * Auth callback
 */
UserController.prototype.authCallback = function(req, res) {
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
  passport.authenticate('local', function (err, user) {
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
 * creates a user account.
 * @param  {[type]}   body     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
UserController.prototype.create = function(body, callback) {
  console.log('Creating User Account');
  console.log(body);
  var user = new User(body);
  user.save(function(err) {
    if(err){
      callback(err);
    }else{
      callback(user);
    }
  });
};


UserController.prototype.findOrCreate = function (doc) {
  var findOrCreateUser = Q.defer(), user = new User();

  User.findOne({
    email : doc.email
  })
  .exec(function (err, i) {
    console.log(err, i);
    //if error occurs
    if (err) {
      return findOrCreateUser.reject(err);
    }
    //if user not found
    if (!i) {
      console.log('Creating New Account');
      user.email = doc.email;
      user.password = doc.password;
      user.account_type = doc.account_type;
      user.save(function (err, new_user) {
        if (err) {
          return findOrCreateUser.reject(err);
        }
        if (new_user) {
          console.log('Created new account');
          return findOrCreateUser.resolve(new_user);
        }
      });
    } else {
      //if user found
      console.log('Found existing account');
      return findOrCreateUser.resolve(i);
    }

  });
  return findOrCreateUser.promise;
};

/**
 * Updates User Profile
 * @param  {ObjectId}   id     the ObjectId to change values for
 * @param  {Object}   body     [description]
 * @param  {Object}   account_type    This refers to the type of account / profile to update. Since 
 * user accounts are global and the model ObjectId is the reference to a profile/account type which 
 * could be Hospital / Facility, Sales Agent, Distributor and Pharma Comp.
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
UserController.prototype.update = function(id, body, account_type) {

  console.log(id, body, account_type);
  var d = Q.defer();


  staffUtils.getMeMyModel(account_type).update({
    userId : id
  }, {
    $set: body
  }, {upsert: true}, function(err, i) {

    if (err) {
      return d.reject(err);
    }
    if (i === 1) {
      return d.resolve(true);
    } else {
      return d.reject(new Error('update failed'));
    }
  });

  return d.promise;
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

UserController.prototype.getProfile = function (userId, account_type) {
  var d = Q.defer();

  staffUtils.getMeMyModel(account_type).findOne({
    userId: userId
  })
  .populate('drugs.drug', null, 'drug')
  .exec(function (err, i) {
    if (err) {
      return d.reject(err);
    }
    if (_.isEmpty(i)) {
      return d.resolve({

      });
    }
    return d.resolve(i);
  });

  return d.promise;
};

UserController.prototype.pullActivity = function (owner) {
  var not = Q.defer(),

  notice = new Notification();
  notice.pullActivity({
    ownerId : owner
  })
  .then( function(i) {
    return not.resolve(i);
  }, function (err) {
    return not.reject(err);
  });
  return not.promise;
};


module.exports.User = UserController;