var ActivityNotification = require('./activity/notification.js'),
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
  }
},

Notify = function () {

};

Notify.prototype.constructor = Notify;

Notify.prototype.addNotice = function () {

};

Notify.prototype.newOrderNotice = function (owner, orderId, hospitalId) {
  console.log('we in new order notice');
  console.log(arguments);
  var notz = Q.defer(),

  doc = {
    alertType: 'order',
    alertDescription: 'New order placed.',
    hospitalId: hospitalId,
    ownerId: owner.ownerId,
    ownerAccountType: owner.account_type,
    referenceId: orderId
  };

  noticeFn.addBareNotice(doc)
  .then(noticeFn.scrapeChildren)
  .then(function (r) {
    return notz.resolve(r);
  }, function (err) {
    return notz.reject(err);
  });

  return notz.promise;
  //Creates a notice for the item owner first.
  
  //checks for any child staff 
  //creates a notice for children
};



module.exports = Notify;