
/**
 * Module dependencies.
 */

var Order = require('../../models/order.js'),
    util = require('util');


module.exports.routes = function(app, login){
  var order = new Order();

  app.get('/x/orders', login.ensureLoggedIn(), function(req, res){
      res.render('index',{
        title: 'Admin :: All Orders'
      });
    }
  );

  // app.get('/a/orders/:id', login.ensureLoggedIn(), function(req, res){
  //     res.render('index',{});
  //   }
  // );

  // app.get('/a/orders', login.ensureLoggedIn(), function(req, res){
  //     res.render('index',{
  //       title: 'All orders'
  //     });
  //   }
  // );
  // //Show place new order page
  // app.get('/a/orders/new', login.ensureLoggedIn(), function(req, res){
  //   console.log(res.locals.user);
  //   res.render('index');
  // });
  // //Show Order Cart page
  // app.get('/a/orders/cart', login.ensureLoggedIn(), function(req, res){
  //   res.render('index');
  // });

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
  app.get('/api/internal/admin/orders',function(req, res){

    order.getOrders(req.params.orderStatus, 'full', req.user._id, 'admin')
    .then(function(r){
        res.json(200, r);
    }, function (err) {
      res.json(400, err);
    });
  });





};