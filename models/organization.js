var Q = require('q'),
    utilities = require('../lib/utils'),
    PreAccount = require('./user/pre-account'),
    staffUtils = require('./staff_utils.js'),
    _ = require('underscore'),
    //sendMail = require('../../lib/sendmail'),
    util = require('util'),
    User = require('./user.js').User,


staffFunctions = {
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

    var d = Q.defer();

    staffUtils.getMeMyModel(options.account_type).update({
      userId : options.id
    }, {
      $set: options.body
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

    staffUtils.getMeMyModel(doc.account_type).findOne({
      userId : doc.userId
    })
    .exec(function (err, i) {
      console.log(i);
      if (err) {
        return addingEmpl.reject(err);
      }
      //if we find a profile, we check if its 
      //all got a manager or employer, if it has one
      //we throw back an error/
      //else we add one to it 
      //
      //if no profile found, create
      if (!i) {
        var ac = new staffUtils.getMeMyModel(doc.account_type);
        ac.employer = {employerId : doc.employerId, dateAdded: Date.now()};
        ac.save(function (err, i) {
          if (err) {
            return addingEmpl.reject(err);
          } else {
            return addingEmpl.resolve(i);
          }          
        });
      }

      //account found and has employer / manager
      if (i.employer.employerId) {
        return addingEmpl.reject(new Error('user is already attached to an employer')); 
      } 

      //if a profile has been found without 
      //an employer / manager.. we'll just add 
      //one right in
      if (!i.employer.employerId) {
        i.employer = {employerId : doc.employerId, dateAdded: Date.now()};
        i.save(function (err, i) {
          if (err) {
            return addingEmpl.reject(err);
          } else {
            return addingEmpl.resolve(i);
          }          
        });        
      }

    });

    return addingEmpl.promise;        
  },
  addNewManager : function addNewManager (doc) {
    console.log('Adding employer');
    var addingEmpl = Q.defer();


    staffUtils.getMeMyModel(doc.account_type).findOne({
      userId : doc.userId
    })
    .exec(function (err, i) {
      if (err) {
        return addingEmpl.reject(err);
      }
      //if we find an account, we check if its 
      //all got a manager or employer, if it has one
      //we throw back an error/
      //else we add one to it 
      //
      //if no account found, create
      if (!i) {
        var ac = new staffUtils.getMeMyModel(doc.account_type);
        ac.manager = {managerId : doc.employerId, dateAdded: Date.now()};
        ac.save(function (err, i) {
          if (err) {
            return addingEmpl.reject(err);
          } else {
            return addingEmpl.resolve(i);
          }          
        });
      }

      //account found and has employer / manager
      if (i.manager.managerId) {
        return addingEmpl.reject(new Error('user is already attached to a manager')); 
      }

      //if a profile has been found without 
      //an employer / manager.. we'll just add 
      //one right in
      if (!i.manager.managerId) {
        i.manager = {managerId : doc.employerId, dateAdded: Date.now()};
        i.save(function (err, i) {
          if (err) {
            return addingEmpl.reject(err);
          } else {
            return addingEmpl.resolve(i);
          }          
        });        
      }
    });


    return addingEmpl.promise;        
  },
  lookUpPeople : function lookUpPeople(doc) {
    var book = Q.defer(), options;

    if (doc.employerType === 2) {
      options = {'employer.employerId' : doc.employerId};
    }
    if (doc.employerType === 3) {
      options = {'manager.managerId' : doc.employerId};
    }
    
    staffUtils.getMeMyModel(doc.account_type)
    .find(options)
    .populate('userId', 'email account_type', 'User')
    .exec(function (err, i) {
      if (err) {
        return book.reject(err);
      }
      if (i) {
        return book.resolve(i);
      }
    });
    return book.promise;
  },
  addDrugToProfile : function addDrugToProfile (doc) {
    var added = Q.defer();

    staffUtils.getMeMyModel(doc.account_type)
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
  },
  ownerProfile : function ownerProfile (ownerId, account_type) {
    var d = Q.defer();

    

    return d.promise;
  },
  addLgaToStaff: function addLgaToStaff (doc) {
    var op = Q.defer();
    console.log(doc);
    staffUtils.getMeMyModel(4)
    .update({
      userId: doc.userId
    }, {
      $push: {
        coverage: doc.tag
      }
    }, function (err, i) {
      if (err) {
        return op.reject(err);
      }
      if (i) {
        return op.resolve(i);
      }
      if (!i) {
        return op.reject(new Error('cannot update staff tags'));
      }
    });
    return op.promise;
  },
  removeLgasFromStaff: function removeLgasFromStaff (doc) {
    var op = Q.defer();
    staffUtils.getMeMyModel(4)
    .update({
      userId: doc.userId
    }, {
      $pull: {
        coverage: doc.tag
      }
    }, function (err, i) {
      if (err) {
        return op.reject(err);
      }
      if (i) {
        return op.resolve(i);
      }
      if (!i) {
        return op.reject(new Error('cannot update staff tags'));
      }
    });

    return op.promise;
  },
  addFacToStaff: function addFacToStaff (doc) {
    var op = Q.defer();
    staffUtils.getMeMyModel(4)
    .update({
      userId: doc.userId
    }, {
      $pull: {
        facility: doc.tag
      }
    }, function (err, i) {
      if (err) {
        return op.reject(err);
      }
      if (i) {
        return op.resolve(i);
      }
      if (!i) {
        return op.reject(new Error('cannot update staff tags'));
      }
    });

    return op.promise;
  },
  removeFacFromStaff: function removeFacFromStaff (doc) {
    var op = Q.defer();
    staffUtils.getMeMyModel(4)
    .update({
      userId: doc.userId
    }, {
      $pull: {
        facility: doc.tag
      }
    }, function (err, i) {
      if (err) {
        return op.reject(err);
      }
      if (i) {
        return op.resolve(i);
      }
      if (!i) {
        return op.reject(new Error('cannot update staff tags'));
      }
    });

    return op.promise;
  },
  findFacilities: function findFacilities (doc) {
    var find = Q.defer();

    staffUtils.getMeMyModel(5)
    .find({
      state: 'Lagos'
    })
    .exec(function (err, i) {
      if (err) {
        return find.reject(err);
      }
      return find.resolve(i);
    });

    return find.promise;
  }
};

function Staff () {
}


Staff.prototype.constructor = Staff;


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
  });

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
Staff.prototype.activateAccount = function activateAccount (activationToken, email, employer, employerType, phone, password, account_type) {
  var activator = Q.defer();
  var options = {
    activationToken : activationToken,
    email : email,
    phone: phone,
    employerId: employer,
    password: password,
    account_type: account_type
  };


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
      //This will create a profile for the user if 
      //one doesnt exist or ammend an existing profile
      if (employerType === 2) {
        staffFunctions.addNewEmployer(prepProfileData(options, r.toJSON()))
        .then(function (profile) {
          return createOrAmmend.resolve(profile);
        }, function (err) {
          return createOrAmmend.reject(err);
        });
      }

      if (employerType === 3) {
        staffFunctions.addNewManager(prepProfileData(options, r.toJSON()))
        .then(function (profile) {
          return createOrAmmend.resolve(profile);
        }, function (err) {
          return createOrAmmend.reject(err);
        });
      }

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
Staff.prototype.lookUpMyPeople = function lookUpMyPeople (accountType, employerId, employerType) {
  var libr = Q.defer();

  staffFunctions.lookUpPeople({
    account_type : accountType,
    employerId : employerId,
    employerType: employerType
  })
  .then(function (people) {
    return libr.resolve(people);
  }, function (err) {
    return libr.reject(err);
  });

  return libr.promise;
};

/**
 * queries all staff employed by an employer. i.e.
 * queries all staff, manager, distributor accounts below the current signed in user's
 * account level. 
 * @param  {[type]} employerId  [description]
 * @param  {[type]} accountType [description]
 * @param  {[type]} direction [description]
 * @return {[type]}             [description]
 */
Staff.prototype.lookUpWorkForce = function lookUpWorkForce (accountType, employerId, direction) {
  var libr = Q.defer(),
      ac_range = _.range(accountType, 5),
      force = [];

  function __lookUp () {
    var task = ac_range.pop();

    staffFunctions.lookUpPeople({
      account_type : task,
      employerId : employerId
    })
    .then(function (people) {
      force[task] = people;
      if (ac_range.length) {
        __lookUp();
      } else {
        return libr.resolve(force);
      }
      
    }, function (err) {
      return libr.reject(err);
    });

  }

  __lookUp();

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
};


Staff.prototype.cancelActivation = function cancelActivation (activationToken) {
  var act = Q.defer();

  staffFunctions.removePreAccount({
    activationToken : activationToken
  })
  .then(function () {
    return act.resolve(true);
  }, function (err) {
    return act.reject(err);
  });

  return act.promise;
};

/**
 * gets the profile for the userId
 * @param  {ObjectId} userId       userId to query a profile for.
 * @param  {Number} accountType account type or account level for
 * the user id.
 * @return {[type]}              Promise Object
 */
Staff.prototype.getPersonProfile = function getPersonProfile (userId, accountType) {
  console.log('checking employers on staff profile...');
  var d = Q.defer();
  staffUtils.getMeMyModel(accountType).findOne({
    userId: userId
  })
  .populate('drugs', null, 'drug')
  .lean()
  .exec(function (err, user_profile) {
    // console.log('This users profile is here....');
    // console.log(user_profile);
    if (err) {
      return d.reject(err);
    }
    if (user_profile) {
      // if the account is not a distributor account
      if (parseInt(accountType) !== 2 && parseInt(accountType) < 5) {
        //check for a vald employer
        if (!user_profile.employer) {
          return d.reject(new Error ('You do not have an employer on record!'));
        }
        //lets attach the employer profile
        staffUtils.getMeMyModel(2).findOne({
          userId: user_profile.employer.employerId
        })
        .populate('userId', 'email', 'User')
        .exec(function (err, employerIsh) {
          user_profile.employer = employerIsh;

          //if there is a manager account 
          if (user_profile.manager) {
            staffUtils.getMeMyModel(3).findOne({
              userId: user_profile.manager.managerId
            })
            .populate('userId', 'email', 'User')
            .exec(function (err, managerIsh) {
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
    }
  });

  return d.promise;
};

/**
 * tags a staff by adding a local govt name or facility 
 * to the staffs profile. This is useful to query what staff is 
 * responsible for order originating from a specific location 
 * or a specific facility.
 * @param  {[type]} staffId [description]
 * @param  {[type]} tagType [description]
 * @param  {[type]} tag     [description]
 * @return {[type]}         [description]
 */
Staff.prototype.tagStaff = function tagStaff (staffId, tagType, tag) {
  var t = Q.defer();

  //tag type 1 represents lgas
  if (tagType === '1') {
    staffFunctions.addLgaToStaff({
      userId: staffId,
      tag: tag
    })
    .then(function (done) {
      return t.resolve(done);
    }, function (err) {
      return t.reject(err);
    });    
  }


  //tag type 2 represents med fac
  if (tagType === '2') {
    staffFunctions.addFacToStaff({
      userId: staffId,
      tag: tag
    })
    .then(function (done) {
      return t.resolve(done);
    }, function (err) {
      return t.reject(err);
    }); 
  }

  return t.promise;
};

/**
 * untags a staff by removing a local govt name or facility 
 * to the staffs profile. This is useful to query what staff is 
 * responsible for order originating from a specific location 
 * or a specific facility.
 * @param  {[type]} staffId [description]
 * @param  {[type]} tagType [description]
 * @param  {[type]} tag     [description]
 * @return {[type]}         [description]
 */
Staff.prototype.unTagStaff = function unTagStaff (staffId, tagType, tag) {
  var t = Q.defer();

  //tag type 1 represents lgas
  if (tagType === '1') {
    staffFunctions.removeLgaToStaff({
      userId: staffId,
      tag: tag
    })
    .then(function (done) {
      return t.resolve(done);
    }, function (err) {
      return t.reject(err);
    });    
  }


  //tag type 2 represents med fac
  if (tagType === '2') {
    staffFunctions.removeFacToStaff({
      userId: staffId,
      tag: tag
    })
    .then(function (done) {
      return t.resolve(done);
    }, function (err) {
      return t.reject(err);
    }); 
  }

  return t.promise;
};


Staff.prototype.getStateFacility = function getStateFacility (stateId) {
  var gsf = Q.defer();

  staffFunctions.findFacilities({
    userId: stateId
  })
  .then(function (f) {
    return gsf.resolve(f);
  }, function (err) {
    return gsf.reject(err);
  });

  return gsf.promise;
}


module.exports.Staff = Staff;
module.exports.staffFunctions = staffFunctions;

