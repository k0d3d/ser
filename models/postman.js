var ActivityNotification = require('./activity/notification.js'),
    Order = require('./order/order.js').Order,
    staffUtils = require('./staff_utils.js'),
    Distributor = require('./organization/distributor.js'),
    _ = require('underscore'),

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
  getAllPlacedOrders: function getAllPlacedOrders (doc) {
    console.log('Getting placed orders ...');
    var proc = Q.defer();

    Order.find({
      orderStatus : 1,
      "orderSupplier.supplierId" : doc.supplierId
    })
    .exec(function (err, i) {
      if (err) {
        return proc.reject(err);
      }
      return proc.resolve(i);
    })

    return proc.promise;
  },
  fetchUserEmployer: function fetchUserEmployer (doc) {
    var fetch = Q.defer();

    staffUtils.getMeMyModel(doc.accountType).findOne({
      userId: doc.userId
    }, 'employer')
    .exec(function (err, i) {
      if (err) {
        return fetch.reject(err);
      }
      if (i) {
        return fetch.resolve(i);
      }
    });

    return fetch.promise;
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

    function __check (){
      console.log('Running checks...');
      var task = obj.pop(),

      //Create special referenceId
      str = noticeData.alertType;
      str += userId;
      str += task[noticeData.timeStamp].getTime();
      str += task._id;
      console.log(str);

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
          an.alertType =  noticeData.alertType;
          an.alertDescription = noticeData.alertDescription;
          an.referenceId = str;
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
      __check();
    }

    return ifn.promise;
  },
  poppedMedFac: function poppedMedFac (obj) {
    var poper = Q.defer(), newObj = [];
    console.log(obj);

    function __curios () {
      var task = obj.pop();

      staffUtils.getMeMyModel(5)
      .findOne({
        userId: task.hospitalId
      }, 'name')
      .lean()
      .exec(function (err, i) {
        console.log(err, i);
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
    }

    __curios();

    return poper.promise;
  }

},

NotifyController = function () {
 
};

NotifyController.prototype.constructor = NotifyController;


NotifyController.prototype.myOrderNotices = function (userId, accountType) {
  var mine = Q.defer(),
    noticeData = {
      alertType: 'order',
      alertDescription: 'New Order Placed',
      timeStamp: 'orderDate',
      meta : ['orderId', 'hospitalId']
    },
    user;

  //No order notices for account level 5
  //i.e. hospitals
  if (accountType > 4) {
    mine.resolve({});
    return mine.promise;
  }

  function __getPlaced () {

    noticeFn.getAllPlacedOrders({
      supplierId : user
    })
    .then(function (distOrders) {
      //Create activity entries
      noticeFn.checkIfNotified(distOrders, userId, noticeData)
      .then(function (v) {
        //lets populate the hospital data
        noticeFn.poppedMedFac(v)
        .then(function (poppedResult) {
          return mine.resolve(poppedResult);
        }, function (err) {
          //Some error populating hospitals
          return mine.reject(err);
        });
      }, function (err) {
        return mine.reject(err);
      });

    });
  }

  if (accountType > 2 && accountType < 5) {
    //lets get the employerId for any account 
    //that isnt a staff or distributor manager
    noticeFn.fetchUserEmployer({
      userId: userId,
      accountType: accountType
    })
    .then(function (id) {
      user = id.employer[0].employerId;
      __getPlaced();
    }, function (err) {
      return mine.reject(err);
    });
  } else {
    user = userId;
    __getPlaced();
  }


  return mine.promise;
};


module.exports.Notify = NotifyController;