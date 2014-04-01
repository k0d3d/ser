describe("New Order Notification", function () {

  var Activity = require('../../models/activity.js'),
      Hospital = require('../../models/organization/hospital.js'),
      Owner = require('../../models/organization/distributor.js'),
      Order = require('../../models/order/order.js').Order,
      db = require('../../lib/db.js');


  it("should add a new order activity to the notification", function (done) {
    db.open()
    .then(function () {
      try {
        var hospital = new Hospital(), 
            owner = new Owner(), 
            order = new Order();
      }catch(e){
        console.log(e.stack);
      }


      var activity = new Activity();
      activity.newOrderNotice(owner._id, order._id, hospital._id)
      .then(function (r) {
        expect(r).toBeDefined();
        expect(r._id).toBeDefined();
        done();
      })
      .catch(function (err) {
        console.log(err.stack);
      });

    });
  });

});