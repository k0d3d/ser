var format =  require('string-format'),
    strToObj = require('./utils.js').strToObj;

module.exports = function (typeOfMessage, values) {
  //if we have more than 3 arguments ,
  //recreate value
  // if (arguments.length > 2) {

  // }
console.log(typeOfMessage);
  var messages =  {
    'new_quotation_request': {
      'email' : {
        'subject' : 'new quotation request',
        'message' : 'you have received a new quotation request'      
      },
      'sms' : {
        'message': 'you have received a new quotation request'
      },
      'portal': {
        'message': 'You have received a new quotation request'
      }
    },
    'quotation_accepted' : {
      'email' : {
        'subject': 'A quotation has been accepted',
        'message': 'A quotation has been accepted',
      } ,
      'sms' : 'A quotation has been accepted'
    },
    'order_cancelled': {
      'email' : {
        'subject': 'An order has been cancelled',
        'message': 'An order has been cancelled'
      } ,
      'sms' : 'An order has been cancelled'
    },
    'quotation_request_replied': {
      'email' : {
        'subject': 'you have a reply from a Sales Rep',
        'message': 'you have a reply from a Sales Rep'
      } ,
      'sms' : 'you have a reply from a Sales Rep'
    },
    'quotation_request_updated' : {
      'email' : {
        'subject': 'your requested quotation has been updated',
        'message': 'your requested quotation has been updated'
      },
      'sms' : 'your requested quotation has been updated'
    }
 };
 console.log(strToObj(messages, typeOfMessage));
  return strToObj(messages, typeOfMessage).format(values);
  // return format(, values); 
  // return format(strToObj(messages, typeOfMessage), values); 
};