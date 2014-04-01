var mongoose = require('mongoose'),
  Order = require('./order/order.js').Order,
  OrderStatus = require('./order/order.js').OrderStatus,
  _ = require('underscore'),
  Hospital = require('./organization/hospital.js') ,
  Notification = require('./activity.js'),
  Q = require("q"),
  utilz = require('../lib/utils.js'),
  EventRegister = require('../lib/event_register').register,
  utils = require("util");



var orderManager = {
  cartOrder : function cartOrder (orderData) {
    console.log(orderData);
    console.log('cartOrder is working....');
    var order = new Order(orderData), or = Q.defer();
    order.orderDate = orderData.orderDate || Date.now();
    order.save(function (err, i) {
      console.log(err, i);
      if (err) {
        return or.reject(err);
      } else {
        return or.resolve(i); 
      }
    })

    return or.promise;
  },
  /**
   * records alerts for certain account types
   * @param  {[type]} alertDoc   [description]
   * @param  {[type]} owner the hospital placing the order.
   * @return {[type]}          [description]
   */
  alertNewOrder : function (alertDoc, owner) {
    var alert = new Notification(),
        people = [2];
    alert.alertType = 'order';
    alert.alertDescription = 'New order has been placed';
    alert.hospitalId = owner;
    alert.ownerId = alertDoc.orderSupplier;

    alert.save(function (err, i) {
      console.log(err, i);
    });
    
    // function postToPeerson () {
    //   alert.alertPeople(person, alertDoc, function (err, i) {
    //     if (err) {
    //       console.log(err);
    //     }
    //     if (i) {

    //     }
    //   })

    // } 


  }
}


function OrderController () {

}

OrderController.prototype.constructor = OrderController;


/**
 * Create an order
 */
OrderController.prototype.pushOrders = function (body, cb) {
  return cb(200);

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

OrderController.prototype.placeCart = function(cartObj, cb){
  if(_.isEmpty(cartObj)) return cb(new Error('Empty Request'));

  var doneIds = [];

  function _create(){
    var item = cartObj.pop();
    var l = cartObj.length;


    var itemName = item.itemName;
    var supplier = item.supplier;
    var id = item.itemId;

    var order = new Order(item);
    var itemObj = {itemName: itemName, id: id};
    order.orderSupplier =  supplier;

    order.itemData = itemObj;
    
    order.save(function (r) {
      //Check if the object returned is an error
      if(utils.isError(r)){
        //if we have some processed results
        //return that
        if(doneIds.length > 0){ 
          return cb(doneIds);
        }else{
          return cb(r);
        }

      }else{
        //Add another done/placed order
        doneIds.push(id);
        if(l--){
          _create();
        }else{
          postOrders();
          cb(doneIds);
        }
      }
    });    
  }

  _create();
};




/**
 * queries for orders by the order status order
 * @param  {[type]} orderStatus [description]
 * @param  {[type]} displayType [description]
 * @return {[type]}             [description]
 */
OrderController.prototype.getOrders = function(orderStatus, displayType){
  console.log(orderStatus, displayType);
  var fields,
      gt = Q.defer();

  if (displayType === 'full') {
    fields = 'itemId orderAmount perItemPrice orderDate orderSupplier orderStatus hospitalId orderId amountSupplied';
  }
  if (displayType === 'short') {
    fields = 'itemId orderAmount perItemPrice orderDate orderSupplier orderStatus hospitalId orderId amountSupplied';
  }

  Order.find({
    orderVisibility: true,
    orderStatus: orderStatus
  }, fields)
  .populate('itemId', 'itemName images pharma', 'drug')
  //.limit(perPage)
  //.skip(perPage * page)
  .exec(function(err, o) {
    console.log(err, o);
    if (err){
      return gt.reject(err);
    }else{
      return gt.resolve(o);
    }
  });

  // function populate () {
  //   var l = orders.length;
  //   var p = orders.pop();

  //   Hospital.findOne({hospitalId : p.hospitalId},'name address phonenumber')
  //   .exec(function(err, i){
  //     if(err){
  //       cb(err);
  //     }else{
  //       r.push({
  //         name: i.name,
  //         address: i.address,
  //         phonenumber: i.phonenumber,
  //         hospitalId: p.hospitalId,
  //         orderDate: p.orderDate,
  //         _id: p._id,
  //         orderStatus: p.orderStatus,
  //         orderSupplier:p.orderSupplier[0],
  //         orderAmount: p.orderAmount,
  //         nafdacRegName:p.nafdacRegName,
  //         nafdacRegNo: p.nafdacRegNo
  //       });
  //       if(--l){
  //         populate();
  //       }else{
  //         cb(r);
  //       }
  //     }
  //   });
  // }
  
  return gt.promise;

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

OrderController.prototype.orderUpdates = function(hospitalId, dayte, cb){

  var d = new Date(dayte);
  var sinceDate = d.toString();
  OrderStatus.find({hospitalId : hospitalId})
  .gt('date', sinceDate)
  .populate('order_id', 'orderAmount nafdacRegName orderSupplier h_order_Id', 'Order')
  .exec(function(err, i){
    if(err) return cb(err);
    cb(i);
  });
};

OrderController.prototype.placeItemInCart = function (orderData, orderOwner) {
  console.log('Placing Items in Cart');
  var procs = Q.defer();

  orderData.itemId = orderData._id;
  orderData.perItemPrice = orderData.currentPrice;
  orderData.orderSupplier = orderData.owner;
  orderData.hospitalId = orderOwner;
  orderData.orderId = utilz.uid(32);
  var order = _.omit(orderData, '_id');
  orderManager.cartOrder(order)
  .then(function (d) {
    return procs.resolve(d);
  }, function (err) {
    return procs.reject(err);
  })

  return procs.promise;
};

/**
 * places an order from an item on the cart.
 * This changes the order status to 1 from 0. 
 * 1 means order placed.
 * @param  {Object} object containing data sent from 
 * the browser. 
 * @return {[type]}       [description]
 */
OrderController.prototype.placeOrder = function (order, orderOwner) {
  console.log('Placing order');
  var ot = Q.defer();

  Order.update({
    orderId : order.orderId
  }, {
    $set : {
      orderStatus: 1
    }
  }, function (err, i) {
    if (err) {
      return ot.reject(err);
    }
    if (i > 0) {
      orderManager.alertNewOrder(order, orderOwner);
      return ot.resolve(i);
    }
    if (i === 0) {
      return ot.reject(new Error('order update failed'));
    }
  })

  return ot.promise;
}

module.exports = OrderController;