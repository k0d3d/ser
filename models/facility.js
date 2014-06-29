/*jslint white: false */
/**
 * Module Dependencies
 */
var util = require('util'),
    User = require('./user/user.js'),
    Govt = require('./item/govt-facility.js'),
    _ = require('lodash'),
    Q = require('q'),
    staffUtils = require('./staff_utils'),
    Hospital = require('./organization/hospital.js');


var facManager = {
  findFacByName: function findFacByName (doc) {
    var q = Q.defer();

    Govt.find(doc.options)
    .regex('facilityName',new RegExp(doc.query.name, 'i'))
    .skip(doc.query.page || 0)
    .limit(doc.query.limit || 50)
    .execQ()
    .then(function (i) {
      return q.resolve(i);
    })
    .fail(function (err) {
      if (err) {
        return q.reject(err);
      }        

    })
    .done();

    return q.promise;
  }
};



function MedFac (){

}

MedFac.prototype.constructor = MedFac;

MedFac.prototype.list = function(page, callback){
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
};

MedFac.prototype.create = function (o, callback) {
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
MedFac.prototype.delete = function(h_id, u_id, callback){
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
      });
    }
  });
};

MedFac.prototype.fetchOne = function (userId, cb) {
  Hospital.findOne({user: userId})
  .exec(function (err, i) {
    if (err || _.isEmpty(i)) {
      cb(new Error('We can not seem to find this facility information'));
    } else {
      cb(i);
    }
  });
};
/**
 * finds all medical facilities that match the criteria 
 * queried. The currently logged in user's coverage is the 
 * primary compulsory filter for any query. This method also
 * accepts an address array supplied in query.address
 * @param  {[type]} userId      userId of the user making the query
 * @param  {[type]} accountType account type for the user making the 
 * query
 * @param  {[type]} query       Object containing the query
 * parameters. {name, page, limit[, address]}
 * @return {[type]}             Promise
 */
MedFac.prototype.searchGovtRegister = function searchGovtRegister (userId, accountType, query) {
  var t = Q.defer(), options = null, rslt = {};

  // if (query.state) {
  //   
  // } else {
    staffUtils.getMeMyModel(accountType)
    .findOne({
      userId: userId
    }, 'coverage')   
    .execQ()
    .then(function (user) {
      //if we have a coverage area without 
      //a query state, 
      if (user.coverage && !query.state) {
        options = {
          lga: {
            '$in': _.invoke(query.address || user.coverage, function () {
              var str = new RegExp(this, 'gi');
              return str;
            }) 
          }
        };
      }
      // if we have a state property
      // in our query, we use it
      if (query.state) {
        options = {stateCode: query.state};
      }
      // no query state or coverage...
      // lets return based on query.name
      if (!query.state && !user.coverage) {
        options = {};
      }
   
      return facManager.findFacByName({query: query, options: options});
      // .then(function )
      // Govt.find(options)
      // .regex('facilityName',new RegExp(query.name, 'i'))
      // .skip(query.page || 0)
      // .limit(query.limit || 50)
      // .execQ()
      // .then(function (i) {
      //   return t.resolve(i);
      // })
      // .fail(function (err) {
      //   if (err) {
      //     return t.reject(err);
      //   }        

      // })
      // .done();

    })
    .then(function (ob) {
      rslt.noGeo = ob;

      //lets add the query for 
      //geo Tagged facilities
      if (query.geo) {
        options.geo = {
          '$near': [query.geo.lng, query.geo.lat]
        };
      }   

      return facManager.findFacByName({query: query, options: options});


    })
    .then(function (ob) {
      rslt.geo = ob;
      //filter out geo results
      //from none geo results
      // return t.resolve({

      //   noGeo: _.filter(ob, function (o) {
      //       // return _.isUndefined(o.geo);
      //       return o.geo.length === 0;
      //   }),
      //   geo: _.filter(ob, function (o) {
      //       return o.geo.length > 0;

      //   })

      // });
      return t.resolve(rslt);
    })
    .catch(function (err) {
      if (err) {
        return t.reject(err);
      }
    })
    .done();
    

  return t.promise;
};

MedFac.prototype.validateFacility = function validateFacility (userId, accountType, valData) {
  var t = Q.defer();
  console.log(userId);
  if (accountType !== 5) {
    t.reject(new Error('can not complete request'));
  } else {
    Hospital.update({
      userId: userId
    },{
      $set:{ 
        validation: _.omit(valData, ['_id', '__v']),
        isValidated: true,
        lga_ward: valData.lga_ward,
        lga: valData.lga,
        name: valData.facilityName
      }
    },{upsert: true}, function (err, i) {
      console.log(i);
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

/**
 * Adds a geo coordinate to a medical facitity record.
 * 
 * @param  {[type]} id  Object Id of Medical Facility 
 * @param  {[type]} lat latitude
 * @param  {[type]} lng longitude
 * @return {[type]}     [description]
 */
MedFac.prototype.saveGeoLocation = function saveGeoLocation (id, lat, lng) {
  var sgl = Q.defer();

  Govt.update({
    _id: id
  }, {
    $push: {
      geo: {
        lng: lng,
        lat: lat
      }
    }
  }, function (err, ar) {
    if (err) {
      return sgl.reject(err);
    }
    return sgl.resolve(ar);
  });
  return sgl.promise;
};

module.exports = MedFac;
