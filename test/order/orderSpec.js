describe('Order functions and methods and common actions', function () {
  var order = require('../../models/order/order.js').Order;


  it ("should find an orderId that has been shortened", function (done) {

    require('../../lib/db').open()
    .then(function () {

      var testOrderId = "nUHsC6OLFRIdsLGGBNIqjMwbgOniFDP8";
      order.find()
      // .lean()
      .exec(function (err, o) {
        console.log(JSON.stringify(o));
        // console.log(o.orderId);
        expect(o).toBeDefined();
        done();
      });

    })
    .catch(function (e) {
      console.log(e);
    });    


    // expect(true).toBe(true);
    // done();
  }, 10000);
});