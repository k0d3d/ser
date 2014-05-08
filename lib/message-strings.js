var format =  require('string-template');

module.exports = function (typeOfMessage, values) {

  var messages = {
    "new_quotation_request" : {
      "sms" : "you have received a new quotation request",
      "email" : "you have received a new quotation request"
    }
  };

  return format(messages[typeOfMessage], values); 
}