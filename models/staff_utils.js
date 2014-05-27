var Staff = require('./organization/staff.js'),
    Distributor = require('./organization/distributor.js'),
    Manager = require('./organization/manager.js'),
    Hospital = require('./organization/hospital.js'),
    PharmaComp = require('./organization/pharmacomp.js'),
    _ = require('underscore'),
    sysUtils = require('../lib/utils.js'),
    Q = require('q');

module.exports = {
    /**
     * fetches the model to be queried using the related account level / type.
     * @param  {[type]} account_type [description]
     * @return {[type]}              [description]
     */
    getMeMyModel : function getMeMyModel (account_type) {
      account_type = parseInt(account_type);

      if (!account_type) {
        throw new Error('account type can not be empty');
      }

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
      if (account_type === 5) {
        return Hospital;
      }

      return Manager;

    },
    /**
     * fetches the employees under a manager or a distributor.
     * if the userId has an account type 
     * @param  {objectId} userId     userId of the user being queried
     * @param  {[type]} accountType [description]
     * @return {[type]}             [description]
     */
    getMyPeople : function getMyPeople(userId, accountType) {
      console.log('getMyPeople', arguments);
      var book = Q.defer(), people = {};


      // private function to find managers. return a promise
      function __findMyManagers (uid) {
        console.log('find my manager');
        var distSearch = Q.defer();

        //Check for managers 
        Manager.find({
          'employer.employerId' : uid
        })
        .populate('userId', 'email account_type allowedNotifications approvedNotices', 'User')
        .exec(function (err, managedManagers) {
          if (err) {
            return distSearch.reject(err);
          }
          if (managedManagers) {
            return distSearch.resolve(managedManagers);
          }
        });

        return distSearch.promise;
      }

      //first of all, lets deny any other account (staff, hospital, pharma) from 
      //getting employees
      if (parseInt(accountType) > 3) {
        book.resolve([]);
        return book.promise;
      }

      //if its a manager account , 3.
      //since staffs are the only employees below
      //managers.. lets just use the staff model
      if (parseInt(accountType) === 3) {
        Staff.find({
          'manager.managerId' : userId
        })
        .populate('userId', 'email account_type allowedNotifications approvedNotices', 'User')
        .exec(function (err, managedStaff) {
          if (err) {
            return book.reject(err);
          }
          if (managedStaff) {
            people.staff = managedStaff || {};
            return book.resolve(people);
          }
        });
      }

      //if its a distributor account, 2
      //we have to look for both staffs and managers 
      //under the distributor.
      if (parseInt(accountType) === 2) {
        __findMyManagers(userId)
        .then(function (myManagers) {
          people.managers = myManagers || {};
          //find the staff employed by a distributor
          Staff.find({
            'employer.employerId' : userId
          })
          .populate('userId', 'email account_type allowedNotifications approvedNotices', 'User')
          .exec(function (err, managedStaff) {
            if (err) {
              return book.reject(err);
            }
            if (managedStaff) {
              people.staff = managedStaff || {};
              return book.resolve(people);
            }
          });          
        });
      }

      return book.promise;
    },
    /**
     * this replaces the field(fieldToPop) on each member / property of 
     * the doc Object with the actual collection / row .
     * 
     * @param  {Object} doc        the document / object / array containing objects
     * which have a property to be populated.
     * @param  {String} fieldToPop the field on doc to be populated
     * @param  {Number | String} accountType the account level or account type to be
     * populated. If accountType is a number, its used directly as an argument for 
     * self.getMeMyModel(). If it is a string, it assumes accountType is a field
     * in doc.
     * @return {Object}            Promise Object
     */
    populateProfile: function populateProfile (doc, fieldToPop, accountType) {
      console.log('Populating...');
      var pop = Q.defer(), poppedObject = [], at;
      var self = this;

      function __pop() {
        var task = doc.pop();
        // task = task.toObject();

        if (_.isNumber(accountType)) {
          at = accountType;
        }
        if (_.isString(accountType)) {
          at = task[accountType];
        }

        self.getMeMyModel(at)
        .findOne({
          userId: task[fieldToPop]
        }, 'name userId')
        .exec(function (err, i) {
          if (err) {
            return pop.reject(err);
          }

          task[fieldToPop] = i;
          poppedObject.push(task);
          
          if (doc.length) {
            __pop();
          } else {
            return pop.resolve(poppedObject);
          }
        });
      }

      if (doc.length === 0 ) {
        pop.resolve(doc);
      } else {
        __pop();
      }


      return pop.promise;
    }
};

