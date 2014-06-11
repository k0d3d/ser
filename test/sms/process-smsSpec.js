describe('Process sms spec', function() {
  
  var Prcs = require('../../lib/sms/process-sms.js'),
      db = require('../../lib/db.js');

  var textBody = '#RffZnr #S9UwCj #S9UwCj';
  var sender = '+2348126488955';

  it('should process a text string ', function() {

    var prcs = new Prcs(textBody);

    console.log(prcs.parse());

    expect(prcs.parse().length).toBeGreaterThan(0);

    // expect(true).toBe(true);
  });

  xit("should validate the phone number belongs to a registered account", function (done) {
    var prcs = new Prcs(textBody);

    db.open()
    .then(function () {
      
      prcs.checkPhoneNumber(sender)
      .then(function (rdoc) {
        console.log(rdoc);
        expect(rdoc).toBeDefined();
        done();
      }, function (err) {
        console.log(err);
        expect(err).toBeDefined();
        done();
      });

    });

  }, 20000);
});