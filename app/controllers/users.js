/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    util = require('util'),
    User = mongoose.model('User');

function UserController(){

}

UserController.prototype.constructor = UserController;



/**
 * Auth callback
 */
UserController.prototype.authCallback = function(req, res, next) {
    res.redirect('/');
};

/**
 * Show login form
 */
UserController.prototype.signin = function(req, res) {
    var msg = req.flash('error');
    res.render('users/signin', {
        title: 'Signin',
        message: msg[0]
    });
};

/**
 * Show sign up form
 */
UserController.prototype.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    });
};

/**
 * Logout
 */
UserController.prototype.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
UserController.prototype.session = function(req, res) {
    res.redirect('/');
};
/**
 * Session
 */
UserController.prototype.apiSession = function(req, res) {
    res.json(404, false);
};

/**
 * Create user
 */
UserController.prototype.create = function(req, callback) {
    var user = new User(req.body);
    user.level = 'hospital';
    user.provider = 'local';
    user.save(function(err) {
        if(err){
            callback(err);
        }else{
            callback(user);
        }
    });
};

/**
 *  Show profile
 */
UserController.prototype.show = function(req, res) {
    var user = req.profile;

    res.render('users/show', {
        title: user.name,
        user: user
    });
};

/**
 * Send User
 */
UserController.prototype.me = function(req, res) {
    res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
UserController.prototype.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};

module.exports.users  = UserController;
var users = new UserController();

module.exports.routes = function(app, passport){
    app.get('/signin', users.signin);
    app.get('/signup', users.signup);
    app.get('/signout', users.signout);

    //Setting up the users api
    app.post('/users', function(req, res, next){
        users.create(req, function (r){
        if (util.isError(r)) {
            return res.render('users/signup', {
                errors: r.errors,
            });
        }
        req.logIn(r, function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
        });
    });

    app.post('/users/session', passport.authenticate('local', {
        failureRedirect: '/signin',
        failureFlash: true
    }), users.session);
    app.post('/api/users/session', passport.authenticate('local', {
        failureRedirect: '/signin',
        failureFlash: 'Invalid email or password.'
    }), users.session);

    app.get('/users/me', users.me);
    app.get('/users/:userId', users.show);

    //Finish with setting up the userId param
    app.param('userId', users.user);     
}