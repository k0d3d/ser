var login = require('connect-ensure-login'),
    _ = require("underscore");

/**
 * all API routes must respond to errors with a res.json 400 http status code.
 * @param  {[type]} app      [description]
 * @param  {[type]} passport [description]
 * @return {[type]}          [description]
 */
module.exports = function(app, passport) {
  var people = [
    {
      name: "Pharmaceutical Company",
      permissions: []
    },
    {
      name: 'Manager',
      permissions: []
    },
    {
      name: 'Distributor',
      permissions: ['activity-count', 'view-activity', 'view-drug-pages', 'add-item', 'view-profile-managers', 'view-profile-staff']
    },
    {
      name: 'Manager',
      permissions: []
    },
    {
      name: 'Staff',
      permissions: ['activity-count', 'view-activity', 'view-drug-pages', 'employer', 'coverage', 'profile-activity', 'manager']
    },
    {
      name: 'Hospitals',
      permissions: ['activity-count', 'place-order', 'view-activity', 'order-cart', 'view-drug-pages']
    }
  ];
  var nav = [
    {
      name : "Dashboard",
      roles : [],
      icon: '',
      url: '/'
    },
    {
      name: "Orders",
      roles: ['*'],
      icon: '',
      url: '/a/orders'
    },
    {
      name: 'Suppliers',
      roles: [],
      icon: '',
      url: '/a/suppliers',
    },
    {
      name: "Drug Pages",
      roles: [0,1,2,3,4],
      icon: '',
      url: '/a/drugs'
    },
    {
      name: 'Med. Facilities',
      roles: [0],
      icon:'',
      url: '/a/facilities'
    },
    {
      name: 'Organization',
      roles: [0,1,2,3],
      icon: '',
      child: [
        {
          name: 'Distributors',
          roles: [0,1],
          url: '/a/organization/people/2'
        },
        {
          name: 'Managers',
          roles: [0],
          url: '/a/organization/people/1'
        },
        {
          name: 'Managers',
          roles: [0,1,2],
          url: '/a/organization/people/3'

        },
        {
          name: 'Staff',
          roles: [0,1,2,3],
          url: '/a/organization/people/4'              
        }
      ]
    },
    {
      name: 'Invitations',
      roles: [0,1,2,3],
      url: '/a/organization/invitations'
    }
  ];



  //Sets roles and permissions to be used on 
  //the view templates and widgets
  app.route('*')
  .get(function (req, res, next) {

    //Minimal middleware that adds 
    //logged in user details to view
    if (req.user) {
      res.locals.userData = req.user;
    }    

    res.locals.hasRole = function (index, isChild, parent) {
      var account_type = req.user.account_type;
      var this_nav = (isChild) ? nav[parent].child[index] : nav[index];

      if (_.indexOf(this_nav.roles, account_type) > -1 || this_nav.roles[0] === '*') {
        return true;
      } else {
        return false;
      }
    };

    res.locals.isPermitted = function (permission) {
      var permits = _.intersection(permission, people[req.user.account_type].permissions);
      if (permits.length > 0) {
        return true;
      }
    };

    //console.log(req.originalUrl);

    res.locals.navs = nav;
    res.locals.people = people;

    next();

  });

  //User Routes
  try {
    var users = require('./users'); 
    users.routes(app, passport, login, people);
    
    //Hospital Routes
    var facility = require('./facilities');
    facility.routes(app, login);

    //Drug Routes
    var drug = require('./drugs');
    drug.routes(app, login);
    //Orders Routes
    var order = require('./orders');
    order.routes(app, login);
    //Organization
    var organization = require('./organization');
    organization.routes(app, login);

    //Organization
    var activity = require('./activity.js');
    activity(app, login);

    //File upload handler/controller
    var fileupload = require('./upload');
    fileupload(app, login);
    
  } catch (e) {
    console.log(e.stack);
  }


  //Home route
  app.route('/')
  .get(function(req, res){
    res.render('home/splash',{
      title: 'Dashboard'
    });
  });

  // app.route('/home/index')
  // .get(login.ensureLoggedIn('/signin'), function(req, res){
  //   res.render('home/splash',{
  //     title: 'Dashboard'
  //   });
  // });

  app.get('/api/internal/commons', function (req, res) {
    res.json(200, require('../config/commons.js'));
  });

  app.route('/partials/:name')
  .get(function (req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
  });

  // home route
  app.route('/:parent/:child')
  .get(function(req, res){
    var parent = req.params.parent;
    var child = req.params.child;
    res.locals.commons = require('../config/commons.js');    
    res.render(parent+'/'+child, {
      userData: req.user
    });
  });

};
