var staff_model = require('../models/organization.js'),
    staffUtils = require('../models/staff_utils.js'),
    Facility = require('../models/item/govt-facility.js'),
    _ = require('underscore'),
  utilities = require('../lib/utils.js'),
  util = require('util');

module.exports.routes = function (app, login) {
  var staff = new staff_model.Staff();

  app.get('/a/organization',login.ensureLoggedIn('/signin'), function (req, res) {

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
  app.get('/a/organization/people/:personId/person/:accountType',login.ensureLoggedIn('/signin'), function (req, res) {

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

  app.route('/api/internal/profile/activities')
  .get(function (req, res) {
    staff.pullActivity(req.user._id)
    .then(function(r){
      res.json(200, r);
    }, function (err) {
      res.json(400, err);
    });
  });

  //fetch list of invitations for a company
  app.get('/api/internal/organization/invites', login.ensureLoggedIn(), function (req, res, next) {
    var options = {
      page : req.query.page,
      limit : req.query.limit,
      employerId : req.user._id
    };
    staff.lookUpPreAccounts(options)
    .then(function(r){
      res.json(200, r);
    }, function (err) {
      res.json(400, err);
    });
  });

  //Fetches list of people employed by the logged in user per account type
  app.get('/api/internal/organization/people/:accountType', function (req, res) {
    staff.lookUpMyPeople(req.params.accountType, req.user._id, req.user.account_type)
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      res.json(400, err);
    });
  });

  //Fetches list of people employed by the logged in user
  app.get('/api/internal/organization/workforce', function (req, res) {
    if (req.user.account_type === 5) return res.json(200, []);
    var direction = req.query.direction;

    if (direction === 'employers') {
      staff.getPersonProfile(req.user._id, req.user.account_type)
      .then(function (r) {
        var rs = [];
        if (r.manager) {
          rs[3] = r.manager;
        }

        if (r.employer) {
          rs[2] = r.employer;
        }
        //console.log(r);
        res.json(200, rs);
      }, function (err) {
        res.json(400, err.message);
      });

    }else if (direction === 'employees') {
      staff.lookUpWorkForce(req.user.account_type, req.user._id, req.query.direction)
      .then(function (r) {
        var rs = [];

        if (r[3]) {
          rs[3] = r[3];
        }
        if (r[4]) {
          rs[4] = r[4];
        }

        res.json(200, rs);
      }, function (err) {
        res.json(400, err.message);
      });
    }    
  });

  //Fetches a person profile 
  app.get('/api/internal/organization/people/:personId/staff/:accountType', function (req, res) {
    //return res.json(200, {});
    staff.getPersonProfile(req.params.personId, req.params.accountType)
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      res.json(400, err.message);
    });
  });

  //gets all the lga's in selected state
  app.get('/api/internal/organization/states/:stateId/lga', function (req, res) {

    Facility.getStateLGA(req.params.stateId, function (lgas) {
      if (util.isError(lgas)) {
        res.json(400, lgas.message);
      } else {
        var sortAndCompact = _.compact(lgas).sort();
        var loweredCase = _.map(sortAndCompact, function (val) {
          return {name: val.toLowerCase(), content: []};
        });
        res.json(200, loweredCase);
      }
    });
  });

  app.get('/api/internal/organization/states/:stateId/facility', function (req, res) {

    staff.getStateFacility(req.params.stateId)
    .then(function (f) {
      res.json(200, f);
    }, function (err) {
      res.json(400, err.message);
    });

    // 
    // Facility.getStateFacility(req.params.stateId, function (lgas) {
    //   if (util.isError(lgas)) {
    //     res.json(400, lgas.message);
    //   } else {
    //     var sortAndCompact = _.compact(lgas).sort();
    //     var loweredCase = _.map(sortAndCompact, function (val) {
    //       return {name: val.toLowerCase(), content: []};
    //     });
    //     res.json(200, loweredCase);
    //   }
    // });
  });

  //Attempts to activate an account, and add the employer to 
  //the users profile.
  app.put('/api/internal/organization/invites',login.ensureLoggedIn('/signin'), function (req, res) {
    
    if (req.query.activation == 1) {
      var employerId = req.user._id;
      staff.activateAccount(
        req.body.activationToken,
        req.body.email, 
        employerId,
        req.user.account_type,        
        req.body.phone,
        'blahbla',
        req.body.account_type)
      .then(function () {
        res.json(200, true);
      }, function (err) {
        res.json(400, err.message);
      });
    }
    
    if (req.query.activation == 0) {
      //var employerId = req.user._id;
      staff.cancelActivation(req.body.activationToken)
      .then(function () {
        res.json(200, true);
      }, function (err) {
        res.json(400, err.message);
      });
    }

  });

  //Attempts to add a tag:  territory (lga) or med. fac to 
  //staff
  app.put('/api/internal/organization/people/:personId/tag', login.ensureLoggedIn('/signin'), function (req, res) {
    staff.tagStaff(req.params.personId, req.query.tagType, req.query.tag)
    .then(function () {
      res.json(200, req.query.tag);
    }, function (err) {
      console.log(err);
      res.json(400, err);
    });
  });

  app.post('/api/internal/organization/invites',login.ensureLoggedIn('/signin'), function (req, res) {

    //var password = (!req.body.password) ? utilities.uid(8) : req.body.password;
    var password = req.body.password || utilities.uid(8);
    var employerId = req.user._id;
    staff.inviteStaff(req.body.email, req.body.phone, req.body.account_type, password, employerId)
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      res.json(400, err);
    });
  });
  app.post('/api/internal/organization/staff',login.ensureLoggedIn('/signin') , function (req, res) {

    //var password = (!req.body.password) ? utilities.uid(8) : req.body.password;
    var password = req.body.password || utilities.uid(8);
    staff.createStaff(req.body.email, req.body.account_type, password)
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      res.json(400, err);
    });
  });

  //Adds a drug item to a staff profile
  app.post('/api/internal/organization/staff/drugs/',login.ensureLoggedIn('/signin'), function (req, res) {
    var owner = req.user._id,
        account_type = req.user.account_type;
    staff.stateYourDrugs(req.body.drugId, owner, account_type)
    .then(function () {
      res.json(200, true);
    }, function (err) {
      res.json(400, err);
    });
  });


  //Attempts to activate an account, and add the employer to 
  //the users profile.
  app.delete('/api/internal/organization/invites/:activationToken',login.ensureLoggedIn('/signin'), function (req, res) {
    
    if (req.query.activation === 1) {
      //var employerId = req.user._id;
      staff.cancelActivation(req.params.activationToken)
      .then(function () {
        res.json(200, true);
      }, function (err) {
        res.json(400, err);
      });
    }

  });

  //removes a tag; med fac. or lga from a staff
  app.delete('/api/internal/organization/people/:personId/tag', login.ensureLoggedIn('/signin'), function (req, res) {
    if (req.user.account_type < 4) {
      staff.unTagStaff(req.params.personId, req.query.tagType, req.query.tag)
      .then(function (done) {
        res.json(200, true);
      }, function (err) {
        res.json(400, err);
      });
    } else {
      res.json(401, false);
    }
    
  });
};