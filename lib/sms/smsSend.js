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

        if (arrStr.toString().substr(0, 1) === '0') {
          return "234" + arrStr.substr(1);
        } else {
          return arrStr;
        }
      }

      if (_.isArray(arrStr)) {
        return arrStr.join();
      }

      return sender.reject(new Error ('invalid senders list'));
    }
    
    // smsApi += "http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail=" + config.owneremail;
    // smsApi += "&subacct=" + config.subacct;
    // smsApi += "&subacctpwd=" + config.subacctpwd;
    // smsApi += "&message=" + encodeURIComponent(message);
    // smsApi += "&sender=" + config.sender;
    // smsApi += "&sendto=" + commArr(sendTo);
    // smsApi += "&msgtype=0";  
    // 
    //     
    // smsApi += "http://smsgator.com/bulksms?";
    // smsApi += "email=" + "michael.rhema@gmail.com";
    // smsApi += "&password=" + "login60";
    // smsApi += "&type=0";
    // smsApi += "&dlr=0";
    // smsApi += "&destination=" + commArr(sendTo);
    // smsApi += "&sender=" + config.sender;
    // smsApi += "&message=" + encodeURIComponent(message);
    // 
    //         
    smsApi += "http://121.241.242.114:8080/sendsms?";
    smsApi += "username=" + "ihs-ikeja";
    smsApi += "&password=" + "welcome";
    smsApi += "&type=0";
    smsApi += "&dlr=1";
    smsApi += "&destination=" + commArr(sendTo);
    smsApi += "&source=" + config.sender;
    smsApi += "&message=" + encodeURIComponent(message);

    // smsApi += "&msgtype=0";
    console.log(smsApi);

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