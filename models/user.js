/**
 * Module dependencies.
 */
 var util = require('util'),
 User = require('../models/user/user.js'),
 Q = require('q'),
 _ = require("underscore"),
 passport = require('passport'),
 //Organization = require('./organization.js').Staff,
 staffUtils = require('./staff_utils.js'),
 sendEmail = require('../lib/email/sendMail.js').sendHTMLMail,
Orders = require('./order.js'),

userManager = {
  //finds a user using the users email address.
  //
  findUserByEmailPhone: function findUserByEmailPhone (doc) {
    // return User.findOne({
    //   $or: [
    //     {email: doc.email},
    //     {phone: doc.phone}
    //   ]
    // })
    return User.find({
        email: doc.email,
        phone: doc.phone
    })
    .execQ();
  },
  findUserByName: function findUserByName (doc) {
    var s = [], models = [2,3,4,5], luda = Q.defer();

    function _doItForHiphop () {
      var task = models.pop();
      //searching every profile 
      //till we find the names that 
      //match out query.
      staffUtils.getMeMyModel(task)
      .find({})
      .regex('name', new RegExp(doc.name, 'i'))
      .populate('userId', 'email account_type created', 'User' )
      .exec(function (err, d){
        if (err) {
          util.puts(err);
        }
        for (var i = 0; i < d.length; i++) {
          s.push(d[i]);
        }

        // s.concat(d);
        if (models.length) {
          _doItForHiphop();
        } else {
          console.log(s);
          return luda.resolve(s);
        }
      });

    }

    _doItForHiphop();

    return luda.promise;
  },
  allUsers: function allUsers (doc) {
    return User.find({}, 'email account_type activated')
    .lean()
    .skip(doc.page || 0)
    .limit(doc.page || 20)
    .execQ();
  },
  //picks the properties necessary
  //for the object that gets returned 
  //as a result.
  _composeResponseUser : function _composeResponseUser (user, profile) {
    var i = {}, 
        userInfo = _.pick(user, ['email', 'account_type', '_id']),
        profileInfo = _.pick(profile, ['name', 'phone', 'image']);

    return _.extend(i, userInfo, profileInfo);
  }  
},


UserController = function (){
  // console.log('Loading User Controller...');
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
        res.json(200, {nextUrl: '/a/profile'});
      }
    });
  })(req, res, next);
};

/**
 * Session
 */
UserController.prototype.apiToken = function(req, res) {

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
  user.email = body.email.toLowerCase();
  user.save(function(err) {
    if(err){
      callback(err);
    }else{
      sendEmail({
              to: body.email, // list of receivers
              subject: 'DrugStoc Registeration', // Subject line
          }, 'views/templates/email-templates/sign-up.jade')
          .then(function () {
              
              
          })
          .catch(function () {
              
          });      
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
 * could be Hospital / Facility, Sales Agent, Distributor and Pharma Comp. If the accountType param 
 * is omitted, the code process the update for the user's account, not his profile.
 * @return {[type]}            [description]
 */
UserController.prototype.update = function update (id, body, account_type) {
  var d = Q.defer();

  if (account_type) {  
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
  } else {

    User.update({
      _id: id
    }, {
      $set: body
    }, function (err, done) {
      console.log(err, done);
      if (err) {
        return d.reject(err);
      }
      if (done) {
        // utils
        return d.resolve(true);
      } else {
        return d.reject(new Error('update failed'));
      }
      
    });
    // User.findOne({
    //   _id: id
    // }, function (err, i ) {
    // });
  }


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

/**
 * gets the profile for the userId
 * @param  {ObjectId} userId       userId to query a profile for.
 * @param  {Number} account_type account type or account level for
 * the user id.
 * @return {[type]}              Promise Object
 */
UserController.prototype.getProfile = function (userId, account_type) {
  console.log('Getting profile...');
  var d = Q.defer();
  staffUtils.getMeMyModel(account_type).findOne({
    userId: userId
  })
  .populate('drugs.drug', 'itemName images', 'drug')
  .lean()
  .exec(function (err, user_profile) {
    if (err) {
      return d.reject(err);
    }
    //if thr is a profile
    if (user_profile) {
      // if the account is not a distributor account
      if (parseInt(account_type) !== 2 && parseInt(account_type) < 5) {
        //lets attach the employer profile
        //if thr is one.
        if (user_profile.employer) {
          console.log('user employer found...');
          staffUtils.getMeMyModel(2).findOne({
            userId: user_profile.employer.employerId
          })
          .exec(function (err, employerIsh) {
            user_profile.employer = employerIsh;
            //lets get the manager profile
            //if its available
            console.log('user manager found...');
            if (user_profile.manager) {
              staffUtils.getMeMyModel(3)
              .findOne({
                userId: user_profile.manager.managerId
              })
              .exec(function (err, managerIsh) {
                if (err) {
                  return d.reject(err);
                }
                user_profile.manager = managerIsh;
                return d.resolve(user_profile);
              });              
            } else {
              return d.resolve(user_profile);
            }
            
          });  

        } else {
          return d.resolve(user_profile);
        }

      } else {
          //lets check if the account is 
          //a facility account, if it is,
          //we wanna have all the facilities orders
          //summed up into drug item quick list
          //on the profile page
          if (parseInt(account_type) === 5) {
            var orders = new Orders();
            orders.getUserOrders(userId, account_type)
            .then(function (done) {
              user_profile.drugs = done;
              return d.resolve(user_profile);
            }, function (err) {
              return d.reject(err);
            });
          } else {            
            return d.resolve(user_profile);  
          }        
      }
    } else {
      //var tree = new staffUtils.getMeMyModel(account_type);
      //console.log(tree);
      return d.resolve({employer: {}});
    }
  });

  return d.promise;
};

UserController.prototype.findAUser = function findAUser (query) {
  var cas = Q.defer(),
      result = [];



  if (query.email || query.phone) {
    userManager.findUserByEmailPhone({
      email: query.email,
      phone: query.phone
    })
    .then(function (f) {
      //loop over and find the profiles for
      //each user result found.
      function _obPop () {
        var task = f.pop();

        staffUtils.getMeMyModel(task.account_type)
        .findOne({
          userId: task._id
        })
        .exec(function (err, myProfile) {
          //create the valid object to
          //be sent as a response.
          if (myProfile) {
            result.push(userManager._composeResponseUser(task, myProfile));
          } else {
            result.push(task);
          }

          if (f.length) {
            _obPop();
          } else {
            return cas.resolve(result);
          }
        });
      }

      //if we have found users
      //that match
      if (f.length > 0) {
        _obPop();
      } else {
        return cas.resolve([]);
      }
    })
    .fail(function (err) {
      return cas.reject(err);
    })
    .done();
  }

  if (query.name) {
    userManager.findUserByName({
      name: query.name
    })
    .then(function (profiles) {
      if (!profiles.length) {
        return cas.resolve([]);
      }

      for (var i = 0; i < profiles.length; i++) {
        result.push(userManager._composeResponseUser(profiles[i].userId, profiles[i]));
      } 

      return cas.resolve(result);
    }, function (err) {
      return cas.reject(err);
    });
  }


  return cas.promise;
};

UserController.prototype.loadAllUsers = function loadAllUsers (query) {
  var cas = Q.defer(), result = [];

  userManager.allUsers(query)
  .then(function (res) {

      //TODO:: should use staffUtils.populateProfile
      //::its Dry Principle Compliant...Blah
      //
      //
      //loop over and find the profiles for
      //each user result found.
      function _obPop () {
        var task = res.pop();

        staffUtils.getMeMyModel(task.account_type)
        .findOne({
          userId: task._id
        })
        .exec(function (err, myProfile) {
          //create the valid object to
          //be sent as a response.
          if (myProfile) {
            result.push(userManager._composeResponseUser(task, myProfile));
          } else {
            result.push(task);
          }

          if (res.length) {
            _obPop();
          } else {
            return cas.resolve(result);
          }
        });
      }

      //if we have found users
      //that match
      if (res.length) {
        _obPop();
      } else {
        return cas.resolve([]);
      }
  })
  .fail(function (err) {
    return cas.reject(err);
  })
  .done();

  return cas.promise;
}

module.exports.User = UserController;