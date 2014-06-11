describe('Process sms spec', function() {
  
  var Prcs = require('../../lib/sms/process-sms.js'),
      Order = require('../../models/order.js'),
      User = require('../../models/user/user.js'),
      db = require('../../lib/db.js');

  var textBody = '#RffZnr #S9UwCj #S9UwCj';
  var sender = '+2348126488955';
  var body = {
              "ToCountry":"US",
              "ToState":"ID",
              "SmsMessageSid":"SMb4a4cbb1c31985bb429ee30a199e4f63",
              "NumMedia":"0",
              "ToCity":"MT HOME",
              "FromZip":"",
              "SmsSid":"SMb4a4cbb1c31985bb429ee30a199e4f63",
              "FromState":"",
              "SmsStatus":"received",
              "FromCity":"",
              "Body":"#npzkui",
              "FromCountry":"NG",
              "To":"+12086960938",
              "ToZip":"83647",
              "MessageSid":"SMb4a4cbb1c31985bb429ee30a199e4f63",
              "AccountSid":"ACee9332ba9fa2eb4becb6eb25e8a9f1eb",
              "From":"+2348126488955",
              "ApiVersion":"2010-04-01"
            }

  xit('should process a text string ', function() {

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

  it('should check if a request string contains a valid order update and process it ', function(done) {
    var order = new Order();

    db.open()
    .then(function () {
      
      order.processSMSRequest(body)
      .then(function (rdoc) {
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