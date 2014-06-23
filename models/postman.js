var ActivityNotification = require('./activity/notification.js'),
    Order = require('./order/order.js').Order,
    OrderStatus = require('./order/order.js').OrderStatus,
    staffUtils = require('./staff_utils.js'),
    df = require('./item.js').drugsFunctions,
    Distributor = require('./organization/distributor.js'),
    _ = require('underscore'),
    u = require('../lib/utils.js'),
    Q = require('q'),
    config = require('config'),
    sendEmail = require('../lib/email/sendMail.js').sendHTMLMail,
    sendSms = require('../lib/sms/smsSend.js'),
    messageStrings = require('../lib/message-strings.js'),
    lingua = require('lingua'),

noticeFn = {

  addUserNotice : function addBareNotice (userId, noticeData) {
    console.log('Called bare notice');
    var _n = Q.defer();

    //specify owner of notice,
    var note = new ActivityNotification();
    note.ownerId = userId;
    note.alertType = noticeData.alertType;
    note.alertDescription = noticeData.alertDescription;
    note.created = Date.now();
    note.meta = noticeData.meta;
    note.save(function(err) {
      if (err) {
        return _n.reject(err);
      }
      return _n.resolve(true);
    });
    //save notice..
    return _n.promise;
  },
  /**
   * gets all orders placed to a certain supplier / distributor
   * @param  {[type]} doc [description]
   * @return {[type]}     [description]
   */
  getOrderStatuses: function getOrderStatuses (doc) {
    console.log('Getting orders statuses...');
    var proc = Q.defer();

    var options = {
      status : {$gte : 0 }
    };

    if (doc.hospitalId) {
      options.hospitalId = doc.hospitalId;
    }

    if (doc.supplierId) {
      options["orderSupplier.supplierId"] = doc.supplierId;
    }


    Order.find(options)
    //.lean()
    .exec(function (err, i) {
      console.log('gotten order status result...');
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
  /**
   * uses staff_utils.js to query the list of users
   * connected to an account. Its primarily used to send 
   * notifications out. For instance, if you query the managers
   * and staff belonging to a distributor or staffs under a manager.
   * 
   * 
   * @param  {object} doc Object containing userId and accountType 
   * properties and also an operation property which determines what 
   * users are concerned (the operation to carry out) .
   * @return {object}     Promise object
   */
  getConcernedStaff: function getConcernedStaff (doc) {
    var dfr = Q.defer();
    var listOfRecpt = [];
    
    console.log('Getting concerned staff...');
    if (doc.operation === 'organization') {    //list of employees
          staffUtils.getMyPeople(doc.userId, doc.accountType)
          .then(function (peps) {
    
    
            //list of managers 
            if (peps.managers) {
              _.each(peps.managers, function (v) {
                listOfRecpt.push({
                  userId: v.userId, 
                  name: v.name,
                  phone: v.phone
                });
              });
            }
    
            //list of staffs 
            if (peps.staff) {
              _.each(peps.staff, function (v) {
                listOfRecpt.push({
                  userId: v.userId, 
                  name: v.name,
                  phone: v.phone
                });
              });
            }
    
            //get the employers profile
            staffUtils.getMeMyModel(doc.accountType)
            .findOne({
              userId: doc.userId
            })
            .populate('userId', 'email account_type allowedNotifications approvedNotices', 'User')
            // .lean()
            .exec(function (err, md) {
              if (err) {
                return dfr.reject(err);
              }
    
    
              listOfRecpt.push({
                  userId: md.userId, 
                  name: md.name,
                  phone: md.phone,            
                });
              return dfr.resolve(listOfRecpt);
            });
    
    
            // return procs.resolve(d);
          }, function (err) {
            return dfr.reject(err);
          });
    }

    if (doc.operation === 'user') {
      staffUtils.getMeMyModel(doc.accountType)
      .findOne({
        userId: doc.userId
      })
      .populate('userId', 'email account_type allowedNotifications approvedNotices', 'User')
      // .lean()
      .exec(function (err, i) {
        if (err) {
          return dfr.reject(err);
        }

        if (i) {
          // listOfRecpt.push({
          //   userId: i.userId, 
          //   allowedNotifications: i.allowedNotifications, 
          //   name: i.name,
          //   phone: i.phone,            
          //   approvedNotices: i.approvedNotices
          // });
          listOfRecpt.push({
              userId: i.userId, 
              name: i.name,
              phone: i.phone,            
            });          

          dfr.resolve(listOfRecpt);
        } else {
          dfr.resolve([]);
        }
      });      
    }

    return dfr.promise;
  },
  /**
   * Send out / delivers notifications to individual
   * stoc-cloud users. It uses the 'allowedNotifications'
   * property on the user's profile to determine what mediums to send to.
   * it second argument also specifies the kind of message 
   * to deliver.
   * 
   * @param  {Array} listOfRecpt   List of users to send messages to.
   * should contain a populated userId {email, ObjectId and account_type}.
   * All objects must contain 'allowedNotifications' and 'approvedNotices' property.
   * @param  {String} typeOfMessage The type of message to deliver or send out.
   * @param {Object} noticeData object {alertType, alertDescription, meta} containing the alert type , alert description, 
   * and meta data (i.e. the object to be used in creating the alert )- properties.
   * @return {Promise}               Returns Promise
   */
  deliveryAgent : function deliveryAgent (listOfRecpt, typeOfMessage, noticeData) {
    var da = Q.defer();
    da.longStackSupport = true;
    var self = this;
    // var allowed_defaults = {
    //   email : {type: Boolean, default: true},
    //   sms : {type: Boolean, default: false},
    //   portal: {type: Boolean, default: true},
    //   mobile: {type: Boolean, default: false}        
    // };    
    // console.log(doc);
    // da.resolve();
    // return da.promise;

    // var noticeData

    function __pushMessages () {

      var task = listOfRecpt.pop();
      console.log(task);
      var allowedEmail = ( typeof task.userId.allowedNotifications.email !== 'undefined') ? 
        task.userId.allowedNotifications.email : 
        false;
      var allowedSMS = ( typeof task.userId.allowedNotifications.sms !== 'undefined') ? 
        task.userId.allowedNotifications.sms : 
        false;
      var allowedPortal = ( typeof task.userId.allowedNotifications.portal !== 'undefined') ? 
        task.userId.allowedNotifications.portal : 
        false;

      //task here is a user object.
      //
      //lets try sending an email. if the 
      //user allows emails.
      if (allowedEmail) {
        var to =  function (email, alt_email) {
          //if the primary email address 
          //is a drugstoc email address
          if (email.indexOf("@drugstoc.ng") > 0) {
            //check if user has an alternative email address
            if (alt_email) {
              return alt_email;
            } else {
              return config.mail.defaultNoEmail;
            }
          } else {
            return email;
          }
        };

        //if his email is on file.. 
        //just a check.. he def has 
        //to have an email.
        if (task.userId.email) {
          //send an email.
          sendEmail({
            to: to(task.userId.email, task.alt_email) ,
            // to: task.userId.email,
            // subject: "new quotation request",
            subject: messageStrings(typeOfMessage + '.email.subject', {meta: noticeData.meta, user: task, statuses: config.app.statuses}),
            // text: "you have received a new quotation request"
            // text: messageStrings(typeOfMessage + '.email.message', {meta: noticeData.meta, user: task})
          }, 'views/templates/email-templates/order-note.jade', {meta: noticeData.meta, user: task, statuses: config.app.statuses})
          .then(function (done) {
            //just wanna log to console for now..
            //TODO:: log to file 
            console.log(done);
          },  function (err) {
            //log to file later
            console.log(err.stack);
          });
        }



      } else {
        console.log('email not sent: %s', task.userId.email);
      }
      //try sending sms
      if (allowedSMS) {
        if (task.phone) {
          
          sendSms.sendSMS(messageStrings(typeOfMessage + '.sms.message', {meta: noticeData.meta, user: task}), task.phone)
          .then(function (done) {
            //just wanna log to console for now..
            //TODO:: log to file 
            console.log(done);
          },  function (err) {
            //log to file later
            console.log(err.stack);
          });          
        }
      } else {
        console.log('sms not sent: %s', task.userId.email);
      }

      if (allowedPortal) {
        noticeData.alertDescription = messageStrings(typeOfMessage + '.portal.message', {meta: noticeData.meta, user: task});
        self.addUserNotice(task.userId._id, noticeData)
        .then(function () {
            console.log('sent to: ' + task.userId.email);

            if (listOfRecpt.length) {
              process.nextTick(__pushMessages);
            } else {
              return da.resolve();
            }
        }, function (err) {
          console.log('Error saving new notice');
          console.log(err.stack);
        });
      } else {
        console.log('portal not sent for: ' + task.userId.email);
      }

      //when all is done, let see if
      //we can continue or we'll just end..
      if (listOfRecpt.length) {
        process.nextTick(__pushMessages);
      } else {
        return da.resolve();
      }
    }

    //INIT / START sending
    //if there are no recepients,
    //lets send back an empty object.
    //before starting
    if (listOfRecpt.length === 0) {
      da.resolve([]);
    } else {
      //OK lets start since we have recepients
      //
      try {
        __pushMessages();
      } catch (e) {
        //anything goes wrong.
        //we end and reject the 
        //promise.
        da.reject(e);
        console.log(e.stack);
      }
    }

    return da.promise;
  },  
  getUpdateDescription: function getUpdateDescription (key, kind) {
    var phrases = {
      order: {
        '0' : 'new quotation request',
        '1' : 'an order has been placed',
        '2' : 'an order quote has been accepted',
        '3' : 'an order has been confirmed',
        '4': 'order in transit',
        '5': 'order supplied',
        '6': 'order paid',
        '-1': 'order cancelled'
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
      var task = obj.pop();
      var ts = new Date(task[noticeData.timeStamp]);

      //Create special referenceId
      var str = noticeData.alertType;
      str += userId;
      str += ts.getTime();
      str += task.check || task.status;
      str += task._id;
      //console.log(str);
      // console.log(task);

      var meta = _.pick(task, noticeData.meta);

      //remove unwanted props from this object

      //Find the event
      ActivityNotification.findOne({
        referenceId: str
      })
      .limit(50)
      .sort('-created')
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
  /**
   * finds all notifications belonging to a user. 
   * @param  {[type]} userId     [description]
   * @param  {[type]} noticeData [description]
   * @return {[type]}            [description]
   */
  findUserNotices: function findUserNotices (userId, noticeData) {
    console.log('Finding user notices...');
    var ri = Q.defer();
    ActivityNotification.find({
      ownerId: userId
    })
    .sort('-created')
    .limit(50)
    .lean()
    // .populate('meta.itemId', 'itemName itemPackaging', 'drug')
    .exec(function (err, i) {
      if (err) {
        return ri.reject(err);
      }
      if (i) {
        return ri.resolve(i);
      }
    });

    return ri.promise;
  },

  /**
   * [poppedMedFac description]
   * @param  {[type]} obj [description]
   * @param {string} key a string value used to select
   * the field on obj to be used in querying userId 
   * on the facility collection.
   * @return {[type]}     [description]
   */
  poppedMedFac: function poppedMedFac (obj, key) {
   console.log('Adding Med Facilities to Object'); 
    var poper = Q.defer(), newObj = [];
    //console.log(obj);

    function __curios () {
      var task = obj.pop();
      //some times, the meta information stored
      //might already be populated with, relevant
      //fields, we want to check , if we have
      //an objectId or populated object
      if (u.testIfObjId(u.strToObj(task, key))) {

        try {
          staffUtils.getMeMyModel(5)
          .findOne({
            userId: u.strToObj(task, key)
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
      } else {
        //we have an object most likely.
        //we'll just attach the populated data to a 
        //hospital property and push in the task object all
        //the same..
        task.hospital = u.strToObj(task, key);
        newObj.push(task);
        if (obj.length) {
          __curios();
        } else {
          return poper.resolve(newObj);
        }        
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
    console.log('Getting placed orders...');
    // var options = {};

    // if (doc.hospitalId) {
    //   options.hospitalId = doc.hospitalId;
    // }

    // if (doc.supplierId) {
    //   options.supplierId = doc.supplierId;
    // }

    // var obj = _.extend(options, doc);
    // console.log(doc, obj);

      //Create activity entries
      noticeFn.findUserNotices(doc.userId, doc.noticeData)
      .then(function (v) {
        
        return mine.resolve(v);
        // if (doc.noticeData.alertType === 'order') {
        //   //lets populate the hospital data
        //   noticeFn.poppedMedFac(v, 'meta.hospitalId')
        //   .then(function (poppedResult) {

        //     return mine.resolve(poppedResult);
        //   }, function (err) {
        //     console.log(err.stack);
        //     //Some error populating hospitals
        //     return mine.reject(err);
        //   })
        //   .catch(noticeFn.logError);
        // }


      }, function (err) {
        return mine.reject(err);
      })
      .catch(noticeFn.logError);

    return mine.promise;
  },
  bulkPost: function bulkNotice (obj, noticeData ) {
    var qu = Q.defer();

    
    return qu.promise;
  },
  logError: function logError (err){
    console.trace(err);
  }

},

PostmanController = function () {
  Q.longStackSupport = true;
};

PostmanController.prototype.constructor = PostmanController;

/**
 * get
 * @param  {[type]} userId      [description]
 * @param  {[type]} accountType [description]
 * @return {[type]}             [description]
 */
PostmanController.prototype.myOrderNotices = function (userId, accountType) {
  console.log('Fetching my order notices...');
  var mine = Q.defer(),
    noticeData = {
      alertType: 'order',
    };
  //order notices for account level 5
  //i.e. hospitals
  if (accountType > 4) {
    console.log('bcos no orders for u');
    noticeFn.__getPlaced({
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

  if (accountType > 2 && accountType < 5) {
    console.log('staff or manager detected');
    //lets get the employerId for any account 
    //that isnt a staff or distributor manager
    noticeFn.fetchUserEmployer({
      userId: userId,
      accountType: accountType
    })
    .then(function (id) {
      //user = ;
      try {

        noticeFn.__getPlaced({
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
  } else if (accountType === 2) {
    noticeFn.__getPlaced({
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
PostmanController.prototype.userStockNotices = function (userId, accountType) {
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

module.exports.noticeFn = noticeFn;
module.exports.Notify = PostmanController;