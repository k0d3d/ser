/*jslint white: false */
/**
 * Module Dependencies
 */
var util = require('util'),
    User = require('../models/user/user.js'),
    Govt = require('../models/item/govt-facility.js'),
    _ = require('lodash'),
    Q = require('q'),
    Hospital = require('../models/organization/hospital.js');

function HospitalController (){

}

HospitalController.prototype.constructor = HospitalController;

HospitalController.prototype.list = function(page, callback){
  Hospital
    .find({})
    .limit(10)
    .skip(page * 10)
    .exec(function(err, i){
      if(err){
        callback(err);
      }else{
        callback(i);
      }
    });
}

HospitalController.prototype.create = function (o, callback) {
  var user = new User({
      name: o.name,
      email: o.email,
      password: (_.isUndefined(o.password)) ? Math.random().toString(36).slice(-8) : o.password,
      username: o.email
    });

  var hospital = new Hospital(o);

  hospital.user = user._id;
  hospital.save(function (err) {
    if (err) {
      callback(err);
    } else {
      user.save(function (err, i) {
        if (err) {
          callback(err);
        } else {
          callback(i);
        }
      });
    }
  });
};

/**
 * [delete Totally removes a hospital record including the user account
 * associated with it]
 * @param  {[type]}   h_id     [description]
 * @param  {[type]}   u_id     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
HospitalController.prototype.delete = function(h_id, u_id, callback){
  Hospital.remove({_id: h_id}, function(err, i){
    if(err){
      callback(err);
    } else {
      User.remove({_id: u_id}, function(err, i){
        if(err){
          callback(err);
        } else {
          callback(i);
        }
      })
    }
  });
};

HospitalController.prototype.fetchOne = function (userId, cb) {
  Hospital.findOne({user: userId})
  .exec(function (err, i) {
    if (err || _.isEmpty(i)) {
      cb(new Error('We can not seem to find this facility information'));
    } else {
      cb(i);
    }
  });
};

HospitalController.prototype.searchGovtRegister = function searchGovtRegister (query) {
  var t = Q.defer();

  Govt.find({
    stateCode: query.state
  })
  .regex('facilityName',new RegExp(query.name, 'i'))
  .exec(function (err, i) {
    if (err) {
      return t.reject(err);
    }
    return t.resolve(i);
  });

  return t.promise;
};

HospitalController.prototype.validateFacility = function validateFacility (userId, accountType, valData) {
  var t = Q.defer();
  if (accountType !== 5) {
    t.reject(new Error('can not complete request'));
  } else {
    Hospital.update({
      userId: userId
    },{
      $set:{ 
        validation: _.omit(valData, ['_id', '__v']),
        isValidated: true
      }
    }, function (err, i) {
      if (err) {
        return t.reject(err);
      }
      if (i) {
        return t.resolve(valData);
      } else {
        return t.reject(new Error('validation operation failed'));
      }
    });

  }

  return t.promise;
};

module.exports.hospital = HospitalController;
var hospital = new HospitalController();

module.exports.routes = function (app, login) {
  
  //Load the hospital index / list page
  app.route('/a/facilities')
  .get(login.ensureLoggedIn('/signin'), function (req, res) {
    res.render('index', {});
  });

  //loads page to add a new hospital account
  app.route('/a/facilities/add')
  .get(login.ensureLoggedIn('/signin'), function (req, res) {
    res.render('index', {});
  });

  //loads page to add a new hospital account\
  app.route('/a/facilities/:facilityId')
  .get(login.ensureLoggedIn('/signin'), function (req, res) {
    res.render('index', {});
  });

  //fetches list of registered facilities
  app.route('/api/facilities/pages/:page')
  .get(login.ensureLoggedIn('/signin'), function (req, res, next) {
    hospital.list(req.params.page, function (r) {
      if (util.isError(r)) {
        next(r);
      } else {
        res.json(200, r);
      }      
    });
  });

  app.route('/api/internal/facilities/search')
  .get(function (req, res) {
    hospital.searchGovtRegister(req.query)
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      res.json(400, err.message);
    });
  });

  app.route('/api/facilities/:facilityId')
  .get(function (req, res, next) {
    hospital.fetchOne(req.params.facilityId, function (r) {
      if (util.isError(r)) {
        next(r);
      } else {
        res.json(200, r);
      }
    });
  });

  //Creates a new hospital
  app.route('/api/facilities')
  .post(function (req, res, next) {
    hospital.create(req.body, function (r) {
      if (util.isError(r)) {
        next(r);
      } else {
        res.json(200, true);
      }
    });
  });

  app.post('/api/internal/facilities/validate', function (req, res) {
    var userId = req.user._id;
    var accountType = req.user.account_type;
    hospital.validateFacility(userId, accountType, req.body)
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      res.json(400, err.message);
    });
  });

  //Remove hospital record and user
  app.route('/api/facilities/:facilityId')
  .delete(function(req, res, next){
    hospital.delete(req.params.facilityId, req.params.userid, function(r){
      if (util.isError(r)) {
        next(r);
      } else {
        res.json(200, true);
      }
    });
  });

  
}