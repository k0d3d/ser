var User = require('./users'),
    Q = require('q'),
    utilities = require('../../lib/utils'),
    PreAccount = require('../models/pre-account'),
    login = require('connect-ensure-login'),
    //sendMail = require('../../lib/sendmail'),
    util = require('util'),


    staffFunctions = {
      addOneStaff : function (doc) {
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
}

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