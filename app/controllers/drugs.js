
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Order = mongoose.model('Order'),
    OrderStatus = mongoose.model('OrderStatus'),
    Supplier = mongoose.model('Supplier'),
    _ = require("underscore"),
    Drug = mongoose.model('drug'),
    NDL = mongoose.model('nafdacdrug'),
    DUH = mongoose.model('drugUpdateHistory'),
    Q = require('q'),
    login = require('connect-ensure-login'),
    utils = require("util");


    var drugsFunctions = {
      searchByRegDrugs : function searchByRegDrugs (query, param, filter, option) {
        var s = Q.defer();

        Drug.find({},
          'itemName sciName category currentPrice pharma owner'
        )
        .regex('itemName', new RegExp(query, 'i'))
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
    drug : null,
    ndl: null
  };

  drugsFunctions.searchByRegDrugs(query, param, filter, option)
  .then(function (r) {
    s.drug = r;

    drugsFunctions.searchByNDL(query, param, filter, option)
    .then(function (r) {
      s.ndl = r;

      return searcher.resolve(s);
    }, function (err) {
      return searcher.reject(err);
    });
  }, function (err) {
    return searcher.reject(err);
  });


  return searcher.promise;
};

DrugController.prototype.addDrug = function (item, owner) {
  var d = Q.defer();
  var drug = new Drug(item);
  drug.owner = owner;
  drug.save(function (err, i) {
    if (err) {
      return d.reject(err);
    } else {
      return d.resolve(i);
    }
  });

  return d.promise;
}

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
  Drug.find({owner: owner})
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

module.exports.drug = DrugController;
var drugs = new DrugController();

module.exports.routes = function(app, auth) {

  app.get('/a/drugs', login.ensureLoggedIn(), function(req, res){
    res.render('index', {
      userData : req.user
    });
  });
  //Shows the new / add drug page
  app.get('/a/drugs/add-new', login.ensureLoggedIn(), function(req, res){
    res.render('index', {
      userData : req.user
    });
  });

  app.get('/medeqp', login.ensureLoggedIn(), function(req, res){
    res.render('index');
  });

  //Displays one item page
  app.get('/a/drugs/:drugId/item', function (req, res, next) {
    drugs.fetchOneById(req.params.drugId)
    .then(function (r) {

      res.render('drug/one-item', {
        item: r
      });

    }, function (err) {
      next(err);
    });    
  });

  //Search for nafdac reg drugs by category
  app.get('/api/internal/item/search', function (req, res, next) {
    drugs.search(req.query.s, req.query.param, req.query.filter, {})
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      next(err);
    });
  });
  //Fetch Drug Item Summary
  app.get('/api/drugs/:drugId/view/summary', function(req, res, next){
    drugs.summary(req.params.drugId, function(r){
      if(utils.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  app.get('/api/drugs/updates/:since', function(req, res, next){
    var d = new Date(req.params.since);
    drugs.checkUpdate(d, function(r){
      if(utils.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  app.get('/api/drugs', function (req, res, next) {
    drugs.fetchAllMyDrugs({
      page: req.query.page || 0,
      limit: req.query.limit || 10
    }, req.user._id)
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      next(err);
    });
  });

  app.post('/api/drugs', function (req, res, next) {
    var item = req.body;
    var owner = req.user._id;
    drugs.addDrug(item, owner)
    .then(function (r) {
      res.json(200, true);
    }, function (err) {
      next(err);
    });
  });



  //run typeahead
  app.get('/api/internal/items/typeahead', function (req, res, next) {
    NDL.autocomplete(req.query.query, function (err, list) {
      if (err) {
        next(err);
      } else {
        res.json(200, list);
      }
    });

  });

  //get item form, category or packaging
  app.get('/api/internal/items/props', function (req, res) {

    var props = {};
      //List of Item forms 

    props.itemForm = [
      'Tablets',
      'Capsules',
      'Vials',
      'Caplets',
      'Amples',
      'Emugels',
      'Gels',
      'Ointments',
      'Suspensions',
      'Syrup',
      'Powder',
      'Cream',
      'Lotion',
      'Drops',
      'Sprays',
      'Suppositories',
      'Solutions',
      'Sheet'
    ].sort();

    //List of Item Packaging
    props.itemPackaging = [
      'Tin',
      'Carton',
      'Sachet',
      'Roll',
      'Pieces',
      'Packet',
      'Gallon',
      'Bottles',
      'Bags',
      'Box',
      'Tube'
    ].sort();


    props.category = [
      'Anasthetics', 
      'Analgesics,Anti Inflammatory & Anti Pyretics', 
      'Animal Vaccine Products', 
      'Anti Acids & Ulcer Healer Drugs', 
      'Anti Diabetics ', 
      'Anti  Asthmatics', 
      'Anti Bacterial Agents & Anti Protozal agents', 
      'Anti Biotics', 
      'Anti Caner', 
      'Anti Diarrhoea Drugs & Laxatives', 
      'Antiemetics & Antispasmodic', 
      'Anti Fungals', 
      'Anti Hemorroid Preparations', 
      'Anti Helminitics', 
      'Anti Histamines', 'Anti Malrials', 'Anti Migraine Drugs', 'Anti Muscarinic', 'Anti Neoplastic & Immunomodulating Agents', 'Anti Psychotic', 'Antiseptics,Disinfectants & Mouthwashes', 'Anti tussive,Expectorants & Mucolytics', 'Antiviral', 'Cardiovascular System', 'Contraceptives', 'Dermatological Preparations', 'Parkinson Drugs', 'Eye,Ear & Throat Preparations', 'Haematinics', 'Herbal Products', 'Hormones,Synthetics,Substitutes & Thyroid Drugs', 'Human Biologicals', 'Human Vaccine Products', 'Hypnotics,Anxiolities,Anti Convulsants & Anti depressant', 'Insecticides', 'Oxytocics', 'Pesticide Products', 'Rubefacients', 'Skeletal Muscle Relaxants', 'Vaccines & Biologicals', 'Veterinary Drugs/Products', 'Vitamins & Minerals', 'Miscellaneous', 'Others'];

    res.json(200, props[req.query.prop] || {});
  
  });

  //Updates the price of the drug
  app.put('/api/drugs/:drugId/price', function(req, res, next) {
    drugs.priceUpdate( req.params.drugId, req.body.price, function(r){
      if(utils.isError(r)){
        next(r);
      }else{
        res.json(200, true);
      }
    });
  });
  //Updates the drug item
  app.put('/api/drugs/:drugId', function(req, res, next) {
    drugs.updateItem( req.params.drugId, req.body)
    .then(function (r) {
      res.json(200, { message: 'saved'});
    }, function (err) {
      next(err);
    });
  });
};