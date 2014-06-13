var restler = require('restler'),
    config = require('config').sms,
    Q = require('q'),
    _ = require('lodash');

var sender = {

  sendSMS : function sendSMS (message, sendTo) {
    var smsApi = "";
    var s = Q.defer();
    
    if (!sendTo) {
        s.reject(new Error('empty recipents phone number'));
        return s.promise;
    }    
    function commArr (arrStr) {
      if (_.isString || _.isNumber) {

        if (arrStr.toString().substr(0, 1) === '0') {
          return "+234" + arrStr.substr(1);
        } else {
          return arrStr;
        }
      }

      if (_.isArray(arrStr)) {
        return arrStr.join();
      }

      return s.reject(new Error ('invalid senders list'));
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
    // smsApi += "&sender=" + config.general.sender;
    // smsApi += "&message=" + encodeURIComponent(message);
    // 
    //         
    // smsApi += "http://121.241.242.114:8080/sendsms?";
    // smsApi += "username=" + "ihs-ikeja";
    // smsApi += "&password=" + "welcome";
    // smsApi += "&type=0";
    // smsApi += "&dlr=1";
    // smsApi += "&destination=" + commArr(sendTo);
    // smsApi += "&source=" + config.general.sender;
    // smsApi += "&message=" + encodeURIComponent(message);

    // console.log(smsApi);

    // restler.get(smsApi)
    // .on('complete', function (data) {
    //   console.log(data);
    //   if (data instanceof Error) {
    //     return s.reject(data);
    //   }
    //   return s.resolve(data);
    // });
    var client = require('twilio')(config.accounts.twilio.accountSID, config.accounts.twilio.accountToken);
    // var client = require('twilio')('ACf84b0e66680f730edd639741d8879a89', 'fe8f201a6244729e2ea8eb0bd595c054');



    client.messages.create({
        body: message,
        to: commArr(sendTo),
        // from: "+15005550006"
        from: "+12086960938"
    }, function(err, message) {
        console.log(err, message);
      if (err) {
        return s.reject(err);
      }
      return s.resolve(message);        

    });    

    return s.promise;
  }
};


module.exports = sender;