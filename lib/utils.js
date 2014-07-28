var crypto = require('crypto'), _ = require('underscore');

module.exports.randomString = function (len) {
  var buf = crypto.randomBytes(len);
  return buf.toString('hex');
};


/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
function uid (len) {
    var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
}
module.exports.uid = uid;


/**
* Can generate a random alphanumberic string
* that ends in 4 digit. Can be used for orderIds
* and InvoiceIds
* @param {Number} len The lenght of the string to generate minus the four extra
* numbers at the end .. total string length = length + 4. It defaults to 8.
*/

module.exports.alphaNumDocId = function alphaNumDocId (len) {
    function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
    }

    return  uid(len) + Math.round(getRandomArbitrary(1000, 9999));
};

/**
 * removes false values and properties
 * from an object
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
module.exports.compact = function compactObject (obj) {

    _.each(obj, function(value, key) {
        if(!value){
            delete obj[key];
        }
    });
    return obj;
};

module.exports.testIfEmail = function testIfEmail (email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

module.exports.testIfObjId = function testIfObjId (str) {
    var reg = /^[0-9a-fA-F]{24}$/;
    return reg.test(str);
};

/**
 * Convert Javascript string in dot notation into an object reference
 * @param  {[type]} obj [description]
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
module.exports.strToObj = function strToObj (obj, str) {
    return str.split(".").reduce(function(o, x) { return o[x] }, obj);
};

/**
 * Convert string in dot notation to get the object reference
 * @param {[type]} obj [description]
 * @param {[type]} str [description]
 * @param {[type]} val [description]
 */
module.exports.setObjStrToVal = function set(obj, str, val) {
    str = str.split(".");
    while (str.length > 1)
        obj = obj[str.shift()];
    return obj[str.shift()] = val;
};

module.exports.xInStr = function xInStr (str, len) {
    if (str) {
        return 'xxxx-' + str.slice(str.length - 6, str.length);
    } else {
        return 'xxxx-';
    }
};