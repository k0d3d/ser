module.exports = function(app, passport, auth) {
    //User Routes
    var users = require('../app/controllers/users');
    users.routes(app, passport, auth);
    //Hospital Routes
    var hospital = require('../app/controllers/hospitals');
    hospital.routes(app, passport, auth);
    //Supplier Routes
    var supplier = require('../app/controllers/suppliers');
    supplier.routes(app);
    //Drug Routes
    var drug = require('../app/controllers/drugs');
    drug.routes(app);
    //Orders Routes
    var order = require('../app/controllers/orders');
    order.routes(app);


    //Home route
    app.get('/', function(req, res){
      res.render('index',{
        title: 'Dashboard'
      });
    });

    app.get('/home/index', function(req, res){
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
      res.render(parent+'/'+child);
      //res.render('/');
    });    

};
