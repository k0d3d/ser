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
module.exports.uid = function (len) {
    var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
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

module.exports.strToObj = function strToObj (obj, str) {
    return str.split(".").reduce(function(o, x) { return o[x] }, obj);    
};