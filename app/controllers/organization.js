
module.exports.routes = function (app, auth) {
  app.get('/organization', function (req, res) {

    res.render('index', {
      userData: req.user
    });
  });
}