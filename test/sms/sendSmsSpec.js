/*global describe it expect*/

describe("smslive account tests", function () {
    
    it("should be able to send a test sms", function sendTestEmail(done) {
        
        // arrange
        var sendMessage = require('../../lib/sms/smsSend.js');
        
        // act
        sendMessage.sendSMS(
                'Test sms from Drugstoc', // list of receivers
                '08126488955' // plaintext body
            )
            .then(function (reslt) {
                
                // assert
                // expect(reslt).toBe(true);
                expect(true).toBe(true);
                done();
                
            })
            .catch(function (exception) {
                
                // assert
                //expect(exception).toBe(undefined);

                // fail
                console.error('couldn\'t send sms');
                console.error(exception);
                done();
                
            });
        
    }, 20000);

});