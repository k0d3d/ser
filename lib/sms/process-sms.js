var _ = require('lodash'),
    staffUtils = require('../../models/staff_utils.js'),
    config = require('config'),
    smsSend = require('./smsSend.js'),
    Q = require('q');

var smsUtils =  {   
    /**
     * gets the order number for a order status, or 
     * the order status for a number
     * @param  {String | Number} numberOrString an order status, or a number 
     * representing that status.
     * @return {[type]}        [description]
     */
    getOrderStatuses: function getOrderStatuses (numberOrString) {
      var o = {
        '-1': 'cancelled',
        
        '0': 'requesting',
        
        '1': 'replied',
        
        '2': 'accepted',
        
        '3': 'confirmed',
        
        '4': 'intransit',
        
        '5': 'supplied',
        
        '6': 'paid'    
      };

      return (_.isNumber(numberOrString)) ? o[numberOrString] : _.invert(o)[numberOrString.toLowerCase()];
    }

};


/**
 * processes an incoming sms request.
 * This method will parse the request body as json. The "From" field is used as the 
 * user's verified phone number. The "Body" field contains a string which will be 
 * parsed to determine what action to take. The first parameter in our string is 
 * "action type" which determines the action to take. The only available action now is "order".
 * which should be follow
 * A valid body string should have this format / template.
 * {order} : ORDER_NUMBER : ACTION_REPLY : ETA : AMOUNT : PRICE.
 *
 * You can 
 * An example of a valid body string.
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
function ProcessSMS (body) {
  if (!body || body.length === 0) {
    throw new Error ('requires argument: body');
  }

  this.body = body;

}


ProcessSMS.prototype.constructor = ProcessSMS;

ProcessSMS.prototype.parse = function parse () {
  //first of all lets get the 
  //it all sorted into arrays.
  var self = this;
  var words = self.body.split(config.sms.delimeter.accepted);

  words = _.compact(_.invoke(words, String.prototype.trim));

  if (words.length === 0) {
    throw new Error('un-accepted inputed');
  } else {
    return words;
  }

  // var action_type = /{(.*?)}/.exec(words[0]);
  // action_type = action_type[1];

  // var tipp_Ex = {
  //   order: {
  //     'orderNo' : words[1].substring(5),
  //     'status' : smsUtils.getOrderStatuses(words[2]),
  //     'eta' : words[3],
  //     'amountSupplied': words[4],
  //     'finalPrice': words[5]
  //   }
  // };

       
};

ProcessSMS.prototype.checkPhoneNumber = function checkPhoneNumber (number) {
  console.log('Checking user phone number..');
  var chk = Q.defer();

  var cleaned_number = number.replace(/[^\d.]/g, "");

  var self = this;

  var rgx = cleaned_number.match(/(^\+[0-9]{3}|^\+[0-9]{2}\(0\)|^\(\+[0-9]{2}\)\(0\)|^00[0-9]{2}|^0|^234)([0-9]{10}$)/);

  //check for staffs first
  staffUtils.getMeMyModel(4)
  .find()
  .regex('phone', new RegExp(rgx[2], 'i'))
  .exec(function (err, docs) {
    if (err) {
      return chk.reject(err);
    }
    if (docs.length > 0) {
      var him = docs[0];
      console.log('found user...');
      self.user = him;

      return chk.resolve(him);
      
    } else {
      return chk.reject(new Error('user / phone number not on drugstoc'));
    }    
  });

  // .textSearch(number, function (err, output) {
  //   if (err) {
  //     return chk.reject(err);
  //   }

  //   if (output.results.length > 0) {
  //     var him = output.results[0].obj;
  //     if (him.phone.indexOf(number) > -1) {
  //       self.user = him;
  //       return chk.resolve(him);
  //     } else {
  //       return chk.reject(new Error('user / phone number not on drugstoc'));
  //     }
  //   } else {
  //     return chk.reject(new Error('user / phone number not on drugstoc'));
  //   }
  // });
  return chk.promise;
};

/**
 * send the result of an sms process back to the
 * user who sent / initated the process. 
 * @param  {[type]} result [description]
 * @return {[type]}        [description]
 */
ProcessSMS.prototype.sendFeedBack = function sendFeedBack (result) {
  console.log('Sending feedback...');
  var cool_txt = 'No Successful Request!!!\n ', 
      not_cool = '\n No Failed Request';

  var self = this;

  //count the number of successful request and 
  //concat a meaningful message.
  if (result.valid.length > 0) {
    cool_txt = result.valid.length + " Updated Order(s): " + _.pluck(result.valid, 'idmask').join();
  }

  //count the number of unsuccessful request and 
  //concat a meaningful message.
  if (result.invalid.length > 0) {
    // not_cool = "Failed Update(s): " + _.pluck(result.invalid, 'idmask').join();
    not_cool = "Failed Update(s): " + result.invalid.join();
  }

  smsSend.sendSMS(
    cool_txt+not_cool,
    self.user.phone
  )
  .then(function () {
    //should log success here.
    console.log(cool_txt+not_cool);
  })
  .fail(function (err) {
    console.log(err);
  })
  .done();

};




module.exports = ProcessSMS;