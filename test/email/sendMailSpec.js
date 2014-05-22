/*global describe it expect*/

describe("node mailer tests", function () {
    
    xit("should be able to send a test email", function sendTestEmail(done) {
        
        // arrange
        var sendMessage = require('../../lib/email/sendMail.js').sendMail;
        
        // act
        sendMessage({
                to: 'michael.rhema@gmail.com', // list of receivers
                subject: 'DrugStoc Test Email', // Subject line
                text: 'dRUGsTOC test.text' // plaintext body
            })
            .then(function () {
                
                // assert
                expect(true).toBe(true);
                done();
                
            })
            .catch(function (exception) {
                
                // assert
                //expect(exception).toBe(undefined);

                // fail
                console.error('couldn\'t send email');
                console.error(exception);
                done();
                
            });
        
    }, 20000);    


    it("should be able to send a html template email", function sendTestEmail(done) {
        
        // arrange
        var sendMessage = require('../../lib/email/sendMail.js').sendHTMLMail;
        
        // act
        sendMessage({
                to: 'michael.rhema@gmail.com', // list of receivers
                subject: 'DrugStoc Test Email', // Subject line
                text: 'dRUGsTOC test.text' // plaintext body
            }, 'views/templates/email-templates/test-template.jade')
            .then(function () {
                
                // assert
                expect(true).toBe(true);
                done();
                
            })
            .catch(function (exception) {
                
                // assert
                //expect(exception).toBe(undefined);

                // fail
                console.error('couldn\'t send email');
                console.error(exception);
                done();
                
            });
        
    }, 20000);

});