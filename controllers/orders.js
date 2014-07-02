
/**
 * Module dependencies.
 */

var Order = require('../models/order.js'),
    util = require('util');


module.exports.routes = function(app, login){
  var order = new Order();

  app.get('/a/orders', login.ensureLoggedIn(), function(req, res){
      res.render('index',{
        title: 'Place new order'
      });
    }
  );

  app.get('/a/orders/:id', login.ensureLoggedIn(), function(req, res){
      res.render('index',{});
    }
  );

  app.get('/a/orders', login.ensureLoggedIn(), function(req, res){
      res.render('index',{
        title: 'All orders'
      });
    }
  );
  //Show place new order page
  app.get('/a/orders/new', login.ensureLoggedIn(), function(req, res){
    console.log(res.locals.user);
    res.render('index');
  });
  //Show Order Cart page
  app.get('/a/orders/cart', login.ensureLoggedIn(), function(req, res){
    res.render('index');
  });

  //Order  GET routes
  //@orderStatus the orderStatus parameter queries for the
  //right order statuses to be sent as a response.
  //it expects a numbers between 0 and 6.
  //any number over 6 will request all orders.
  //
  //@displayType is a string which specifies what fields of the result
  //get sent back as a response. The available options are full or short.
  //
  //
  app.get('/api/internal/orders/:orderStatus/display/:displayType',function(req, res){

    order.getOrders(req.params.orderStatus, req.params.displayType, req.user._id, req.user.account_type)
    .then(function(r){
        res.json(200, r);
    }, function (err) {
      res.json(400, err);
    });
  });

  app.get('/api/internal/orders/:orderId/statuses', function (req, res) {
    order.getOrderStatuses(req.params.orderId, req.user._id, req.user.account_type)
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      res.json(400, err.message);
    });
  });

  // Order POST Routes
  app.post('/api/internal/orders',function(req, res){
    order.requestItemQuotation(req.body, req.user._id)
    .then(function(r){
      res.json(200, true);
    }, function (err) {
      res.json(400, err.message);
    });
  });

  app.post('/api/sms-point', function (req, res) {
    order.processSMSRequest(req.body)
    .then(function(r){
      console.log(r);
      res.json(200, r);
    }, function (err) {
      res.json(400, err.message);
    });
  });

  //Progresses an order from the cart to being placed
  app.put('/api/internal/orders/:orderId/status/:orderStatus', function (req, res) {
    console.log('message');
    var userId, accountType;
    if (parseInt(req.user.account_type) === 5) {
      userId = req.user._id;
      accountType = req.user.account_type;
      order.addressQuotation(req.body, parseInt(req.params.orderStatus), userId, accountType)
      .then(function (r) {
        res.json(200, r);
      }, function (err) {
        res.json(400, err.message);
      });
    } else {
      res.json(401, 'not authorized');
    }

    //if(req.params.orderStatus == )
  });

  //updates an order
  app.put('/api/internal/orders/:orderId', function (req, res) {
    console.log('In the put route');
    order.distUpdateOrder(req.body, req.user._id, req.user.account_type)
    .then(function (data) {
      res.json(200, true);
    }, function (err) {
      res.json(400, err.message);
    });
  });

  //Delete Order (logically)
  app.delete('/api/internal/orders/:order_id', function(req, res, next){
    order.hideOrderItem(req.param('order_id'))
    .then(function(err){
      if(util.isError(err)){
        next(err);
      }else{
        res.json(200, {state: 1});
      }
    });
  });

};