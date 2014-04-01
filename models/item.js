 var Drug = require('./item/drug.js').drug,
    //drugUpdateHistory = require('./item/drug.js').drugUpdateHistory,
    NDL = require('./item/ndl.js'),
    staffUtils = require('./staff_utils.js'),
    _ = require('underscore'),
    Q = require('q');

    var drugsFunctions = {
      searchByRegDrugs : function searchByRegDrugs (query, param, filter, option) {
        var s = Q.defer(), modelName = staffUtils.getMeMyModel()

        Drug.find({},
          'itemName sciName category currentPrice pharma owner'
        )
        //.populate('owner', null, '')
        .regex('itemName', new RegExp(query, 'i'))
        .limit(10)
        .lean()
        //.skip(page * 10)
        .exec(function(err, i){
          console.log(err, i);
          if(err){
            return s.reject(err);
          } else {
            return s.resolve(i);
          }
        });

        return s.promise;
      },
      searchByNDL : function searchByNDL (query, param, filter, option) {
        var s = Q.defer();
        
        if (param === 'sciName') {
          param = 'composition';
        }

        if (param === 'itemName') {
          param = 'productName';
        }

        NDL.find({},
          'productName composition man_imp_supp'
        )
        .regex(param, new RegExp(query, 'i'))
        .limit(10)
        //.skip(page * 10)
        .exec(function(err, i){
          if(err){
            return s.reject(err);
          } else {
            return s.resolve(i);
          }
        });

        return s.promise;
      },
      /**
       * adds a drug item, expect an object containing
       * the item properties, the user adding the item,
       * the account level of the user. It returns a promise
       * @param {Object} doc object containing item props and user info
       */
      addDrug : function addDrug (doc) {
        var d = Q.defer();
        var drug = new Drug(doc.item);
        drug.owner = {
          owner: doc.owner,
          account_type: doc.account_type
        };
        drug.save(function (err, i) {
          if (err) {
            return d.reject(err);
          } else {
            return d.resolve(i);
          }
        });

        return d.promise;        
      }
    }

function DrugController (){

}

DrugController.prototype.constructor = DrugController;

/**
 * [searchCategory Searches list by drug category]
 * @param  {[type]}   string   [description]
 * @param  {[type]}   page   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
DrugController.prototype.search = function(query, param, filter, option) {
  var searcher = Q.defer();

  var s = {
    drug : [],
    ndl: null
  };

  drugsFunctions.searchByRegDrugs(query, param, filter, option)
  .then(function (found_drugs) {
    var populate = Q.defer();

    function __recurseOwner () {
      var oneDrug = found_drugs.pop();
      var Model = staffUtils.getMeMyModel(oneDrug.owner.account_type);

      Model.findOne({
        userId: oneDrug.owner.owner
      }, 'name coverage')
      .exec(function (err, i) {
        if (err) {
          return populate.reject(err);
        }
        if (!i) {
          return populate.reject(new Error('cannot find owner profile'))
        }

        oneDrug.owner = i;
        s.drug.push(oneDrug);

        if (found_drugs.lenght) {
          __recurseOwner();
        } else {
          return populate.resolve();
        }
        ;
      });        
    }

    __recurseOwner();

    return populate.promise;

  })
  .then(function (r) {

    drugsFunctions.searchByNDL(query, param, filter, option)
    .then(function (r) {
      s.ndl = r;

      return searcher.resolve(s);
    }, function (err) {
      return searcher.reject(err);
    });

  })
  .catch(function (err) {
    return searcher.reject(err);
  });


  return searcher.promise;
};

/**
 * adds a health / medical item to the database
 * @param {Object} item         an object containing name, desciption,
 * item form, packaging, images ,...etc 
 * @param {ObjectId} owner        the objectId of the user uploading
 * adding this drug item
 * @param {Number} account_type the account type of the user.
 * only levels 0 - 2 are allowed
 */
DrugController.prototype.addDrug = function (item, owner, account_type) {
  var d = Q.defer();

  if (account_type > 2) {
    d.reject(new Error('operation not permitted'));
    return d.promise;
  };

  var doc = {
    item: item,
    owner: owner,
    account_type: account_type
  };

  drugsFunctions.addDrug(doc)
  .then(function (done) {
    return d.resolve(done);
  }, function (err) {
    return d.reject(err);
  });

  return d.promise;
};

DrugController.prototype.summary = function (id, callback) {
  Drug.findOne({ _id : id})
  .exec(function (err, i) {
    if(err){
      callback(err);
    } else {
      callback(i);
    }    
  });
};

DrugController.prototype.priceUpdate = function (id, price, callback){
  Drug.update({ _id : id},{
      currentPrice: price,
      lastUpdated: Date.now()
  },
    function(err, i){
      if(err){
        callback(err);
      } else {
        duhhuhhuh();
      }
    }
  );

  function duhhuhhuh () {
    var duh = new DUH();
    duh.product_id = id;
    duh.price = price;
    duh.save(function(err, i){
      if(err){
        callback(err);
      } else {
        callback(i);
      }     
    });
  }
};

/**
 * updates an item collection with values
 * sent from the browser. This is used primarily
 * with the inline editing feature. It should update
 * one item per request.
 * @param  {ObjectId} id   the item ObjectId
 * @param  {Object} body  contains property
 * @return {Object}      Promise object
 */
DrugController.prototype.updateItem = function (id, body){
  var b = {}, updater = Q.defer();

  b[body.name] = body.value;
  console.log(b);
  Drug.update({ _id : id},{
    $set : b
  },
    function(err, i){
      console.log(err, i);
      if(err){
        return updater.reject(err);
      } 
      if (i > 0) {
        return updater.resolve(i);
      } else {
        return updater.reject(new Error('item update failed'));
      }
    }
  );

  return updater.promise;
};

DrugController.prototype.checkUpdate = function(since, cb){
  
  DUH.find()
  .gt('lastUpdated', since)
  .populate('product_id', 'productName composition man_imp_supp regNo')
  .exec(function(err, i){
    if(err) return cb(err);
    cb(i);
  });
}

DrugController.prototype.fetchAllMyDrugs = function (options, owner) {
  var d = Q.defer();
  Drug.find({"owner.owner": owner})
  //.sort()
  .limit(options.limit)
  .skip(options.limit * options.page)
  .lean()
  .exec(function (err, i) {
    if (err) {
      return d.reject(err);
    } else {
      return d.resolve(i);
    }
  });

  return d.promise;
};

DrugController.prototype.fetchOneById = function (id) {
  var d = Q.defer();

  Drug.findOne({
    _id : id
  })
  .lean()
  .exec(function (err, i) {
    if (err) {
      return d.reject(err);
    } else {
      return d.resolve(i);
    }
  });

  return d.promise;
};

module.exports.Drug = DrugController;
module.exports.NDL = NDL;
