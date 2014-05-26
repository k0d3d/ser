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
        'message' : 'you have received a new quotation request for {orderAmount} {itemId.itemPackaging} of {itemId.itemName}'      
      },
      'sms' : {
        'message': 'you have received a new quotation request for {orderAmount} {itemId.itemPackaging} of {itemId.itemName}'
      },
      'portal': {
        'message': 'You have received a new quotation request'
      }
    },
    'quotation_accepted' : {
      'email' : {
        'subject': 'A quotation has been accepted',
        'message': 'A quotation for {orderAmount} {itemId.itemPackaging} of {itemId.itemName} has been accepted by {hospitalId.name}',
      } ,
      'sms' : {
        'message': 'A quotation for {orderAmount} {itemId.itemPackaging} of {itemId.itemName} has been accepted by {hospitalId.name}',
      },
      'portal': {
        'message': ' quotation request has been accepted.'
      }      
    },
    'order_cancelled': {
      'email' : {
        'subject': 'A quotation has been rejected',
        'message': 'A quotation for {orderAmount} {itemId.itemPackaging} of {itemId.itemName} has been rejected by {hospitalId.name}'
      } ,
      'sms' : {
        'message': 'An order for {orderAmount} {itemId.itemPackaging} of {itemId.itemName} has been cancelled',
      },
      'portal': {
        'message': ' order / request has been cancelled by'
      }        
    },
    'quotation_request_replied': {
      'email' : {
        'subject': 'you have a reply from a Sales Rep',
        'message': '{orderAmount} {itemId.itemPackaging} of {itemId.itemName} - you have a reply from a Sales Rep'
      } ,
      'sms' : {
        'message': 'you have a reply from a Sales Rep regarding a quotation for {orderAmount} {itemId.itemPackaging} of {itemId.itemName}',
      },
      'portal': {
        'message': ' quotation request has been replied.'
      }  
    },
    'quotation_request_updated' : {
      'email' : {
        'subject': 'your requested quotation has been updated',
        'message': 'Quotation / Order for {orderAmount} {itemId.itemPackaging} of {itemId.itemName} has been updated'
      },
      'sms' : {
        'message': 'your requested quotation  for {orderAmount} {itemId.itemPackaging} of {itemId.itemName} has been updated',
      },
      'portal': {
        'message': ' quotation / order request has been updated.'
      }  
    }
 };
 console.log(strToObj(messages, typeOfMessage));
  return strToObj(messages, typeOfMessage).format(values);
  // return format(, values); 
  // return format(strToObj(messages, typeOfMessage), values); 
};