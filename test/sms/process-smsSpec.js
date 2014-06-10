describe('Process sms spec', function() {
  
  var Prcs = require('../../lib/sms/process-sms.js'),
      db = require('../../lib/db.js');

  var textBody = '{order}: xxxx-kvZaVF : ACCEPTED';
  var sender = '08126488955';

  it('should process a text string ', function() {

    var prcs = new Prcs(textBody);

    console.log(prcs.parse());

    expect(prcs.parse().orderNo).toBeDefined();

    // expect(true).toBe(true);
  });

  it("should validate the phone number belongs to a registered account", function (done) {
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

  });
});