var item_model = require('../models/item.js'),
  utils = require('util');

module.exports.routes = function(app, login) {
  var drugs = new item_model.Drug();
  var NDL = item_model.NDL;

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
  app.get('/api/internal/item/search', function (req, res) {
    drugs.search(req.query.s, req.query.param, req.query.filter, {})
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      console.log(err);
      res.json(400, err);
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
      limit: req.query.limit || 50
    }, req.user._id, req.user.account_type)
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      next(err);
    });
  });


  app.get('/api/drugs/requests', function (req, res) {
    var action = req.query.action;
    var owner = req.user._id;
    var account_type = req.user.account_type;   

    drugs.stockRequest(owner, account_type, action) 
    .then(function (done) {
      res.json(200, done);
    }, function (err) {
      res.json(400, err);
    });
  });  

  //run typeahead
  app.get('/api/internal/items/typeahead', function (req, res, next) {
    //var ndl = NDL();
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

  app.get('/api/drugs/:itemId/history', function (req, res) {
    var action = req.query.action;
    var itemId = req.params.itemId;
    var owner = req.user._id;
    var account_type = req.user.account_type;   

    drugs.stockLog(itemId, owner, account_type, action) 
    .then(function (done) {
      res.json(200, done);
    }, function (err) {
      res.json(400, err);
    });
  });


  app.post('/api/drugs', function (req, res) {
    var item = req.body;
    var owner = req.user._id;
    var account_type = req.user.account_type;
    drugs.addDrug(item, owner, account_type)
    .then(function () {
      res.json(200, true);
    }, function (err) {
      res.json(400, err);
    });
  });

  //request to stock to 
  app.post('/api/drugs/:itemId/stockto', function (req, res) {
    var itemId = req.params.itemId,
        userId = req.user._id,
        accountType = req.user.account_type;


    drugs.createStockTransaction(itemId, userId, accountType, req.body, false)
    .then(function (done) {
      res.json(200, {status: done});
    }, function (err) {
      res.json(400, err);
    });

  });

  app.post('/api/drugs/:itemId/stockup', function (req, res) {
    var itemId = req.params.itemId,
        userId = req.user._id,
        accountType = req.user.account_type;

    drugs.createStockTransaction(itemId, userId, accountType, req.body, true)
    .then(function (done) {
      res.json(200, {status: done});
    }, function (err) {
      res.json(400, err);
    });

  });

  app.post('/api/drugs/:itemId/requests/:transactionId', function (req, res) {
    var itemId = req.params.itemId, 
        userId = req.user._id, 
        accountType = req.user.account_type,
        transactionId = req.params.transactionId;
    drugs.approveRequest(itemId, userId, accountType, transactionId)
    .then(function (done) {
      res.json(200, done);
    }, function (err) {
      res.json(400, err);
    });
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
    .then(function () {
      res.json(200, { message: 'saved'});
    }, function (err) {
      next(err);
    });
  });
};