
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Order = mongoose.model('Order'),
    OrderStatus = mongoose.model('OrderStatus'),
    Supplier = mongoose.model('Supplier'),
    _ = require("underscore"),
    Drug = mongoose.model('drug'),
    DUH = mongoose.model('drugUpdateHistory'),
    utils = require("util");


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
DrugController.prototype.search = function(string, page, callback) {
  Drug.find({},
    'productName composition category currentPrice'
  )
  .regex('productName', new RegExp(string, 'i'))
  .limit(10)
  .skip(page * 10)
  .exec(function(err, i){
    if(err){
      callback(err);
    } else {
      callback(i);
    }
  });
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

DrugController.prototype.checkUpdate = function(since, cb){
  
  DUH.find()
  .gt('lastUpdated', since)
  .populate('product_id', 'productName composition man_imp_supp regNo')
  .exec(function(err, i){
    if(err) return cb(err);
    cb(i);
  });
}

module.exports.drug = DrugController;
var drugs = new DrugController();

module.exports.routes = function(app, auth) {

  app.get('/drugs', auth.requiresLogin, function(req, res){
    res.render('index');
  });

  app.get('/medeqp', auth.requiresLogin, function(req, res){
    res.render('index');
  });

  //Search for nafdac reg drugs by category
  app.get('/api/drugs/:needle/page/:page', function(req, res, next){
    drugs.search(req.params.needle, req.params.page, function(r){
      if(utils.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
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

  //Updates the price of the drug
  app.put('/api/drugs/:drugId', function(req, res, next) {
    drugs.priceUpdate( req.params.drugId, req.body.price, function(r){
      if(utils.isError(r)){
        next(r);
      }else{
        res.json(200, true);
      }
    });
  });
};