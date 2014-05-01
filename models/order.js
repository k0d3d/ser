var Order = require('./order/order.js').Order,
  OrderStatus = require('./order/order.js').OrderStatus,
  _ = require('underscore'),
  //Hospital = require('./organization/hospital.js') ,
  Q = require('q'),
  utilz = require('../lib/utils.js'),
  //EventRegister = require('../lib/event_register').register,
  staffUtils = require('./staff_utils.js'),
  utils = require('util');

//Underscore mixin to remove 
//false values from an object
_.mixin({
  compactObject: function (o) {
    var clone = _.clone(o);
    _.each(clone, function (v, k) {
      if (!v) {
        delete clone[k];
      }
    });
    return clone;
  }
});

var orderManager = {
  cartOrder : function cartOrder (orderData) {
    console.log('cartOrder is working....');
    var order = new Order(orderData), or = Q.defer();
    console.log(order);
    order.orderDate = orderData.orderDate || Date.now();
    order.save(function (err, i) {
      console.log(err, i);
      if (err) {
        return or.reject(err);
      } else {
        return or.resolve(i); 
      }
    });

    return or.promise;
  },
  getOrders: function getOrders (doc) {
    console.log('Attempting to get orders..');
    console.log(doc);
    var query = {
      orderVisibility: true,
      //orderStatus: doc.orderStatus,
    };

    if (!doc.orderStatus) {
      query.status = {$gt: 0};
    }
    if(doc.orderStatus) {
      query.status = doc.orderStatus;
    }
    //query.orderStatus = (doc.orderStatus && (doc.orderStatus !== 0)) ? {$gt: 0} : undefined;


    query[doc.where] = doc.whrVal;

    var fields = doc.fields,
        gt = Q.defer();

    if (doc.displayType === 'full') {
      fields = '';
    }
    if (doc.displayType === 'short') {
      fields = 'itemId orderAmount perItemPrice orderDate orderSupplier status hospitalId orderId amountSupplied';
    }

    Order.find(_.compactObject(query), fields)
    // .where(doc.where, doc.whrVal)
    .populate('itemId', 'itemName images pharma', 'drug')
    .lean()
    //.limit(perPage)
    //.skip(perPage * page)
    .exec(function(err, o) {
      //console.log(err, o);
      if (err){
        return gt.reject(err);
      }else{
        return gt.resolve(o);
      }
    });
    
    return gt.promise;
  },
  getItemSuppliers : function getItemSuppliers (__orders) {
    console.log('Getting Item Suppliers');
    //console.log(__orders);
    var gt = Q.defer(), populatedOrderList = [];


    function __gt () {
      var task = __orders.pop();
      console.log(task.orderSupplier);
      if (_.isEmpty(task.orderSupplier)) {
        populatedOrderList.push(task);
        if (__orders.length) {
          __gt();
        } else {
          return gt.resolve(populatedOrderList);
        }
      } else {
        staffUtils.getMeMyModel(task.orderSupplier.supplier_type)
        .findOne({
          userId: task.orderSupplier.supplierId
        }, 'name ')
        .exec(function (err, supplierResult) {
          //console.log(err, supplierResult);
          if (err) {
            return gt.reject(err);
          }
          if (!supplierResult) {
            return gt.reject(new Error('supplier not found'));
          }
          task.orderSupplier = supplierResult;

          populatedOrderList.push(task);
          if (__orders.length) {
            __gt();
          } else {
            return gt.resolve(populatedOrderList);
          }
        });          
      }
    
    }

    if (__orders.length) {
      __gt();
    } else {
      gt.resolve([]);
    }

    
    return gt.promise;
  },
  getEmployerOrder : function getEmployerOrder (doc) {
    console.log('Getting employer orders...');
    var g = Q.defer();

    orderManager.getOrders({
      orderStatus: (doc.orderStatus > 6) ? undefined : doc.orderStatus,
      displayType: doc.displayType,
      where: 'orderSupplier.supplierId',
      whrVal: doc.employerId
    })
    .then(function (orderList) {
      staffUtils.populateProfile(orderList, 'hospitalId', 5)
      .then(function (hehe) {
        return g.resolve(hehe); 
      }, function (err) {
        return g.reject(err);
      });
        // return g.resolve(orderList); 
    }); 

    return g.promise;      
  },
  createOrderStatus: function createOrderStatus (doc) {
    var upd = Q.defer();

    //quick hack for demo purpose
    doc.orderSupplier = doc.orderSupplier || {};

    //Creates a new record to show when this order was
    //updated and what action was taken.
    var orderstatus = new OrderStatus(doc);
    orderstatus.check = doc.orderCharge + '-' + doc.orderId + '-' + doc.orderStatus + '-' + doc.orderSupplier.supplierId;
    orderstatus.orderSupplier = doc.orderSupplier.supplierId;
    orderstatus.save(function(err){
      if (err) {
        return upd.reject(err);
      } else {
        return upd.resolve(true);
      }
      
    });    

    return upd.promise; 
  },
  getFacilityOrders: function getFacilityOrders (doc) {
    var ht = Q.defer();

    Order.find({
      hospitalId: doc.hospitalId
    }, 'itemId')
    .populate('itemId', 'itemName', 'drug')
    .exec(function (err, i) {
      if (err) {
        return ht.reject(err);
      }
      if (i) {
        return ht.resolve(i);
      }
    });

    return ht.promise;
  }
};


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



/**
 * queries for orders by the order status order
 * @param  {[type]} orderStatus the order status to return 
 * @param  {[type]} displayType Full or summary results / fields returned
 * @param  {[type]} userId the user id for the logged in user.
 * @param  {[type]} accountType the user id for the logged in user.
 * @return {[type]}             Promise.
 */
OrderController.prototype.getOrders = function getOrders (orderStatus, displayType, userId, accountType){
  console.log('Checking Orders....');
  var gt = Q.defer(), __orders;



  //if account type is a hospital
  if (accountType === 5) {
    console.log('Detected hospital account');
    //Fetch orders authored / placed by the 
    //logged in hospital.
    orderManager.getOrders({
      orderStatus: (orderStatus > 6) ? undefined : orderStatus,
      displayType: displayType,
      where: 'hospitalId',
      whrVal: userId
    })
    .then(function (orderList) {
      if (orderList.length) {
        __orders = orderList;

        orderManager.getItemSuppliers(__orders).
        then(function (populatedOrderList) {
          return gt.resolve(populatedOrderList);
        });      
      } else {
        return gt.resolve([]);
      }

      
    });
  }


  //if account type is a staff or manager
  if (accountType === 4 || accountType === 3) {
    console.log('Detected staff or manager account');
    //Fetch orders authored / placed by the 
    //logged in hospital.
    //what we are actually looking for is all orders
    //placed to distributor employing the currently 
    //logged in user.
    
    //first of all, lets get the employerId.
    staffUtils.getMeMyModel(accountType)
    .findOne({
      userId: userId
    }, 'employer')
    .exec(function (err, user) {
      if (err) {
        return gt.reject(err);
      }
      if (user) {
        orderManager.getEmployerOrder({
          displayType: displayType,
          employerId: user.employer.employerId,
          orderStatus: orderStatus
        })
        .then(function (orders) {
          return gt.resolve(orders);
        });
      }
    });
    
 
  }


  //if account type is a distributor
  if (accountType === 2) {
    console.log('Detected distributor account');
    orderManager.getEmployerOrder({
      displayType: displayType,
      employerId: userId,
      orderStatus: orderStatus
    })
    .then(function (orders) {
      return gt.resolve(orders);     
    });

   
  }
  
  return gt.promise;

};

/**
 * updates changes to an order. it also updates the 
 * order status entries to record when the order was 
 * updated. this uses the account type to restrict 
 * different user levels from performing certain updates
 * @param  {Object} orderData   the order object containing the 
 * changed, to-be-updated order information. Including the orderId
 * @param  {ObjectId} userId      the userId of the currently logged
 * in user.
 * @param  {Number} accountType the account level of the currently logged in user
 * @return {Object}             Promise Object
 */
OrderController.prototype.updateOrder = function(orderData, userId, accountType){
  console.log('Updating order...');
  //Updates the order statuses, these are useful for order history
  //queries, etc
  //Updates the order status 
  var law = Q.defer(),
      __body = _.omit(orderData, ['_id', 'hospitalId', 'itemId', 'statusLog', 'orderSupplier']);
  var options = {
      $set: __body,
      $push: {
        statusLog: {
          orderStatus: __body.status,
          orderCharge: __body.orderCharge
        }
      }
    };

  //if the currently logged in user
  //is a staff and is confirming or disputing an order
  if ((__body.status === parseInt(3) || __body.status === parseInt(2)) && accountType === parseInt(4)) {
    options.$push = {
      statusLog: {
          orderStatus: __body.status,
          orderCharge: userId      
      }
    };
  }

  //TODO:: use fine and Update instead of update
  //to check for current order status
  //if the order has been confirmed.. it cannot be 
  //replace again, or confirmed again
  //if(__body.status)

  console.log(options);

  try {
    Order.update({
      'orderId': orderData.orderId
    }, options)
    .exec(function (err, i) {
      console.log(err, i);
      if (err) {
        return law.reject(err);
      }

      if (i > 0) {
        return law.resolve(orderData);
      }

      if (i === 0) {
        return law.reject(new Error('updating order failed'));
      }
    });
  }catch (e) {
    console.log(e);
    law.reject(e);
    return law.promise;
  }


  return law.promise;
};

/**
 * get the status updates and other changes made to 
 * a specific order.
 * we add the userId and account type to protect certain
 * account levels and users from making certain queries.
 * @param  {[type]} orderId     [description]
 * @param  {[type]} userId      [description]
 * @param  {[type]} accountType [description]
 * @return {[type]}             [description]
 */
//OrderController.prototype.getOrderStatuses = function getOrderStatuses (orderId, userId, accountType) {
OrderController.prototype.getOrderStatuses = function getOrderStatuses (orderId) {
  console.log('Getting order statuses...');
  var d = Q.defer();

  Order.findOne({
    orderId : orderId
  }, 'statusLog')
  .lean()
  .exec(function (err, i) {
    if (err) {
      return d.reject(err);
    }
    console.log(i);
    if (i.statusLog.length) {
      staffUtils.populateProfile(i.statusLog, 'orderCharge', 4)
      .then(function (popped) {
        console.log(popped);
        return d.resolve(popped);
      }, function (err) {
        return d.reject(err);
      });
    } else {
      return d.resolve(i);
    }
    
  });

  return d.promise;
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
OrderController.prototype.removeOrder = function removeOrder (order_id, callback){
  Order.update({_id: order_id}, {
    $set:{
      orderVisibility: false,
      orderStatus: -1
    }
  }, callback);
};

OrderController.prototype.orderUpdates = function orderUpdates (hospitalId, dayte, cb){

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

/**
 * [placeItemInCart description]
 * @param  {[type]} orderData  [description]
 * @param  {[type]} orderOwner the user placing the order
 * @return {[type]}            [description]
 */
OrderController.prototype.placeItemInCart = function placeItemInCart (orderData, orderOwner) {
  console.log('Placing Items in Cart');
  var procs = Q.defer();

  orderData.itemId = orderData._id;
  orderData.perItemPrice = orderData.currentPrice.retail;
  orderData.orderSupplier = {supplierId: orderData.owner.userId, supplier_type: orderData.owner.account_type};
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
 * changes the status of an order. An order state can only
 * be increased. An order status cannot reduce or move backwards.
 * meaning newState > oldState. The only excuse would be a cancelled order.
 * @param  {Object} object containing data sent from 
 * the browser. 
 * @return {[type]}       [description]
 */
OrderController.prototype.redressOrder = function redressOrder (order, orderOwner, status) {
  console.log('Placing order');
  var ot = Q.defer();

  Order.findOne({
    orderId : order.orderId
  })
  .exec(function (err, i) {
    if (err) {
      return ot.reject(err);
    }  
    if (!i) {
      return ot.reject(new Error('order update failed'));
    }
    //if the current order status is greater
    //than the next status, reject the request
    if (i.status > status && status !== -1) {
      return ot.reject(new Error('invalid transaction'));
    }
    i.status = status;
    i.statusLog.push({
      orderStatus: status,
      orderCharge : order.orderCharge
    });
    i.save(function (err, i) {
      return ot.resolve(i);
    });


  });

  // Order.update({
  //   orderId : order.orderId
  // }, {
  //   $set : {
  //     orderStatus: status
  //   }
  // }, function (err, i) {
  //   if (err) {
  //     return ot.reject(err);
  //   }
  //   if (i > 0) {
      
  //     return ot.resolve(i);
  //   }
  //   if (i === 0) {
  //     return ot.reject(new Error('order update failed'));
  //   }
  // });

  return ot.promise;
};


OrderController.prototype.hideOrderItem = function hideOrderItem (orderId) {
  var aladin = Q.defer();

  Order.update({
    orderId : orderId
  },
  {
    $set: {
      orderVisibility: false
    }
  }, function (err, i) {
    if (err) {
      return aladin.reject(err);
    }
    if (i > 0) {
      
      return aladin.resolve(i);
    }
    if (i === 0) {
      return aladin.reject(new Error('order update failed'));
    }
  });

  return aladin.promise;
};

OrderController.prototype.getUserOrders = function getUserOrders (userId, accountType) {
  console.log('Calling getUserOrders');
  var gini = Q.defer();

  if (accountType === 5) {

    orderManager.getFacilityOrders({
      hospitalId: userId
    })
    .then(function (orders) {
      return gini.resolve(orders);
    }, function (err) {
      return gini.reject(err);
    });
  }

  return gini.promise;
};

module.exports = OrderController;