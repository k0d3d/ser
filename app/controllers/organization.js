var User = require('./users').users,
    Q = require('q'),
    utilities = require('../../lib/utils'),
    PreAccount = require('../models/pre-account'),
    Staff = require('../models/staff.js'),
    Distributor = require('../models/distributor.js'),
    Manager = require('../models/manager.js'),
    PharmaComp = require('../models/pharmacomp.js'),
    login = require('connect-ensure-login'),
    _ = require("underscore"),
    //sendMail = require('../../lib/sendmail'),
    util = require('util'),

    userInfo,


    staffFunctions = {
      getMeMyModel : function getMeMyModel (account_type) {
        account_type = parseInt(account_type);
        if (account_type === 4) {
          return Staff;
        }  

        if (account_type === 0) {
          return PharmaComp;
        }

        if (account_type === 3) {
          return Manager;
        }
        if (account_type === 1) {
          return Manager;
        }
        if (account_type === 2) {
          return Distributor;
        }

        return Manager;

      },
      findOneAccount : function findOneAccount (doc) {
        console.log('Searching for User Account');
        var d = Q.defer();
        var user = new User();
        user.findUserByEmail({email : doc.email})
        .then(function (i) {

          return d.resolve(i);
        } , function (err) {
          return d.reject(err);
        });

        return d.promise;
      },
      findOrCreateUserAccount : function findOrCreateUserAccount (doc) {
        console.log('Will find or Create');
        var findOrCreateUser = Q.defer();

        var user = new User();
        user.findOrCreate(doc)
        .then(function (r) {
          return findOrCreateUser.resolve(r);
        }, function (err) {
          return findOrCreateUser.reject(err);
        })
        return findOrCreateUser.promise;
      },
      addOneStaff : function addOneStaff (doc) {
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
      sendActivationEmail : function sendActivationEmail (options) {
        var d = Q.defer();

        d.resolve({status :'sent'});

        return d.promise;
      },
      inviteOneStaff : function inviteOneStaff (doc) {
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
      findPreAccount: function findPreAccount (options) {
        console.log('Searching for Pre Account');
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
            console.log('Pre Account found');
            return d.resolve(i);
          }
        });

        return d.promise;
      },
      removePreAccount : function removePreAccount (options) {
        console.log('Removing Pre Account');
        var d = Q.defer();

        PreAccount.remove({
          activationToken: options.activationToken
        })
        .exec(function (err, i) {
          console.log(err, i);
          if (err) {
            return d.reject(err);
          } 
          if (!i) {
            return d.reject(new Error('PreAccount not removed'));
          } else {
            return d.resolve(options);
          }          
        });

        return d.promise;
      },
      ammendProfile : function ammendProfile (options) {
        console.log('Amending Profile');
        return console.log(options);

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
      },
      addNewEmployer : function addNewEmployer (doc) {
        console.log('Adding employer');
        var addingEmpl = Q.defer();

        this.getMeMyModel(doc.account_type).update({
          userId : doc.userId
        }, {
          $push: {
            employer:  {employerId : doc.employerId}
          }
        }, {upsert: true}, function(err, i) {

          if (err) {
            return addingEmpl.reject(err);
          }
          if (i === 1) {
            return addingEmpl.resolve(doc);
          } else {
            return addingEmpl.reject(new Error('update failed'));
          }
        });

        return addingEmpl.promise;        
      },
      lookUpPeople : function lookUpPeople(doc) {
        var book = Q.defer();

        this.getMeMyModel(doc.account_type)
        .find({"employer.employerId" : doc.employerId})
        .populate('userId', 'email account_type', 'User')
        .exec(function (err, i) {
          if (err) {
            return book.reject(err);
          }
          if (i) {
            return book.resolve(i);
          }
        })
        return book.promise;
      },
      addDrugToProfile : function addDrugToProfile (doc) {
        var added = Q.defer();

        this.getMeMyModel(doc.account_type)
        .update({
          userId : doc.owner
        }, {
          $push : {
            drugs: {
              drug : doc.drugId
            }
          }
        }, function (err, i) {
          if (err) {
            return added.reject(err);
          }
          if (i === 1) {
            return added.resolve(doc);
          } else {
            return added.reject(new Error('update drugs to profile failed'));
          }          
        });

        return added.promise;
      },
      getPeopleRelations : function getPeopleRelations (owner, account_type) {
        var relate = Q.defer(),
            peepsBelowThis = _.range(account_type, 6);



        return relate.promise;
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

/**
 * activates a users account and creates a profile if
 * once does not already exist.
 * @param  {String} activationToken [description]
 * @param  {String} email           [description]
 * @param  {ObjectId} employer        [description]
 * @param  {String} phone           [description]
 * @param  {String} password        [description]
 * @param  {Number} account_type    [description]
 * @return {Object}                 [description]
 */
Staff.prototype.activateAccount = function (activationToken, email, employer, phone, password, account_type) {
  var activator = Q.defer();
  var options = {
    activationToken : activationToken,
    email : email,
    phone: phone,
    employerId: employer,
    password: password,
    account_type: account_type
  }

  //Find the activation / preaccount record
  staffFunctions.findPreAccount(options)
  .then(staffFunctions.findOrCreateUserAccount)
  .then(function (r) {
      console.log('Conditional Op');
      var createOrAmmend = Q.defer();

      //Adds information from the users activation details
      //into the users account ,
      //
      function prepProfileData (opts, usrAccount) {
        //Remove _id from the result
        var removeUgly = _.omit(usrAccount, ['_id', '_v', 'hashed_password']);
        var profileData = _.extend(opts, removeUgly);

        //Add the userId prop to profileData
        profileData.userId = usrAccount._id; 
        return profileData;      
      }

      //Attach the profile specific information
      //to the user profile. 
      //This will create a profile for the uset if 
      //one doesnt exist or ammend an existing profile
      //
      staffFunctions.addNewEmployer(prepProfileData(options, r.toJSON()))
      .then(function (profile) {
        return createOrAmmend.resolve(profile);
      }, function (err) {
        return createOrAmmend.reject(err);
      });

      return createOrAmmend.promise;          
  })
  //Expects the an object containing the 
  //activation token.
  .then (function (doc) {
    console.log('Remove Preaccount');
    //Remove the preaccount / activation record associateds with this user
    staffFunctions.removePreAccount(doc)
    .then(function (r) {
      return activator.resolve(r);
    }, function (err) {
      return activator.reject(err);
    });       
  })
  .catch(function (err) {
    var errCatcher = Q.defer();
    console.trace(err);

    activator.reject(err);

    return errCatcher.promise;
  });

  return activator.promise;
};

/**
 * this will look up account specific employees or associates 
 * belonging to a certain employer.
 * @param  {Number} accountType the account type to look up.
 * @param  {ObjectId} employerId       the employerId
 * @return {Object}             promisse Object
 */
Staff.prototype.lookUpMyPeople = function lookUpMyPeople (accountType, employerId) {
  var libr = Q.defer();

  staffFunctions.lookUpPeople({
    account_type : accountType,
    employerId : employerId
  })
  .then(function (people) {
    return libr.resolve(people);
  }, function (err) {
    return libr.reject(err);
  });

  return libr.promise;
};

/**
 * allows a distributor, manager or staff to add drugs
 * @param  {ObjectId} drug_id the ObjectId of the drug he wishes to
 * add to his/her profile.
 * @param  {ObjectId} owner   the logged in user attempting to add
 * this drug item to his profile.
 * @param  {Number} account_type   the account type for the logged in user.
 * @return {Object}         Promise Object
 */
Staff.prototype.stateYourDrugs = function stateYourDrugs (drug_id, owner,account_type) {
  var stater = Q.defer();

  staffFunctions.addDrugToProfile({
    drugId : drug_id,
    owner: owner,
    account_type: account_type
  })
  .then(function(r) {
    return stater.resolve(r);
  }, function (err) {
    return stater.reject(err);
  });

  return stater.promise;
}

module.exports.staff = Staff;
module.exports.staffFunctions = staffFunctions;
var staff = new Staff();

module.exports.routes = function (app, auth) {
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
  })
}