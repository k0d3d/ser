var Order = require('./order/order.js').Order,
  OrderStatus = require('./order/order.js').OrderStatus,
  Item = require('./item/drug.js').drug,
  _ = require('underscore'),
  //Hospital = require('./organization/hospital.js') ,
  Q = require('q'),
  utilz = require('../lib/utils.js'),
  //EventRegister = require('../lib/event_register').register,
  staffUtils = require('./staff_utils.js'),
  postman = require('./postman'),
  ProcessSMS = require('../lib/sms/process-sms.js'),
  sendEmail = require('../lib/email/sendMail.js'),
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
    
    order.orderDate = orderData.orderDate || Date.now();
    order.save(function (err, i) {
      if (err) {
        return or.reject(err);
      } else {
        return or.resolve(i.toJSON()); 
      }
    });

    return or.promise;
  },
  /**
   * finds all orders that match orderId. 
   * @param  {String | Numbers} orderId the last four digits of the
   * orderId.
   * @return {[type]}         [description]
   */
  findOrderById: function findOrderById (orderId) {
    console.log('Checking order by id...');
    // var doing = Q.defer();

    var rgx = new RegExp('/.*' + orderId + '$/', "i");

    return Order.find({
      orderId: rgx
    })
    .execQ()
    .then(function (res) {
      return res;
    })
    .fail(function (err) {
      return err;
    })
    .done();

    // return doing.promise;
  },
  getOrders: function getOrders (doc) {
    console.log('Attempting to get orders..');
    console.log(doc);
    var query = {
      orderVisibility: true,
      //orderStatus: doc.orderStatus,
    };

    if (!doc.orderStatus) {
      query.status = {$gt: -1};

    }

    if(doc.orderStatus === 'quotes') {
      query.status = {$gt: -1, $lt: 2};
      // query.status = doc.orderStatus;
    } else {
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
    if (doc.displayType === 'count') {
      fields = 'itemId';
    }

    Order.find(_.compactObject(query), fields)
    // .where(doc.where, doc.whrVal)
    .populate('itemId', 'itemName images pharma instantQuote', 'drug')
    // .populate('statusLog', '')
    // .lean()
    //.limit(perPage)
    //.skip(perPage * page)
    .exec(function(err, o) {
      //console.log(err, o);
      if (err){
        return gt.reject(err);
      }else{

        return gt.resolve(_.map(o, function (v) {
          return v.toObject();
        }));
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
        }, 'name userId')
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
    }, 'itemId orderDate')
    .where('status').gte(3)
    .populate('itemId', 'itemName category itemPackaging packageQty supplier currentPrice', 'drug')
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
    Q.longStackSupport = true;
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

        orderManager.getItemSuppliers(__orders)
        .then(function (populatedOrderList) {
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
OrderController.prototype.distUpdateOrder = function(orderData, userId, accountType){
  console.log('Updating order...');
  //Updates the order statuses, these are useful for order history
  //queries, etc
  //Updates the order status 
  var law = Q.defer(),
      __body = _.omit(orderData, ['_id', 'hospitalId', 'itemId', 'statusLog', 'orderSupplier']);
  
      //add the currently logged in
      //user as the person making changes
      //or taking charge of the order.
      __body.orderCharge = (accountType === parseInt(4)) ? userId : undefined;
  var options = {
      $set: __body,
      $push: {
        statusLog: {
          orderStatus: __body.status,
          orderCharge: __body.orderCharge,
          date: Date.now()
        }
      }
    };

  // var noticeData = {
  //   alertType: 'order',
  //   meta : _.extend(
  //   {
  //     hospitalId: orderData.hospitalId.userId,
  //     itemId: orderData.itemId._id
  //   }, 
  //     _.omit(orderData, ['hospitalId', 'itemId'])
  //   )
  // };

  //if the currently logged in user
  //is a staff and is confirming or disputing an order
  // if (parseInt(__body.status) < 4 && accountType === parseInt(4)) {
  //   // options.$set.orderCharge = 
  //   // // options.$push = {
  //   // //   statusLog: {
  //   // //       orderStatus: __body.status,
  //   // //       orderCharge: userId ,
  //   // //       date: Date.now()     
  //   // //   }
  //   // // };
  // }


  //TODO:: use fine and Update instead of update
  //to check for current order status
  //if the order has been confirmed.. it cannot be 
  //replace again, or confirmed again
  //if(__body.status)

  try {
    Order.update({
      'orderId': orderData.orderId
    }, options)
    .exec(function (err, i) {
      if (err) {
        return law.reject(err);
      }

      if (i > 0) {

        //populate hospitalId,
        staffUtils.getMeMyModel(5)
        .findOne({
          userId: orderData.hospitalId.userId,
        }, 'userId name')
        .execQ()
        .then(function (facility_model) {
          orderData.hospitalId = facility_model;

          //populate itemId
          return Item.findOne({
            _id: orderData.itemId._id
          }, 'itemName itemPackaging')
          .execQ();

        })
        .then(function (item_model) {
          //added the populated itemId
          orderData.itemId = item_model;

          var noticeData = {
            alertType: 'order',
            meta : orderData
          };

          // if order has been updates, notify
          // concerned..i.e. hospital
          postman.noticeFn.getConcernedStaff({
            userId: orderData.hospitalId.userId,
            accountType: 5,
            operation: 'user'
          })
          .then(function (listOfRecpt) {
            var tom;
            if (__body.status === 2) {
              tom = 'quotation_request_replied';
            } else {
              tom = 'quotation_request_updated'; 
            }
            // console.log(noticeData);
            return postman.noticeFn.deliveryAgent(
              listOfRecpt, 
              tom,
              noticeData
            );          
          })
          .then(function () {
        
            return law.resolve(__body);
          })
          .catch(function (err) {
            console.log(err.stack);
            return law.reject(err);          
          })
          .done();
        })
        .catch(function (err) {
          console.log(err.stack);
        })       
        .done();
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


// /**
//  * [suppliersTypeahead description]
//  * @method suppliersTypeahead
//  * @param  {[type]} req [description]
//  * @param  {[type]} res [description]
//  * @return {[type]}     [description]
//  */
// var suppliersTypeahead = function(req, res){
//   Supplier.autocomplete(req.param('query'), function(err, suppliers){
//     if (err) return res.render('500');
//      res.json(suppliers);
//   });
// };

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
 * Places a request for quotation to a distributor. 
 * @param  {[type]} orderData  [description]
 * @param  {[type]} orderOwner the user placing the order
 * @return {[type]}            [description]
 */
OrderController.prototype.requestItemQuotation = function requestItemQuotation (orderData, orderOwner) {
  console.log('Placing Items in Cart');
  var procs = Q.defer();

  orderData.itemId = orderData._id || orderData.itemId;
  orderData.perItemPrice = orderData.currentPrice.retail;
  orderData.orderSupplier = {supplierId: orderData.owner.userId, supplier_type: orderData.owner.account_type};
  orderData.hospitalId = orderOwner;
  orderData.statusLog = [{
    orderStatus: 0,
    date : Date.now()
  }];  
  orderData.orderId = utilz.uid(32);
  var order = _.omit(orderData, '_id');
  orderManager.cartOrder(order)
  .then(function (d) {
    //return here makes sure , no notices are 
    //sent.. pilot version hack
    return procs.resolve(d);


    //simple hack to ensure i have the 
    //lastUpdate property. Usually with a find
    //or findOne query, lastUpdate is a virtual.
    d.lastUpdate = Date.now();

    //populate hospitalId,
    staffUtils.getMeMyModel(5)
    .findOne({
      userId: orderOwner
    }, 'userId name')
    .execQ()
    .then(function (facility_model) {
      orderData.hospitalId = facility_model;

      //populate itemId
      return Item.findOne({
        _id: orderData.itemId
      }, 'itemName itemPackaging')
      .execQ();

    })
    .then(function (item_model) {
      //added the populated itemId
      orderData.itemId = item_model;

      var noticeData = {
        alertType: 'order',
        meta : orderData
      };

      postman.noticeFn.getConcernedStaff({
        userId: orderData.owner.userId,
        accountType: orderData.owner.account_type,
        operation: 'organization'
      })
      .then(function (listOfRecpt) {

        return postman.noticeFn.deliveryAgent(
          listOfRecpt, 
          'new_quotation_request',
          noticeData
        );
      })
      .then(function () {
        return procs.resolve(d);
      })
      .catch(function (err) {
        console.log(err.stack);
        return procs.reject(err);
      }); 


    })
    .catch(function (err) {
      console.log(err.stack);
    })
    .done();



    // then return promise which should send messages and 
    // sms and set activity. 
    // arguments : -  recipient, noticeType
    // 
    // postman.noticeFn.checkIfNotified([d], orderOwner, noticeData)
    // .then(function (done) {
    //   //use done to send email and sms
    //   return procs.resolve(d);
    // }, function (err) {
    //   return procs.reject(err);
    // });
    
  }, function (err) {
    return procs.reject(err);
  });

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
OrderController.prototype.addressQuotation = function addressQuotation (order, status, userId, accountType) {
  console.log('Placing order');
  var ot = Q.defer();

  Order.findOne({
    orderId : order.orderId
  })
  // .populate('orderCharge', 'email', 'User')
  .exec(function (err, order_model) {
    if (err) {
      return ot.reject(err);
    }  
    if (!order_model) {
      return ot.reject(new Error('order update failed'));
    }
    //if the current order status is greater
    //than the next status, reject the request
    if (order_model.status > status && status !== -1) {
      return ot.reject(new Error('invalid transaction'));
    }

    order_model.status = status;
    order_model.statusLog.push({
      orderStatus: status,
      orderCharge : order_model.orderCharge,
      date: Date.now()
    });

    order_model.save(function (err, saved_order_model) {

        saved_order_model = saved_order_model.toObject();

        //populate hospitalId,
        staffUtils.getMeMyModel(5)
        .findOne({
          userId: saved_order_model.hospitalId,
        }, 'userId name')
        .execQ()
        .then(function (facility_model) {
          saved_order_model.hospitalId = facility_model;

          //populate itemId
          return Item.findOne({
            _id: saved_order_model.itemId
          }, 'itemName itemPackaging')
          .execQ();

        })
        .then(function (item_model) {
          //added the populated itemId
          saved_order_model.itemId = item_model;
          var noticeData = {
            alertType: 'order',
            meta : saved_order_model
          };

          // if order has been updates, notify
          // concerned..i.e. sales staff,
          // by now, a sales staff should be incharge of the order
          postman.noticeFn.getConcernedStaff({
            userId: saved_order_model.orderCharge || saved_order_model.orderSupplier.supplierId,
            accountType: (saved_order_model.orderCharge) ? 4 : 2,
            operation: (saved_order_model.orderCharge) ? 'user' : 'organization'
          })
          .then(function (listOfRecpt) {
            var tom;
            if (status === 2) {
              tom = 'quotation_accepted';
            } else if (status === -1) {
              tom = 'order_cancelled'; 
            }
            return postman.noticeFn.deliveryAgent(
              listOfRecpt, 
              tom,
              noticeData
            );          
          })
          .then(function () {

            // postman.noticeFn.checkIfNotified([d], userId, noticeData)
            // .then(function (done) {
            //   //use done to send email and sms
            //   return procs.resolve(d);
            // }, function (err) {
            //   return procs.reject(err);
            // });          
            return ot.resolve(saved_order_model);
          })
          .catch(function (err) {
            console.log(err.stack);
            return ot.reject(err);          
          })
          .done();



        })
        .catch(function (err) {
          console.log(err.stack);
        })       
        .done();

      // return ot.resolve(saved_order_model);
    });


  });

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

/**
 * processes an incoming sms request.
 * received an object as argument containing properties
 * to be used in updating an order.
 * 
 *
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
OrderController.prototype.processSMSRequest = function processSMSRequest (body) {
  var bot = Q.defer();
  // prcs = new ProcessSMS(body.Body);

  //find the profile and employer if 
  //its a staff making update
  //
  sendEmail.sendMail({
                to: 'michael.rhema@gmail.com', // list of receivers
                subject: 'DrugStoc Test SMS', // Subject line
                text: body // plaintext body
            })
            .then(function () {
                
                return bot.resolve(1);
                
            })
            .catch(function (err) {
                    
              return bot.reject(err);
            });
  
  //
  //find the order via the order number
  //
  //check if is hospital or staff or distributor
  //
  //update order, 
  //
  //send sms confirmation

  return bot.promise;
};

module.exports = OrderController;