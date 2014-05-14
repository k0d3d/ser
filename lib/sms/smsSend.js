var restler = require('restler'),
    config = require('config').sms,
    Q = require('q'),
    _ = require('lodash');

var sender = {

  sendSMS : function sendSMS (message, sendTo) {
    var smsApi = "";
    var sender = Q.defer();
    
    if (!sendTo) {
        sender.reject(new Error('empty recipents phone number'));
        return sender.promise;
    }    
    function commArr (arrStr) {
      if (_.isString || _.isNumber) {
        return arrStr;
      }

      if (_.isArray(arrStr)) {
        return arrStr.join();
      }

      return sender.reject(new Error ('invalid senders list'));
    }
    
    smsApi += "http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail=" + config.owneremail;
    smsApi += "&subacct=" + config.subacct;
    smsApi += "&subacctpwd=" + config.subacctpwd;
    smsApi += "&message=" + encodeURIComponent(message);
    smsApi += "&sender=" + config.sender;
    smsApi += "&sendto=" + commArr(sendTo);
    smsApi += "&msgtype=0";

    restler.get(smsApi)
    .on('complete', function (data) {
      console.log(data);
      if (data instanceof Error) {
        return sender.reject(data);
      }
      return sender.resolve(data);
    });

    return sender.promise;
  }
};


module.exports = sender;