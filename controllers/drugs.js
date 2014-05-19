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
  app.get('/a/drugs/:drugId/item', function (req, res) {
    res.render('index');   
  });
  //Displays one item page
  app.get('/a/users/:userId/drugs/:drugId/item', function (req, res) {
    res.render('index');   
  });


  //Displays one item page
  // app.get('/api/internal/drugs/:drugId/item', function (req, res) {
  //   drugs.fetchOneById(req.params.drugId)
  //   .then(function (r) {

  //     res.json(200, r);

  //   }, function (err) {
  //     res.json(400, err);
  //   });    
  // });
  //Displays one item page
  app.route('/api/internal/drugs/:drugId/item')
  .get(function (req, res) {
    drugs.fetchOneById(req.params.drugId)
    .then(function (r) {

      res.json(200, r);

    }, function (err) {
      res.json(400, err);
    });    
  })  //Updates the drug item
  .put(function(req, res, next) {
    //TODO::
    //check if the currently logged in user
    //has permission to make changes to this item.
    // if (req.user._id.toString() !== req.body.supplier.supplierId) return res.json(401, 'not permitted to modify');
    // return false;
    drugs.updateItem( req.params.drugId, req.body)
    .then(function () {
      res.json(200, { message: 'saved'});
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
      res.json(400, err.message);
    });
  });
  //Fetch Drug Item Summary
  app.get('/api/internal/drugs/:drugId/view/summary', function(req, res, next){
    drugs.summary(req.params.drugId, function(r){
      if(utils.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  app.get('/api/internal/drugs/updates/:since', function(req, res, next){
    var d = new Date(req.params.since);
    drugs.checkUpdate(d, function(r){
      if(utils.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  app.get('/api/internal/drugs', function (req, res, next) {
    drugs.fetchAllMyDrugs({
      page: req.query.page - 1 || 0,
      limit: req.query.limit || 50
    }, req.user._id, req.user.account_type)
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      next(err);
    });
  });


  app.get('/api/internal/drugs/requests', function (req, res) {
    var action = req.query.action;
    var owner = req.user._id;
    var account_type = req.user.account_type;   

    drugs.stockRequest(owner, account_type, action) 
    .then(function (done) {
      res.json(200, done);
    }, function (err) {
      res.json(400, err.message);
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

  app.get('/api/internal/drugs/:itemId/history', function (req, res) {
    var action = req.query.action;
    var itemId = req.params.itemId;
    var owner = req.user._id;
    var account_type = req.user.account_type;   

    drugs.stockItemLog(itemId, owner, account_type, action) 
    .then(function (done) {
      res.json(200, done);
    }, function (err) {
      res.json(400, err.message);
    });
  });

  app.get('/api/internal/drugs/history', function (req, res) {
    var action = req.query.action;
    var owner = req.user._id;
    var account_type = req.user.account_type;   

    drugs.stockLog(owner, account_type, action) 
    .then(function (done) {
      res.json(200, done);
    }, function (err) {
      res.json(400, err.message);
    });
  });

  //NAFDAC Fetch item by Registeration Number
  app.get('/api/internal/nafdacdrugs/search', function(req, res){
    drugs.fetchByRegNo(req.query.q)
    .then(function(r){
      res.json(200, r);
    }, function (err) {
      res.json(400, err.message);
    });
  });

  app.post('/api/internal/drugs', function (req, res) {
    var item = req.body;
    var owner = req.user._id;
    var account_type = req.user.account_type;
    drugs.addDrug(item, owner, account_type)
    .then(function () {
      res.json(200, true);
    }, function (err) {
      res.json(400, err.message);
    });
  });

  //request to stock to i.e. to send stock 
  //to a staff. stocking down for a distributor 
  //or manager and stockup for a staff
  app.post('/api/internal/drugs/:itemId/stockto', function (req, res) {
    var itemId = req.params.itemId,
        userId = req.user._id,
        accountType = req.user.account_type;


    drugs.createStockDownTransaction(itemId, userId, accountType, req.body)
    .then(function (done) {
      res.json(200, {status: done});
    }, function (err) {
      res.json(400, err.message);
    });

  });

  //request stock from a distributor or manager, i.e. stock up
  //for a staff, manager or even an internal distributor stockup
  app.post('/api/internal/drugs/:itemId/stockup', function (req, res) {
    var itemId = req.params.itemId,
        userId = req.user._id,
        accountType = req.user.account_type;

    drugs.createStockUpTransaction(itemId, userId, accountType, req.body)
    .then(function (done) {
      res.json(200, {status: done});
    }, function (err) {
      res.json(400, err.message);
    });

  });

  app.post('/api/internal/drugs/:itemId/requests/:transactionId', function (req, res) {
    var itemId = req.params.itemId, 
        userId = req.user._id, 
        accountType = req.user.account_type,
        transactionId = req.params.transactionId,
        nextStatus = req.query.nextStatus;
    drugs.attendRequest(itemId, userId, accountType, transactionId, parseInt(nextStatus))
    .then(function (done) {
      res.json(200, done);
    }, function (err) {
      res.json(400, err.message);
    });
  });



  //Updates the price of the drug
  app.put('/api/internal/drugs/:drugId/price', function(req, res, next) {
    drugs.priceUpdate( req.params.drugId, req.body.price, function(r){
      if(utils.isError(r)){
        next(r);
      }else{
        res.json(200, true);
      }
    });
  });



  app.delete('/api/internal/drugs/:itemId/requests/:transactionId', function (req, res) {
    var itemId = req.params.itemId, 
        userId = req.user._id, 
        accountType = req.user.account_type,
        transactionId = req.params.transactionId,
        nextStatus = req.query.nextStatus;
    drugs.deleteRequest(itemId, userId, accountType, transactionId, nextStatus)
    .then(function (done) {
      res.json(200, done);
    }, function (err) {
      res.json(400, err.message);
    });
  });  
};