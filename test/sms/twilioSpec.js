describe('Twilio send sms spec', function() {


  it('should send an sms using twilio sms service and plugin', function (done) {
    var config = require('config');
    var client = require('twilio')(config.twilio.accountSID, config.twilio.accountToken);
    // var client = require('twilio')('ACf84b0e66680f730edd639741d8879a89', 'fe8f201a6244729e2ea8eb0bd595c054');



    client.messages.create({
        body: "Jenny please?! I love you <3",
        to: "+2348126488955",
        // from: "+15005550006"
        from: "+12086960938"
    }, function(err, message) {
        console.log(message);
        process.stdout.write(message.sid);
        expect(message.status).toEqual('queued');
        done();

    });

    // 
    // console.log(config.twilio.accountSID);
    // expect(config.twilio.accountSID).toBeDefined();
    // expect(config.twilio.accountToken).toBeDefined();
    // done();
  }, 20000);
});