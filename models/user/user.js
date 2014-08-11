/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('underscore');


function toLower (v) {
  // return v.toLowerCase();
  return v.toLowerCase();
}
/**
 * User Schema
 */
var UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
        // get: toLower,
        // set: toLower
    },
    phone: {
        type: String
    },
    hashed_password: String,
    salt: String,
    account_type: {type: Number, required: true},
    activated : {type: Boolean, default: false},
    createdDate: {type: Date, default: Date.now},
    activatedDate: {type: Date},
    isTempPassword: {type: Boolean, default: true},
    allowedNotifications: {
        email : {type: Boolean, default: true},
        sms : {type: Boolean, default: true},
        portal: {type: Boolean, default: true},
        mobile: {type: Boolean, default: false}
    },
    approvedNotices: {},
    isPremium: {type: Boolean, default: false},
    isAdmin: {type: Boolean, default: false},
    lastLogin: {type: Date}

});

UserSchema.set('toObject', { getters: true, virtuals: true });
UserSchema.set('toJSON', { getters: true, virtuals: true });

var clientSchema = new Schema({
    clientId: {type: String}
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
}).get(function() {
    return this._password;
});


/**
 * getters
 */
// UserSchema.path('email').get(function (value) {
//     console.log(value);
//     return value.toLowerCase();
// });

/**
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
};

UserSchema.path('email').validate(function(email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    //if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
}, 'Email cannot be blank');


UserSchema.path('hashed_password').validate(function(hashed_password) {
    // if you are authenticating by any of the oauth strategies, don't validate
    //if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashed_password.length;
}, 'Password cannot be blank');


/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.password))
        next(new Error('Invalid password'));
    else
        next();
});

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password) return '';
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    }
};

mongoose.model('User', UserSchema);
module.exports = mongoose.model('User');