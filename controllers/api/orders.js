var 
    Order = require('../../models/order');    

module.exports.routes = function (app) {
  var order = new Order();

  //
  //Orders
  //
  app.get('/api/v1/orders/:orderStatus/display/:displayType',function(req, res){

    order.getOrders(req.params.orderStatus, req.params.displayType, req.user._id, req.user.account_type)
    .then(function(r){
      res.json(200, r);
    }, function (err) {
      res.json(400, err);
    });
  }); 

  //updates an order
  app.put('/api/v1/orders/:orderId', function (req, res) {
    order.distUpdateOrder(req.body, req.user._id, req.user.account_type)
    .then(function (data) {
      res.json(200, true);
    }, function (err) {
      res.json(400, err.message);
    });
  });


  
};