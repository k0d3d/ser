var
    user = require('../../models/user.js');

module.exports.routes = function (app, login) {
  var users = new user.User();

  app.route('/x/users', login.ensureLoggedIn())
  .get(function (req, res) {
    res.render('index');
  });

  app.get('/api/internal/admin/users/search', function (req, res) {
    users.findAUser(req.query)
    .then(function (lst) {
      res.json(200, lst);
    })
    .fail(function (err) {
      res.json(400, err.message);
    })
    .done();
  });

  app.get('/api/internal/admin/users', function (req, res) {
    users.loadAllUsers(req.query)
    .then(function (lst) {
      res.json(200, lst);
    })
    .fail(function (err) {
      res.json(400, err.message);
    })
    .done();
  });


  app.route('/api/internal/admin/users/:userId', login.ensureLoggedIn())
  .post(function (req, res) {
    var userId = req.params.userId;
    users.update(userId, req.body)
    .then(function () {
      res.json(200, true);
    })
    .fail(function (err) {
      res.json(400, err.message);
    });
  })
  .get(function (req, res, next) {
    var userId = req.user._id;
    var account_type = req.user.account_type;
    users.getProfile(userId, account_type).then(function (r) {
      res.json(200, r);
      // res.json(200, _.extend(req.user.toJSON(), r));
      // res.render('user/profile', {
      //   userProfile: r || {},
      //   userData: req.user
      // });
    }, function (err) {
      next(err);
    });
  })
  .put(function (req, res, next){
    var id = req.params.userId;
    var body = {};

    body[req.body.name] = req.body.value;

    if (req.query.action === 'activate') {
      body = {activated: true};
    } else if (req.query.action === 'deactivate') {
      body = {activated: false};
    } else {
      return res.json(400, {message: 'Can not update; no action supplied'});
    }
    users.update(id, body)
    .then(function () {
      res.json(200, true);
    })
    .fail(function (err) {
      console.log(err);
      next(err);
    });
  })
  .delete(function (req, res) {
    if (req.user.isAdmin) {
      users.removeUser(req.params.userId)
      .then(function () {
        res.json(200, true);
      });
    } else {
      res.json(401, 'not auth');
    }
  });

};