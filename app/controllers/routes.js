var login = require('connect-ensure-login');

module.exports = function(app, passport, auth) {
    //User Routes
    var users = require('./users');
    users.routes(app, passport, auth);
    //Hospital Routes
    var hospital = require('./hospitals');
    hospital.routes(app, auth);
    //Supplier Routes
    var supplier = require('./suppliers');
    supplier.routes(app, auth);
    //Drug Routes
    var drug = require('./drugs');
    drug.routes(app, auth);
    //Orders Routes
    var order = require('./orders');
    order.routes(app, auth);
    //Organization
    var organization = require('./organization');
    organization.routes(app, auth);

    //File upload handler/controller
    var fileupload = require('./upload');
    fileupload(app);

    //Minimal middleware that adds 
    //logged in user details to view
    // app.get('/*', function (req, res, next) {
    //   if (req.user) {
    //     console.log(req.user);
    //     res.locals.userData = req.user;
    //   }
    //   next();
    // })

    //Home route
    app.get('/', login.ensureLoggedIn('/signin'),  function(req, res){
      res.render('index',{
        title: 'Dashboard',
        userData: req.user
      });
    });

    app.get('/home/index', login.ensureLoggedIn(), function(req, res){
      res.render('home/index',{
        title: 'Dashboard'
      });
    });

    app.get('/partials/:name', function (req, res) {
      var name = req.params.name;
      res.render('partials/' + name);
    });

    // home route
    app.get('/:parent/:child', function(req, res){
      var parent = req.params.parent;
      var child = req.params.child;
      res.render(parent+'/'+child, {
        userData: req.user
      });
      //res.render('/');
    });    

};
