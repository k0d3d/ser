
/**
 * Module dependencies.
 */

var Order = require('../../models/order.js'),
    util = require('util');


module.exports.routes = function(app, login){
  var order = new Order();

  app.get('/x/invoices', login.ensureLoggedIn(), function(req, res){
      res.render('index',{
        title: 'Admin :: All Orders'
      });
    }
  );

  app.get('/api/internal/admin/invoices',function(req, res){

    order.queryInvoices(req.query)
    .then(function(r){
        res.json(200, r);
    })
    .fail(function (err) {
      res.json(400, err.message);
    })
    .done();
  });

  app.put('/api/internal/admin/invoices/:invoiceId',function(req, res){

    order.updateInvoice(req.params.invoiceId, req.user._id, req.query.state)
    .then(function(r){
        res.json(200, true);
    }, function (err) {
      res.json(400, err.message);
    });
  });
};