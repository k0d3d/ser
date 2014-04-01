var LocalStrategy = require('passport-local').Strategy,
    BasicStrategy = require('passport-http').BasicStrategy,
    User = require('../models/user/user.js');

module.exports = function(passport) {
    //Serialize sessions
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      User.findOne({
        _id: id
      }, function(err, user) {
        done(err, user);
      });
    });

    passport.use(new BasicStrategy(
      function(userid, password, done) {
        User.findOne({
          email: userid
        }, function (err, user) {
          console.log(user);
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false);
          }
          if (!user.verifyPassword(password)) { 
            return done(null, false); 
          }
          return done(null, user);
        });
      }
      ));    

    //Use local strategy
    passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      User.findOne({
        email: email
      }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: 'User not found!'
          });
        }
        if (!user.authenticate(password)) {
          return done(null, false, {
            message: 'Invalid password'
          });
        }
        return done(null, user);
      });
    }
    ));
  };