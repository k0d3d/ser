var ActivityNotification = require('./activity/notification.js'),
    Order = require('./order/order.js').Order,
    OrderStatus = require('./order/order.js').OrderStatus,
    staffUtils = require('./staff_utils.js'),
    df = require('./item.js').drugsFunctions,
    Distributor = require('./organization/distributor.js'),
    _ = require('underscore'),
    u = require('../lib/utils.js'),
    Q = require('q'),

noticeFn = {
  addBareNotice : function addBareNotice (doc) {
    console.log('Called bare notice');

    var _notice = Q.defer();
    try {
      var notice = new ActivityNotification(doc);

      notice.save(function (err, i) {
        console.log(err, i);
        if (err) {
          return _notice.reject(err);
        }
        return _notice.resolve(i);
      });
    } catch (e) {
      console.log(e);
    }



    return _notice.promise;
  },
  searchForStaff : function searchForStaff(doc) {
    var search = Q.defer();



    return search.promise;
  },
  /**
   * gets all orders placed to a certain supplier / distributor
   * @param  {[type]} doc [description]
   * @return {[type]}     [description]
   */
  getOrderStatuses: function getOrderStatuses (doc) {
    console.log('Getting placed orders ...');
    var proc = Q.defer();

    Order.find({
      status : {$gt : 0 },
      "orderSupplier.supplierId" : doc.supplierId
    })
    .exec(function (err, i) {
      if (err) {
        return proc.reject(err);
      }
      return proc.resolve(i);
    });

    return proc.promise;
  },
  fetchUserEmployer: function fetchUserEmployer (doc) {
    var fetch = Q.defer();

    staffUtils.getMeMyModel(doc.accountType).findOne({
      userId: doc.userId
    }, 'employer')
    .exec(function (err, i) {
      //console.log(err, i);
      if (err) {
        return fetch.reject(err);
      }
      if (i) {
        return fetch.resolve(i);
      }
    });

    return fetch.promise;
  },
  getUpdateDescription: function getUpdateDescription (key, kind) {
    var phrases = {
      order: {
        '0' : 'new order placed',
        '1' : 'an order has been placed',
        '2' : 'an order is in dispute',
        '3' : 'an order has been confirmed'
      },
      stockup: {
        '0' : 'new stock up request',
        '1' : 'request has been granted',
        '-1': 'request has been cancelled'
      },
      stockdown: {
        '0' : 'new stock down request',
        '1' : 'request has been granted',
        '-1': 'request has been cancelled'
      }
    };
    console.log(phrases[kind][key]);
    return phrases[kind][key];
  },
  /**
   * checks if a notification has been generated for an event.
   * it uses the an event type property, a time stamp, the eventId 
   * and the currently logged in user as an identification. 
   * If the event is found, it skips over creating a notification. 
   * 
   * Else it creates a new notification.
   * @param  {Object} obj this is an array of results from a query of 
   * events.eg. A query for orders placed to a certain supplier. 
   * @param  {ObjectId} userId the objectId (userId) of the currently logged
   * in user.
   * @param {Object} noticeData the object containing type of event being checked.
   * @return {Object}     Promise Object
   */
  checkIfNotified: function checkIfNotified (obj, userId, noticeData) {
    console.log('Checking Notifications...');
    var ifn = Q.defer(), createdNotices = [];


    //console.log(noticeData);
    function __check (){
      console.log('Running checks...');
      var task = obj.pop(),

      //Create special referenceId
      str = noticeData.alertType;
      str += userId;
      str += u.strToObj(task, noticeData.timeStamp).getTime();
      str += task.check || task.status;
      str += task._id;
      //console.log(str);
      //console.log(task);

      var meta = _.pick(task, noticeData.meta);

      //remove unwanted props from this object

      //Find the event
      ActivityNotification.findOne({
        referenceId: str
      })
      .exec(function (err, eventNotice){
        console.log('After notice check');
        if (err) {
          return ifn.reject(err);
        }
        //If found
        if (eventNotice) {
          console.log('found notices..cool');
          //Lets push it in as an event (activity)
          createdNotices.push(eventNotice.toJSON());
          //Do Nothing, just check if there's 
          //still a task to run the check for
          if (obj.length) {
            __check();
          } else {
            //If no task, resolve.
            return ifn.resolve(createdNotices);
          }
        } else {
          console.log('Notice not found, creating new notice');
          //If no event notice is found,
          //lets create a new one using the id
          var an = new ActivityNotification(meta);
          an.alertType = noticeData.alertType;
          an.alertDescription = noticeFn.getUpdateDescription(task.status, noticeData.alertType);
          an.referenceId = str;
          an.created = task[noticeData.timeStamp];
          an.save(function (err, noticed) {
            if (err) {
              return ifn.reject(err);
            }
            createdNotices.push(noticed.toJSON());
            //Checks if we still got task.
            if (obj.length) {
              __check();
            } else {
              //If no task, resolve.
              return ifn.resolve(createdNotices);
            }
          });
        }
      });
    }

    //Start the check
    if (!obj.length) {
      ifn.resolve([]);
      return ifn.promise;
    } else {
      try {
        __check();
      }catch (e) {
        console.log(e);
      }
      // __check();
    }

    return ifn.promise;
  },
  poppedMedFac: function poppedMedFac (obj) {
   console.log('Adding Med Facilities to Object'); 
    var poper = Q.defer(), newObj = [];
    //console.log(obj);

    function __curios () {
      var task = obj.pop();
      console.log(task);
      try {
        staffUtils.getMeMyModel(5)
        .findOne({
          userId: task.hospitalId
        }, 'name')
        .lean()
        .exec(function (err, i) {
          //console.log(err, i);
          if (err) {
            return poper.reject(err);
          }

          if (i) {
            task.hospital = i;
            newObj.push(task);
            if (obj.length) {
              __curios();
            } else {
              return poper.resolve(newObj);
            }
          } else {
            return poper.reject(new Error('cant find hospitals'));
          }

        });
      } catch (e) {
        console.log(e);
      }
    }

    if (obj.length) {
      __curios();
    } else {
      poper.resolve([]);
      return poper.promise;
    }

    return poper.promise;
  },
  __getPlaced:   function __getPlaced (doc) {
    var mine = Q.defer();
    console.log('Getting placed distributor orders...');
    noticeFn.getOrderStatuses({
      supplierId : doc.distributorId
    })
    .then(function (distOrders) {
      //Create activity entries
      noticeFn.checkIfNotified(distOrders, doc.userId, doc.noticeData)
      .then(function (v) {
        // console.log(v);
        //lets populate the hospital data
        noticeFn.poppedMedFac(v)
        .then(function (poppedResult) {
          return mine.resolve(poppedResult);
        }, function (err) {
          //Some error populating hospitals
          return mine.reject(err);
        })
        .catch(noticeFn.logError);
      }, function (err) {
        return mine.reject(err);
      })
      .catch(noticeFn.logError);

    })
    .catch(function (err) {
      console.log(err);
    });

    return mine.promise;
  },
  logError: function logError (err){
    console.trace(err);
  }

},

NotifyController = function () {
 
};

NotifyController.prototype.constructor = NotifyController;

/**
 * get
 * @param  {[type]} userId      [description]
 * @param  {[type]} accountType [description]
 * @return {[type]}             [description]
 */
NotifyController.prototype.myOrderNotices = function (userId, accountType) {
  console.log('Fetching my order notices...');
  var mine = Q.defer(),
    noticeData = {
      alertType: 'order',
      alertDescription: 'New Order Placed',
      timeStamp: 'lastUpdate',
      meta : ['orderId', 'hospitalId']
    };

  //No order notices for account level 5
  //i.e. hospitals
  if (accountType > 4) {
    mine.resolve({});
    return mine.promise;
  }

  if (accountType > 2 && accountType < 5) {
    console.log('staff or manager detected');
    //lets get the employerId for any account 
    //that isnt a staff or distributor manager
    noticeFn.fetchUserEmployer({
      userId: userId,
      accountType: accountType
    })
    .then(function (id) {
      console.log(id.employer);
      //user = ;
      try {

        noticeFn.__getPlaced({
          distributorId: id.employer.employerId,
          userId: userId,
          noticeData: noticeData
        })
        .then(function (poppedResult) {
          return mine.resolve(poppedResult);
        }, function (err) {
          //Some error populating hospitals
          return mine.reject(err);
        })
        .catch(function (err) {
          console.log(err);
        });

      } catch (e) {
        console.log(e);
      }
      
    }, function (err) {
      return mine.reject(err);
    });
  } else {
    noticeFn.__getPlaced({
      distributorId: userId,
      userId: userId,
      noticeData: noticeData
    })
    .then(function (poppedResult) {
      return mine.resolve(poppedResult);
    }, function (err) {
      //Some error populating hospitals
      return mine.reject(err);
    })
    .catch(function (err) {
      console.log(err);
    });    
  }


  return mine.promise;
};


/**
 * [userStockNotices description]
 * @return {[type]} [description]
 */
NotifyController.prototype.userStockNotices = function (userId, accountType) {
  var oops = Q.defer(), ntx = [];

  //
  //should check if any of these
  //activity notices has been or 
  //hasnt been created and return 
  //activities that havent been created
  // function __isNotified (obj, alert) {
  //   var koolio = Q.defer();

  //   var noticeData = {
  //     alertType: 'order',
  //     alertDescription: 'New Order Placed',
  //     timeStamp: 'orderDate',
  //     meta : ['orderId', 'hospitalId']
  //   };
  //   var task = obj.pop();


  //   return koolio.promise;
  // }

  //find all stock transactions concerning you..
  //
  //lets try and find out what to query for who
  //
  //as a distributor
  if (accountType < 4){
    //distributors get stockup request (internally)
    //and stocdown request from managers and staff
    
    df.getUserStockUpRequest({
      userId: userId,
      accountType: accountType
    })
    .then(function (done) {
      console.log(done);
      //check the 'done' for
      //stockup request notices

      var noticeData = {
          alertType: 'stockup',
          timeStamp: 'dateInitiated',
          meta : ['originId', 'destId']
      };

      return noticeFn.checkIfNotified(done, userId, noticeData);

    })
    .then(function (notices) {
      console.log(notices);
      _.each(notices, function (val) {
        ntx.push(val);
      });
      return df.getUserStockDownRequest({
        userId: userId,
        accountType: accountType
      });
    })
    .then(function (done) {
      //check the 'done' for
      //stockdown request notices

      var noticeData = {
          alertType: 'stockdown',
          timeStamp: 'dateInitiated',
          meta : ['originId', 'destId']
      };

      return noticeFn.checkIfNotified(done, userId, noticeData);

    })    
    .then(function (notices) {

      _.each(notices, function (val) {
        ntx.push(val);
      });
      oops.resolve(ntx)      ;
    })
    .catch(function (err) {
      oops.reject(err);
      console.log(err);
    });
  }

  //as a manager
  if (accountType === 4) {
    //staff get request to stock up from distributors and managers
    //
    df.getUserStockUpRequest({
      userId: userId,
      accountType: accountType
    })
    .then(function (done) {
      console.log('After user stock down..');
      console.log(done);
      //check the 'done' for
      //stockup request notices

      var noticeData = {
          alertType: 'stockup',
          timeStamp: 'dateInitiated',
          meta : ['originId', 'destId']
      };

      return noticeFn.checkIfNotified(done, userId, noticeData);

    })
    .then(function (notices) {
      console.log(notices);
      _.each(notices, function (val) {
        ntx.push(val);
      });
      return df.getUserStockDownRequest({
        userId: userId,
        accountType: accountType
      });
    })
    .then(function (done) {
      //check the 'done' for
      //stockdown request notices

      var noticeData = {
          alertType: 'stockdown',
          timeStamp: 'dateInitiated',
          meta : ['originId', 'destId']
      };

      return noticeFn.checkIfNotified(done, userId, noticeData);

    })    
    .then(function (notices) {

      _.each(notices, function (val) {
        ntx.push(val);
      });
      oops.resolve(ntx)      ;
    })
    .catch(function (err) {
      oops.reject(err);
      console.log(err);
    });
  }




  //check if you've created notices
  //generate notices
  //format notices
  //send out notices
  //
  //
  
  return oops.promise;

};


module.exports.Notify = NotifyController;