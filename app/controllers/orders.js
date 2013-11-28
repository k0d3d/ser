
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
  Order = mongoose.model('Order'),
  OrderStatus = mongoose.model('OrderStatus'),
  Supplier = mongoose.model('Supplier'),
  _ = require('underscore'),
  Hospital = mongoose.model('Hospital'),
  utils = require("util");


function OrderController () {

}

OrderController.prototype.constructor = OrderController;


/**
 * Create an order
 */
OrderController.prototype.pushOrders = function (body, cb) {

  var data = JSON.parse(body.data);
  var hid = JSON.parse(body.hid);
  var trackingObj = [];

  _.some(data, function(v, i){
    var tob = _.omit(v, '_id');
    var order = new Order(tob);
    //save hospital id
    order.hospitalId = hid;
    //save drug nafdac reg no.
    order.nafdacRegNo = v.nafdacRegNo;
    order.nafdacRegName = v.nafdacRegName;
    //Save hospital's order id
    order.h_order_Id = hid+ '-' + v._id;

    order.save(function(err, r){
      if(err){
        //cb(err);
        //return true;
        utils.puts(err);
      }
      //Cross tracking
      trackingObj.push({
        online: r._id,
        client: v._id
      });

      //In the end i suppose
      if(data.length === i +1 ){
        cb(trackingObj);
        return true;
      }
    });
  });  
};




/**
 * List All Orders
 */

OrderController.prototype.getOrders = function(page, cb){
  var perPage = 20;
  var orders;
  var r = [];

  Order.find({orderVisibility: true})
  .limit(perPage)
  .skip(perPage * page)
  .exec(function(err, o) {
    if (err){
      cb(err);
    }else{
      orders  = o;
      populate();
    }
  });

  function populate () {
    var l = orders.length;
    var p = orders.pop();

    Hospital.findOne({hospitalId : p.hospitalId},'name address phonenumber')
    .exec(function(err, i){
      if(err){
        cb(err);
      }else{
        r.push({
          name: i.name,
          address: i.address,
          phonenumber: i.phonenumber,
          hospitalId: p.hospitalId,
          orderDate: p.orderDate,
          _id: p._id,
          orderStatus: p.orderStatus,
          orderSupplier:p.orderSupplier[0],
          orderAmount: p.orderAmount,
          nafdacRegName:p.nafdacRegName,
          nafdacRegNo: p.nafdacRegNo
        });
        if(--l){
          populate();
        }else{
          cb(r);
        }
      }
    });
  }

};


/**
 * Updates an order status and creates a stock record 
 */

OrderController.prototype.updateOrder = function(orderData, status, hospitalId, cb){
  //Updates the order statuses, these are useful for order history
  //queries, etc
  //Updates the order status 
  var rsr = { 'orderStatus':status};
  if(orderData.amountSupplied){
    rsr.amountSupplied = orderData.amountSupplied;
  }
  Order.update({'_id':orderData._id},{
    $set: rsr
  }).exec(function(err){
    if(err)utils.puts(err);
  });

  //Creates a new record to show when this order was
  //updated and what action was taken.
  var orderstatus = new OrderStatus();
  orderstatus.status = status;
  orderstatus.order_id = orderData._id;
  orderstatus.check = hospitalId + '-' + orderData._id + '-' + status;
  orderstatus.hospitalId = hospitalId;
  orderstatus.save(function(err){
    if(err)return cb(err);
    return cb(true);
  });


};

/**
 * [count description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var count = function(req, res){
  var d = Order.count({orderVisibility: true});
  var m  = Order.count({orderVisibility: true});
  m.where('orderStatus').equals('pending order');
  d.where('orderStatus').equals('supplied');
  d.exec(function(err,y){
    if(err)console.log(err);
    m.exec(function(err, o){
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify({"pendingpayment":y,"pendingorders":o}));
      res.end();
    });
  });
};


/**
 * [suppliersTypeahead description]
 * @method suppliersTypeahead
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var suppliersTypeahead = function(req, res){
  Supplier.autocomplete(req.param('query'), function(err, suppliers){
    if (err) return res.render('500');
     res.json(suppliers);
  });
};

/**
 * [removeOrder description]
 * @param  {[type]}   order_id   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
OrderController.prototype.removeOrder = function(order_id, callback){
  Order.update({_id: order_id}, {
    $set:{
      orderVisibility: false
    }
  }, callback);
};

OrderController.prototype.orderUpdates = function(hospitalId, since, cb){
  OrderStatus.find({hospitalId : hospitalId})
  .gt('date', since)
  .populate('order_id', 'orderAmount nafdacRegName orderSupplier')
  .exec(function(err, i){
    if(err) return cb(err);
    cb(i);
  });
}

module.exports.order = OrderController;
var order = new OrderController();

module.exports.routes = function(app){

  app.get('/dashboard/order', function(req, res){
      res.render('index',{
        title: 'Place new order'
      });
    }
  );
  app.get('/dashboard/order/:id', function(req, res){
      res.render('index',{
        title: 'Place new order'
      });
    }
  );
  app.get('/orders', function(req, res){
      res.render('index',{
        title: 'All orders'
      });
    }
  );
  //Order  GET routes
  app.get('/api/orders/:pageNo',function(req, res, next){
    order.getOrders(req.params.pageNo, function(r){
      if(utils.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });
  app.get('/api/orders/count',count);

  app.get('/api/orders/supplier/typeahead/:query', suppliersTypeahead);

  app.get('/api/orders/hospital/:hospitalId/updates', function(req, res, next){
    order.orderUpdates(req.params.hospitalId, req.body.since, function(r){
      if(utils.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  // Order POST Routes
  app.post('/api/orders',function(req, res, next){
    order.pushOrders(req.body, function(r){
      if(utils.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });


  //Order PUT Routes
  app.put('/api/orders/:orderId/hospital/:hospitalId/status/:status/',function(req, res, next) {
    order.updateOrder({
      _id: req.params.orderId,
      amountSupplied: req.body.amountSupplied
    }, req.params.status, req.params.hospitalId, function(r){
      if(utils.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  //Delete Order (logically)
  app.delete('/api/orders/:order_id', function(req, res, next){
    removeOrder(req.param('order_id'), function(err, i){
      if(utils.isError(err)){
        next(err);
      }else{
        res.json(200, {state: 1});
      }
    });
  });

};