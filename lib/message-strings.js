var format =  require('string-format'),
    strToObj = require('./utils.js').strToObj;

module.exports = function (typeOfMessage, values) {

  var messages =  {
    'new_quotation_request': {
      'email' : {
        'subject' : 'new quotation request',
        'message' : 'ORDER: {meta.idmask} - you have received a new quotation request'+
          ' for {meta.orderAmount} {meta.itemId.itemPackaging} of {meta.itemId.itemName}'
      },
      'sms' : {
        'message': 'ORDER: {meta.idmask} - you have received a new order request ' +
          'for {meta.orderAmount} {meta.itemId.itemPackaging} of {meta.itemId.itemName}'
      },
      'portal': {
        'message': 'You have received a new quotation request'
      }
    },
    'quotation_accepted' : {
      'email' : {
        'subject': 'A quotation has been accepted',
        'message': 'ORDER: {meta.idmask} - A quotation for {meta.orderAmount} {meta.itemId.itemPackaging}' +
          ' of {meta.itemId.itemName} has been accepted by {meta.hospitalId.name}',
      } ,
      'sms' : {
        'message': 'ORDER: {meta.idmask} - A quotation for {meta.orderAmount} {meta.itemId.itemPackaging} of'+
          ' {meta.itemId.itemName} has been accepted by {meta.hospitalId.name}',
      },
      'portal': {
        'message': ' quotation request has been accepted.'
      }
    },
    'send_quote' : {
      'email' : {
        'subject': 'A quotation has been accepted',
        'message': 'ORDER: {meta.idmask} - A quotation for {meta.orderAmount} {meta.itemId.itemPackaging}' +
          ' of {meta.itemId.itemName}',
      } ,
      'sms' : {
        'message': 'ORDER: {meta.idmask} - Item Price: {meta.perItemPrice} - A quotation for {meta.orderAmount} {meta.itemId.itemPackaging} of'+
          ' {meta.itemId.itemName}',
      },
      'portal': {
        'message': ' quotation request has been accepted.'
      }
    },
    'order_cancelled': {
      'email' : {
        'subject': 'A quotation has been rejected',
        'message': 'ORDER: {meta.idmask} - A quotation for {meta.orderAmount} {meta.itemId.itemPackaging}' +
          ' of {meta.itemId.itemName} has been rejected by {meta.hospitalId.name}'
      } ,
      'sms' : {
        'message': 'ORDER: {meta.idmask} - An order for {meta.orderAmount} {meta.itemId.itemPackaging}'+
          ' of {meta.itemId.itemName} has been cancelled',
      },
      'portal': {
        'message': ' order / request has been cancelled by'
      }
    },
    'quotation_request_replied': {
      'email' : {
        'subject': 'you have a reply from a Sales Rep',
        'message': 'ORDER: {meta.idmask} -  {meta.orderAmount} {meta.itemId.itemPackaging}'+
          ' of {meta.itemId.itemName} - you have a reply from a Sales Rep'
      } ,
      'sms' : {
        'message': 'ORDER: {meta.idmask} - you have a reply from a Sales Rep regarding' +
          ' a quotation for {meta.orderAmount} {meta.itemId.itemPackaging} of {meta.itemId.itemName}',
      },
      'portal': {
        'message': ' quotation request has been replied.'
      }
    },
    'quotation_request_updated' : {
      'email' : {
        'subject': 'your requested quotation has been updated',
        'message': 'ORDER: {meta.idmask}  Quotation / Order for {meta.orderAmount} {meta.itemId.itemPackaging}' +
          ' of {meta.itemId.itemName} has been updated'
      },
      'sms' : {
        'message': 'ORDER: {meta.idmask} - your requested quotation  for ' +
          '{meta.orderAmount} {meta.itemId.itemPackaging} of {meta.itemId.itemName} has been updated',
      },
      'portal': {
        'message': ' quotation / order request has been updated.'
      }
    },
    'quotation_request_confirmed' : {
      'email' : {
        'subject': 'your requested quotation has been confirmed',
        'message': 'ORDER: {meta.idmask}  Quotation / Order for {meta.orderAmount} {meta.itemId.itemPackaging}' +
          ' of {meta.itemId.itemName} has been confirmed'
      },
      'sms' : {
        'message': 'ORDER: {meta.idmask} - your requested quotation  for ' +
          '{meta.orderAmount} {meta.itemId.itemPackaging} of {meta.itemId.itemName} has been confirmed',
      },
      'portal': {
        'message': ' quotation / order request has been confirmed.'
      }
    }
 };

  return strToObj(messages, typeOfMessage).format(values);
  // return format(, values);
  // return format(strToObj(messages, typeOfMessage), values);
};