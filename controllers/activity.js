var Notify = require('../models/postman.js').Notify;

//returns the kind of notifications to 
//be queried for the account level of the
//currently logged in user..
function howWhoGetsNotified (accountType)  {

}
module.exports = function (app) {
  var notify = new Notify();

  app.route('/api/internal/activities')
  .get(function (req, res) {
    var userId = req.user._id,
        accountType = req.user.account_type;
    notify.userStockNotices(userId, accountType)
    .then(function (r) {
      res.json(200, r);
    }, function (err) {
      res.json(400, err);
    });
  })
  .post(function (req, res, next) {

  })
  .delete(function (req, res, next) {

  })
  .put(function (req, res, next) {

  });
}