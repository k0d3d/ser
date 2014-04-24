var Notify = require('../models/postman.js').Notify;
var _ = require('lodash');

//returns the kind of notifications to 
//be queried for the account level of the
//currently logged in user..
function howWhoGetsNotified (accountType)  {
  var list = {
    '2' : ['myOrderNotices', 'userStockNotices'],
    '4' : ['myOrderNotices', 'userStockNotices']
  };

  return list[accountType];
}
module.exports = function (app) {
  var notify = new Notify();

  app.route('/api/internal/activities')
  .get(function (req, res) {
    var userId = req.user._id,
        accountType = req.user.account_type,
        noticesBulk = [],
        tasksList = howWhoGetsNotified(accountType);

    function __queueNotices () {
      var task = tasksList.pop();
      notify[task](userId, accountType)
      .then(function (r) {
        _.each(r, function (v) {
          noticesBulk.push(v);
        });
        if (tasksList.length) {
          __queueNotices();
        } else {
          res.json(200, noticesBulk);
        }
      }, function (err) {
        res.json(400, err);
      });
    }


    __queueNotices();

    // notify.userStockNotices(userId, accountType)
    // .then(function (r) {
    //   res.json(200, r);
    // }, function (err) {
    //   res.json(400, err);
    // });
  })
  .post(function (req, res, next) {

  })
  .delete(function (req, res, next) {

  })
  .put(function (req, res, next) {

  });
}