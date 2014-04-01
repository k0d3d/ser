var staff_model = require('../models/organization.js'),
  utils = require('util');

module.exports.routes = function (app, login) {
  var staff = new staff_model.Staff();

  app.get('/organization',login.ensureLoggedIn('/signin'), function (req, res) {

    res.render('index', {
      userData: req.user
    });
  });
  app.get('/a/organization/people/:accountType',login.ensureLoggedIn('/signin'), function (req, res) {

    res.render('index', {
      userData: req.user
    });
  });
  app.get('/a/organization/invitations',login.ensureLoggedIn('/signin'), function (req, res) {

    res.render('index', {
      userData: req.user
    });
  });
  app.get('/a/organization/people/:personId/staff',login.ensureLoggedIn('/signin'), function (req, res) {

    res.render('index', {
      userData: req.user
    });
  });
  app.get('/a/organization/profile',login.ensureLoggedIn('/signin'), function (req, res) {

    res.render('organization/profile', {
      userData: req.user,
      userProfile : {}
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

  //Fetches list of people employed by the logged in user
  app.get('/api/organization/people/:accountType', function (req, res, next) {
    staff.lookUpMyPeople(req.params.accountType, req.user._id)
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      next(err);
    });
  });

  //Fetches an employee profile 
  app.get('/api/organization/people/:personId/staff', function (req, res, next) {
    staff.lookUpMyPeople(req.params.accountType, req.user._id)
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      next(err);
    });
  });

  //Attempts to activate an account, and add the employer to 
  //the users profile.
  app.put('/api/organization/invites',login.ensureLoggedIn('/signin'), function (req, res, next) {
    
    if (req.query.activation == 1) {
      var employerId = req.user._id;
      staff.activateAccount(req.body.activationToken, req.body.email, employerId, req.body.phone, 'blahbla', req.body.account_type)
      .then(function (r) {
        res.json(200, true)
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

  //Adds a drug item to a staff profile
  app.post('/api/internal/organization/staff/drugs/', function (req, res, next) {
    var owner = req.user._id,
        account_type = req.user.account_type;
    staff.stateYourDrugs(req.body.drugId, owner, account_type)
    .then(function () {
      res.json(200, true);
    }, function (err) {
      next(err);
    })
  });


  //Attempts to activate an account, and add the employer to 
  //the users profile.
  app.del('/api/organization/invites/:activationToken',login.ensureLoggedIn('/signin'), function (req, res, next) {
    
    if (req.query.activation == 1) {
      var employerId = req.user._id;
      staff.cancelActivation(req.params.activationToken)
      .then(function (r) {
        res.json(200, true)
      }, function (err) {
        next(err);
      });
    }

  });
}