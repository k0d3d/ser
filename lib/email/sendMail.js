var nodemailer = require('nodemailer'),
    Q = require('q'),
    jade = require('jade'),
    config = require('config');
var transport = {
    domain : nodemailer.createTransport('SMTP', {
        host: config.mail.domain.host, // hostname
        port: 465, // port for secure SMTP
        auth: {
            user: config.mail.domain.username,
            pass: config.mail.domain.password,
        },
        debug: config.mail.debug,
        secureConnection: true,
        ignoreTLS: true

    }),
    sendgrid: nodemailer.createTransport('SMTP', {
        service: 'sendgrid',
        //host: config.mail.domain.host, // hostname
        //port: 465, // port for secure SMTP
        auth: {
            user: config.mail.sendGrid.username,
            pass: config.mail.sendGrid.password,
        },
        debug: config.mail.debug,
        //secureConnection: true,
        //ignoreTLS: true

    })
};

var mailer = {


    sendMail : function (options, service) {
        var mp = Q.defer();
        service = service || config.mail.defaultService;
        if (!options.to) {
            mp.reject(new Error('empty recipents option'));
            return mp.promise;
        }

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: config.mail.defaultSenderName + ' <' + config.mail.defaultSenderEmail + '>', // sender address
            to: options.to, // list of receivers
            subject: options.subject, // Subject line
            text: options.text // plaintext body
        };

        // send mail with defined transport object
        transport[service].sendMail(mailOptions, function(error, response){
            if(error){
                return mp.reject(error);
            }else{
                return mp.resolve(response.message);
            }

            // if you don't want to use this transport object anymore, uncomment following line
            //transport.close(); // shut down the connection pool, no more messages
        });

        return mp.promise;
    },

    sendHTMLMail : function (options, templatePath, templateData, service) {
        var mp = Q.defer();
        service = service || config.mail.defaultService;
        if (!options.to) {
            mp.reject(new Error('empty recipents option'));
            return mp.promise;
        }
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: config.mail.defaultSenderName + '<' + config.mail.defaultSenderEmail + '>', // sender address
            to: options.to, // list of receivers
            subject: options.subject, // Subject line
            html: jade.renderFile(templatePath, templateData) // plaintext body
        };

        // send mail with defined transport object
        transport[service].sendMail(mailOptions, function(error, response){
            if(error){
                return mp.reject(error);
            }else{
                return mp.resolve(response.message);
            }

            // if you don't want to use this transport object anymore, uncomment following line
            transport.close(); // shut down the connection pool, no more messages
        });

        return mp.promise;
    }
};


module.exports = mailer;
//http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail=koded730@yahoo.com&subacct=EMAIL2SMS&subacctpwd=login60&message=testmessage&sender=DrugStoc&sendto=08126488944&msgtype=0