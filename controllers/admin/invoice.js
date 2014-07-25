
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

  app.route('/api/internal/admin/invoices')
  .get(function(req, res){

    order.queryInvoices(req.query)
    .then(function(r){
        res.json(200, r);
    })
    .fail(function (err) {
      res.json(400, err.message);
    })
    .done();
  });

  //adds an item to an invoice or updates an invoice status.
  app.route('/api/internal/admin/invoices/:invoiceId')
  .delete(function (req, res) {
    order.removeItemInvoice(req.params.invoiceId)
    .then(function () {
      res.json(200, true);
    })
    .fail(function (err) {
      res.json(400, err.message);
    })
    .done();
  })
  .put(function(req, res){

    if (req.query.action === 'update') {

      order.updateInvoice(req.params.invoiceId, req.user._id, req.query.state)
      .then(function(r){
          res.json(200, true);
      }, function (err) {
        res.json(400, err.message);
      });
    }

    if (req.query.action === 'request') {
      var orderData = req.body,
          hospitalId = req.query.hospitalId,
          invoiceId = req.params.invoiceId;

      orderData.status = 2;
      order.requestItemQuotation(orderData, hospitalId)
      .then(function (d) {
        return order.addOneItemInvoice(invoiceId, d);
      })
      .then(function (r) {
        res.json(200, true);
      })
      .fail(function (err) {
        res.json(400, err.message);
      })
      .done();
    }

  });
};