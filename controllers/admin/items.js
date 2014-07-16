
/**
 * Module dependencies.
 */

var Item = require('../../models/item.js').Drug,
    util = require('util');


module.exports.routes = function(app, login){
  var item = new Item();

  app.get('/x/drugs', login.ensureLoggedIn(), function(req, res){
      res.render('index',{
        title: 'Admin :: All Orders'
      });
    }
  );

  app.get('/api/internal/admin/items',function(req, res){

    item.queryAdminDrugs(req.query)
    .then(function(r){
        res.json(200, r);
    }, function (err) {
      res.json(400, err);
    });
  });

};