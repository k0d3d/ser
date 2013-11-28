/*jslint white: false */
/**
 * Module Dependencies
 */
var mongoose = require("mongoose"),
    util = require('util'),
    User = mongoose.model('User'),
    _ = require('underscore'),
    Hospital = mongoose.model('Hospital');

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
  })
}

module.exports.hospital = HospitalController;
var hospital = new HospitalController();

module.exports.routes = function (app) {
  
  //Load the hospital index / list page
  app.get('/hospital', function (req, res) {
    res.render('index', {});
  });

  //loads page to add a new hospital account\
  app.get('/hospital/add', function (req, res) {
    res.render('index', {});
  });

  //fetches list of registered hospitals
  app.get('/api/hospital/:page', function (req, res, next) {
    hospital.list(req.params.page, function (r) {
      if (util.isError(r)) {
        next(r);
      } else {
        res.json(200, r);
      }      
    });
  });

  //Creates a new hospital
  app.post('/api/hospital', function (req, res, next) {
    hospital.create(req.body, function (r) {
      if (util.isError(r)) {
        next(r);
      } else {
        res.json(200, true);
      }
    });
  });

  //Remove hospital record and user
  app.del('/api/hospital/:hos_id/user/:userid', function(req, res, next){
    hospital.delete(req.params.hos_id, req.params.userid, function(r){
      if (util.isError(r)) {
        next(r);
      } else {
        res.json(200, true);
      }
    });
  });

  
}