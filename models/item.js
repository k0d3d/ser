 var Drug = require('./item/drug.js').drug,
    Stock = require('./item/stock-history.js'),
    //drugUpdateHistory = require('./item/drug.js').drugUpdateHistory,
    NDL = require('./item/ndl.js'),
    staffUtils = require('./staff_utils.js'),
    _ = require('underscore'),
    u = require('../lib/utils.js'),
    Q = require('q');

    var drugsFunctions = {
      searchByRegDrugs : function searchByRegDrugs (query, param, filter, option) {
        var s = Q.defer(), modelName = staffUtils.getMeMyModel()

        Drug.find({},
          'itemName sciName category currentPrice pharma supplier'
        )
        //.populate('owner', null, '')
        .regex('itemName', new RegExp(query, 'i'))
        .limit(50)
        .lean()
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
        .limit(50)
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
        drug.supplier = {
          supplierId: doc.owner,
          supplier_type: doc.account_type
        };

        drug.save(function (err, i) {
          if (err) {
            return d.reject(err);
          } else {
            return d.resolve(i);
          }
        });

        return d.promise;        
      },
      createPrimaryStockRecord: function createPrimaryStockRecord (doc) {
        var loot = Q.defer();
        console.log(doc);

        var stock = new Stock(doc.primary);
        // stock.itemId = doc.itemId;
        // stock.originId = doc.userId;
        // stock.originType = doc.accountType;
        // stock.amount = doc.amount;
        stock.save(function (err, i) {
          if (err) {
            return loot.reject(err);
          }
          if (i) {
            return loot.resolve(doc);
          }
        });

        return loot.promise;
      },
      createSecondaryStockRecord: function createSecondaryStockRecord (doc) {
        var loot = Q.defer();

        var stock = new Stock(doc.secondary);

        stock.save(function (err, i) {
          if (err) {
            return loot.reject(err);
          }
          if (i) {
            return loot.resolve(doc);
          }
        });

        return loot.promise;
      },
      getUserStockUp: function getUserStockUp (doc) {
        var loot = Q.defer();

        console.log('stockup');

        Stock.find({
          recordType: 'primary',
          visible: 1,
          itemId: doc.itemId,
          destId: doc.userId,
          destType: doc.accountType,
          amount: { $gt: 0}
        })
        .populate('itemId', 'itemName', 'drug')
        .exec(function (err, i) {
          if (err) {
            return loot.reject(err);
          }
          if (i) {
            return loot.resolve(i);
          }
        });

        return loot.promise;
      },
      getUserStockDown: function getUserStockDown (doc) {
        var loot = Q.defer();

        console.log('stockdown');

        Stock.find({
          recordType: 'primary',
          visible: 1,
          itemId: doc.itemId,
          originId: doc.userId,
          originType: doc.accountType,
          amount: {$lt: 0}
        })
        .populate('itemId', 'itemName', 'drug')
        .exec(function (err, i) {
          if (err) {
            return loot.reject(err);
          }
          if (i) {
            return loot.resolve(i);
          }
        });

        return loot.promise;        
      },
      getUserStockUpRequest: function getUserStockUpRequest (doc) {
        var loot = Q.defer();

        console.log('stockdown request..');

        Stock.find({
          recordType: 'secondary',
          visible: 1,
          //itemId: doc.itemId,
          destId: doc.userId,
          destType: doc.accountType,
          amount: {$lt: 0}
        })
        .populate('itemId', 'itemName', 'drug')
        .exec(function (err, i) {
          if (err) {
            return loot.reject(err);
          }
          if (i) {
            return loot.resolve(i);
          }
        });

        return loot.promise;        
      },
      getUserStockDownRequest: function getUserStockDownRequest (doc) {
        var loot = Q.defer();

        console.log('stockup');

        Stock.find({
          recordType: 'secondary',
          visible: 1,
          //itemId: doc.itemId,
          originId: doc.userId,
          originType: doc.accountType,
          amount: { $gt: 0}
        })
        .populate('itemId', 'itemName', 'drug')
        .exec(function (err, i) {
          if (err) {
            return loot.reject(err);
          }
          if (i) {
            return loot.resolve(i);
          }
        });

        return loot.promise;
      }      
    };

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
    console.log(found_drugs);
    var populate = Q.defer();

    function __recurseOwner () {
      var oneDrug = found_drugs.pop();
      console.log(oneDrug);
      var accountType = oneDrug.supplier.supplier_type;
      var Model = staffUtils.getMeMyModel(oneDrug.supplier.supplier_type);

      Model.findOne({
        userId: oneDrug.supplier.supplierId
      }, 'name coverage userId')
      .lean()
      .exec(function (err, i) {
        if (err) {
          return populate.reject(err);
        }
        if (!i) {
          return populate.reject(new Error('cannot find owner profile'))
        }

        oneDrug.owner = i;
        oneDrug.owner.account_type = accountType;
        s.drug.push(oneDrug);

        if (found_drugs.length) {
          __recurseOwner();
        } else {
          return populate.resolve();
        }
        ;
      });        
    }

    if (found_drugs.length === 0) {
      return populate.resolve({})
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
    console.log(err.stack);
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

DrugController.prototype.fetchAllMyDrugs = function (options, userId, accountType) {
  var d = Q.defer();
  //if you are not a distributor,
  //lets your employers id
  if (accountType > 2) {
    staffUtils.getMeMyModel(accountType)
    .findOne({
      userId: userId
    })
    .exec(function (err, user_profile) {
      if (err) {
        return d.reject(err);
      }
      console.log(user_profile);

      var employerId = user_profile.employer.employerId;

      Drug.find({'supplier.supplierId': employerId})
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

    });

  } else {
      Drug.find({'supplier.supplierId': userId})
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
  }


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
/**
 * a stoc transaction is a pair of stock operation 
 * records.i.e. a parent and child operation. A parent operation
 * is recorded with the userId of the currently logged in user
 * as the origin. a child operation is a record of a stock operation 
 * with the userId of the user receiving the stock as the origin.
 * 
 * @param  {[type]} doc [description]
 * @return {[type]}     [description]
 */
DrugController.prototype.createStockTransaction = function createStockTransaction (itemId, userId, accountType, body, action) {
  var op = Q.defer(), transactionId = u.uid(16);

  var primary_doc = {
    itemId: itemId,
    referenceId: body.referenceId,
    transactionId: transactionId
  };


  console.log('mesage');
  //stock up
  if (action) {
    //here the form sends the Id and account type 
    //of the user who is approving his stock to be
    //given to 'destId'.  th quanitity requested is
    //being debitted from him
    if (body.staff) {
      primary_doc.originId = body.staff.userId._id || body.staff.userId;
      primary_doc.originType = body.staff.userId.account_type || 2;    
    }

    //here the currently logged in user
    //becomes the destination for a 
    //stock up request. because the quantity
    //requested is being credited to him
    primary_doc.destId = userId;
    primary_doc.destType = accountType;

    //amount here is a positive int. being that this is 
    //a primary record and a stockup operation for destId.
    //i.e. dest is adding to his stock from origin
    primary_doc.amount = parseInt(body.amount);    


  } else {
    //if this is a stockdown request

    
    //here the currently logged in user is
    //giving out stock, being debitted.       
    primary_doc.originId = userId;
    primary_doc.originType = accountType;    
    

    //the form sends the id of the employee 
    //receiving stock from the currently 
    //logged in user.
    if (body.staff) {
      primary_doc.destId = body.staff.userId._id;
      primary_doc.destType = body.staff.userId.account_type;    
    } else {
      op.reject(new Error('invalid request'));
    }

    //amount here is a negative int. being that this is 
    //a primary record and a stockdown operation for originId.
    //i.e. origin is giving his stock to dest
    primary_doc.amount = parseInt('-' + body.amount); 
     
  }  

  

  primary_doc.statusLog = [{
      code: 0
    }];
  primary_doc.status = 0;
  primary_doc.recordType =  'primary';
  
  //---end of primary processing---//


  var secondary_doc = {
    itemId: itemId,
    referenceId: body.referenceId,
    transactionId: transactionId
  };


  //stock up
  if (action) {
    //here we keep a record of the currently
    //logged in user, giving out stock to 
    //an employee. 

    secondary_doc.originId = userId;
    secondary_doc.originType = accountType;    
    


    //Now this operation can exist 
    //in a scenerio where the currently logged in 
    //user is a distributor and is adding stock
    //from outside stocCloud logic. So the staff 
    //object might be empty.     
    if (body.staff) {
      secondary_doc.destId = body.staff.userId._id || body.staff.userId;
      secondary_doc.destType = body.staff.userId.account_type || 2;       
    }
   

    //amount here is a negative int. being that this is 
    //a secondary record and a stockup operation for userId.
    //i.e. userId is adding to his stock from destId
    secondary_doc.amount = parseInt('-' + body.amount);


  } else {
    //if this is a stockdown request

    
    //here the form should send the user
    //who will be credited with the stock     
    if (body.staff) {
      secondary_doc.originId = body.staff.userId._id;
      secondary_doc.originType = body.staff.userId.account_type;    
    } else {
      op.reject(new Error('invalid request'));
    } 
    


    //the currently logged in user is 
    //being debitted for the record
    //
    secondary_doc.destId = userId;
    secondary_doc.destType = accountType;    
    

    //amount here is a negative int. being that this is 
    //a primary record and a stockdown operation for originId.
    //i.e. origin is giving his stock to dest
    secondary_doc.amount = parseInt(body.amount); 
     
  }


  secondary_doc.statusLog = [{
      code: 0
    }];
  secondary_doc.status = 0;
  secondary_doc.recordType =  'secondary';
  


  //transaction pair
  var doc = {
    primary: primary_doc,
    secondary: secondary_doc
  };


  drugsFunctions.createPrimaryStockRecord(doc)
  .then(drugsFunctions.createSecondaryStockRecord)
  .then(function (done) {
    return op.resolve(done);
  })
  .catch(function (err) {
    console.log(err);
    return op.reject(err);
  });

  return op.promise;

};

DrugController.prototype.approveRequest = function (request) {
  var loot = Q.defer();

  //find transaction
  drugsFunctions.findStockTransaction(request.transactionId)
  .then(function (trans) {
    //validate request
  })
  .then(function (ans) {
    //execute request
  })
  .then(function (done) {
    //send response
  })
  .catch(function (err) {

  });
  
  //execute request
  //send response

  return loot.promise;
};

/**
 * queries the records of stock operations. 
 * @param  {[type]} itemId      [description]
 * @param  {[type]} userId      [description]
 * @param  {[type]} accountType [description]
 * @param  {[type]} action      [description]
 * @return {[type]}             [description]
 */
DrugController.prototype.stockLog = function (itemId, userId, accountType, action) {
  var loot = Q.defer();

  var doc = {
    itemId: itemId,
    userId: userId,
    accountType: accountType
  };

  if (action === 'stockUp') {
    drugsFunctions.getUserStockUp(doc)
    .then(function (done) {
      return loot.resolve(done);
    });
  }

  if (action === 'stockDown') {
    drugsFunctions.getUserStockDown(doc)
    .then(function (done) {
      return loot.resolve(done);
    });
  }



  return loot.promise;
};

DrugController.prototype.stockRequest = function stockRequest (userId, accountType, action) {
  var loot = Q.defer();

  var doc = {
    userId: userId,
    accountType: accountType
  };

  if (action === 'stockUp') {
    drugsFunctions.getUserStockUpRequest(doc)
    .then(function (done) {
      return loot.resolve(done);
    });
  }

  if (action === 'stockDown') {
    drugsFunctions.getUserStockDownRequest(doc)
    .then(function (done) {
      return loot.resolve(done);
    });
  }



  return loot.promise;  
};


module.exports.Drug = DrugController;
module.exports.NDL = NDL;
