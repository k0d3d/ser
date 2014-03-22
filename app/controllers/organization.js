var User = require('./users').users,
    Q = require('q'),
    utilities = require('../../lib/utils'),
    PreAccount = require('../models/pre-account'),
    SalesAgent = require('../models/sales_agent.js'),
    Distributor = require('../models/distributor.js'),
    Manager = require('../models/manager.js'),
    PharmaComp = require('../models/pharmacomp.js'),
    login = require('connect-ensure-login'),
    _ = require("underscore"),
    //sendMail = require('../../lib/sendmail'),
    util = require('util'),

    userInfo,


    staffFunctions = {
      getMeMyModel : function (account_type) {
        if (account_type === 2) {
          return SalesAgent;
        }  

        if (account_type === 0) {
          return PharmaComp;
        }

      },
      findOneAccount : function (doc) {
        var d = Q.defer;

        User.findOne({
          $or: [
            {"email" : doc.email },
            {"_id" : doc.id }
          ]
        })
        .exec(function (err, i) {
          if (err) {
            return d.reject(err);
          }
          if(!i || _.isEmpty(i)) {
            return d.resolve(false);
          }
          return d.resolve(i.toJSON());
        });

        return d.promise;
      },
      addOneStaff : function (doc) {
        console.log('Adding Staff');
        console.log(doc);
        var d = Q.defer();

        var user = new User();
        user.create({
          email: doc.email,
          account_type: doc.account_type,
          password: doc.password
        }, function (r) {
          if (util.isError(r)) {
            return d.reject(r);
          } else {
            return d.resolve(r);
          }
        });

        return d.promise;
      },
      sendActivationEmail : function (options) {
        var d = Q.defer();

        d.resolve({status :'sent'});

        return d.promise;
      },
      inviteOneStaff : function (doc) {
        var d = Q.defer();
        var invite = new PreAccount(doc);

        invite.activationToken = utilities.uid(64);

        invite.save(function (err, i) {
          if (err) {
            return d.reject(err);
          } else {
            return d.resolve(i);
          }
        });

        return d.promise;
      },
      findPreAccount: function (options) {
        var d = Q.defer();

        PreAccount.findOne({
          activationToken: options.activationToken,
          employerId: options.employerId,
          $or : [
            {email: options.email},
            {phone: options.phone}
          ]
        })
        .exec(function (err, i) {
          if (err) {
            return d.reject(err);
          } 
          if (_.isEmpty(i)) {
            return d.reject(new Error('PreAccount not found'));
          } else {
            return d.resolve(i);
          }
        });

        return d.promise;
      },
      removePreAccount : function (options) {
        var d = Q.defer();

        PreAccount.remove({
          activationToken: options.activationToken
        })
        .exec(function (err, i) {
          if (err) {
            return d.reject(err);
          } 
          if (_.isEmpty(i)) {
            return d.reject(new Error('PreAccount not removed'));
          } else {
            return d.resolve(i);
          }          
        });

        return d.promise;
      },
      ammendProfile : function (options) {

        console.log(id, body, account_type);
        var d = Q.defer();



        this.getMeMyModel(options.account_type).update({
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
      }
    };

function Staff () {

}


Staff.prototype.createStaff =  function (email, account_type, password) {
  console.log(email);
  var d = Q.defer();

  staffFunctions.addOneStaff({
    email: email,
    account_type : account_type,
    password : password

  })
  .then(staffFunctions.sendActivationEmail())
  .then(function (r) {
    return d.resolve(r);
  }, function (err) {
    return d.reject(err);
  });

  return d.promise;
};


Staff.prototype.inviteStaff =  function (email, phone, account_type, password, employerId) {
  var d = Q.defer();

  staffFunctions.inviteOneStaff({
    email: email,
    account_type : account_type,
    phone: phone,
    password : password,
    employerId : employerId

  })
  .then(staffFunctions.sendActivationEmail())
  .then(function (r) {
    return d.resolve(r);
  }, function (err) {
    return d.reject(err);
  })

  return d.promise;
};

Staff.prototype.lookUpPreAccounts = function (options) {
  var d = Q.defer();

  var limit = options.limit || 20, 
      page = limit * options.page,
      employerId = options.employerId;

  PreAccount.find({employerId: employerId})
  //.sort('created', -1)
  //.skip(0)
  //.limit(limit)
  .exec(function (err, i) {
    console.log(i);
    if (err) {
      return d.reject(err);
    }
    return d.resolve(i);
  });

  return d.promise;
};

Staff.prototype.activateAccount = function (activationToken, email, employer, phone) {
  var d = Q.defer();
  var options = {
    activationToken : activationToken,
    email : email,
    phone: phone,
    employerId: employer
  } 

  //Find the activation / preaccount record
  staffFunctions.findPreAccount(options)
  .then(function (user) {
    console.log(user);
    //Find Existing Account
    staffFunctions.findOneAccount(user)
    .then(function (r) {
      console.log(r);
      var d = Q.defer();
      //If no account is found
      if (!r) {
        //Create an account from the record
        return staffFunctions.addOneStaff(options);
      
      } else {
        //if an account is found
        //return another promise
        
        return d.resolve(user);
      }

      return d.promise;
    })
    .then (function (user) {
        console.log(user);

        //staffFunctions.ammendProfile(user.toJSON)
        //Remove the preaccount / activation record
        // staffFunctions.removePreAccount(options)
        // .then(function (status) {
        //   return d.resolve(status);
        // }, function (err) {
        //   return d.reject(err);
        // });       
    })

  });

  return d.promise;
};

module.exports.staff = Staff;
var staff = new Staff();

module.exports.routes = function (app, auth) {
  app.get('/organization',login.ensureLoggedIn('/signin'), function (req, res) {

    res.render('index', {
      userData: req.user
    });
  });
  app.get('/organization/invitations',login.ensureLoggedIn('/signin'), function (req, res) {

    res.render('index', {
      userData: req.user
    });
  });

  //fetch list of invitations for a company
  app.get('/api/organization/invites', login.ensureLoggedIn(), function (req, res, next) {
    var options = {
      page : req.query.page,
      limit : req.query.limit,
      employerId : req.user._id
    };
    staff.lookUpPreAccounts(options)
    .then(function(r){
      res.json(200, r);
    }, function (err) {
      next(err);
    });
  });


  app.put('/api/organization/invites',login.ensureLoggedIn('/signin'), function (req, res, next) {
    
    if (req.query.activation == 1) {
      var employerId = req.user._id;
      staff.activateAccount(req.body.activationToken, req.body.email, employerId, req.body.phone)
      .then(function (r) {
        res.json(200, r)
      }, function (err) {
        next(err);
      });
    }

  });

  app.post('/api/organization/invites',login.ensureLoggedIn('/signin'), function (req, res, next) {

    //var password = (!req.body.password) ? utilities.uid(8) : req.body.password;
    var password = req.body.password || utilities.uid(8);
    var employerId = req.user._id;
    staff.inviteStaff(req.body.email, req.body.phone, req.body.account_type, password, employerId)
    .then(function (r) {
      res.json(200, r)
    }, function (err) {
      next(err);
    });
  });
  app.post('/api/organization/staff',login.ensureLoggedIn('/signin') , function (req, res, next) {

    //var password = (!req.body.password) ? utilities.uid(8) : req.body.password;
    var password = req.body.password || utilities.uid(8);
    staff.createStaff(req.body.email, req.body.account_type, password)
    .then(function (r) {
      res.json(200, r)
    }, function (err) {
      next(err);
    });
  });
}