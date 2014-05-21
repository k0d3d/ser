/*
Main application entry point
 */

// pull in the package json
var pjson = require('./package.json');
console.log('drugstoc version: ' + pjson.version);

// REQUIRE SECTION
var express = require('express'),
    lingua = require('lingua'),
    router = express.Router(),
    config = require('config'),
    app = express(),
    passport = require('passport'),
    routes = require('./controllers/routes'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    bodyParser = require('body-parser'),
    flash = require('connect-flash'),
    session = require('express-session'),
    favicon = require('static-favicon'),
    compress = require('compression'),
    multer = require('multer'),
    helpers = require('view-helpers');
var MongoStore = require('connect-mongo')(session);


// set version
app.set('version', pjson.version);

// port
var port = process.env.PORT || 3011;


function afterResourceFilesLoad() {

    console.log('configuring application, please wait...');


    console.log('Loading passport config...');
    try {
      require('./lib/passport.js')(passport);
    } catch(e) {
      console.log(e);
    }
    

    app.set('showStackError', true);


    // make everything in the public folder publicly accessible - do this high up as possible
    app.use(express.static(__dirname + '/public'));

    // set compression on responses
    app.use(compress({
      filter: function (req, res) {
        return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
      },
      level: 9
    }));

    // efficient favicon return - will enable when we have a favicon
    app.use(favicon('public/images/favicon.ico'));


    app.locals.layout = false;
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    // Lingua configuration
    console.log('Configuring language resources...');

    app.use(lingua(app, {
      defaultLocale: 'en',
      path: __dirname + '/config/i18n'
    }));


    // set logging level - dev for now, later change for production
    app.use(logger('dev'));


    // expose package.json to views
    app.use(function (req, res, next) {
      res.locals.pkg = pjson;
      next();
    });      

    // signed cookies
    app.use(cookieParser(config.express.secret));

    app.use(bodyParser());
    app.use(methodOverride());
    app.use('/upload/doc', multer({
      dest: './public/images/item-images'
    }));
    app.use('/upload/profile', multer({
      dest: './public/images/profile-images'
    }));

    // setup session management
    console.log('setting up session management, please wait...');
    console.log(config.db.server);
    console.log(config.db.password);
    app.use(session({
        secret: config.express.secret,
        store: new MongoStore({
            db: config.db.database,
            host: config.db.server,
            port: config.db.port,
            auto_reconnect: true,
            username: config.db.user,
            password: config.db.password,
            collection: "mongoStoreSessions"
        })
    }));

    //Initialize Passport
    app.use(passport.initialize());

    //enable passport sessions
    app.use(passport.session());


    // connect flash for flash messages - should be declared after sessions
    app.use(flash());

    // should be declared after session and flash
    app.use(helpers(pjson.name));

    //pass in the app config params in to locals
    app.use(function(req, res, next) {

        res.locals.app = config.app;
        next();

    });

    // our router
    //app.use(app.router);


    // test route - before anything else
    console.log('setting up test route /routetest');

    app.route('/routetest')
    .get(function(req, res) {
        res.send('Integra StocCLoud server is running');
    });


    // our routes
    console.log('setting up routes, please wait...');
    routes(app, passport);


    // assume "not found" in the error msgs
    // is a 404. this is somewhat silly, but
    // valid, you can do whatever you like, set
    // properties, use instanceof etc.
    app.use(function(err, req, res, next){
      // treat as 404
      if  ( err.message &&
          (~err.message.indexOf('not found') ||
          (~err.message.indexOf('Cast to ObjectId failed'))
          )) {
        return next();
      }


      // log it
      // send emails if you want
      console.error(err.stack);

      // error page
      //res.status(500).json({ error: err.stack });

      var t = '/api/internal/';
      if (req.url.indexOf(t) > -1) {
        res.json(500, err.message);        
      } else {
        res.status(500).render('500', {
          url: req.originalUrl,
          error: err.message
        }); 
      }    


    });

    // assume 404 since no middleware responded
    app.use(function(req, res){

      var t = '/api/internal/';
      if (req.url.indexOf(t) > -1) {
        res.json(404, {message: 'resource not found'});        
      } else {
        res.status(404).render('404', {
          url: req.originalUrl,
          error: 'Not found'
        });
      }          

    });      


    // development env config
    if (process.env.NODE_ENV == 'development') {
      app.locals.pretty = true;
    }

}


console.log("Running Environment: %s", process.env.NODE_ENV);

console.log("Setting up database communication...");
// setup database connection
require('./lib/db').open()
.then(function () {
  console.log('Connection open...');
  afterResourceFilesLoad();

  // actual application start
  app.listen(port);
  console.log('Integra Online Server App started on port '+port);

  // expose app
  exports = module.exports = app;
  // CATASTROPHIC ERROR
  app.use(function(err, req, res){
    
    console.error(err.stack);
    
    // make this a nicer error later
    res.send(500, 'Ewww! Something got broken on Integra. Getting some tape and glue');
    
  });

})
.catch(function (e) {
  console.log(e);
});



