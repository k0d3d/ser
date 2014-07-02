var login = require('connect-ensure-login'),
    _ = require("lodash");

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
      name: 'Profile',
      roles: ['*'],
      url: '/a/profile',
      menu: false
    },
    {
      name : "Dashboard",
      roles : [],
      icon: '',
      url: '/',
      menu: true
    },
    {
      name: "Orders",
      roles: ['*'],
      icon: '',
      url: '/a/orders',
      menu: true
    },
    {
      name: 'Suppliers',
      roles: [],
      icon: '',
      url: '/a/suppliers',
      menu: true
    },
    {
      name: "Drug Pages",
      roles: [0,1,2,3,4],
      icon: '',
      url: '/a/drugs',
      menu: true
    },
    {
      name: 'Med. Facilities',
      roles: [0],
      icon:'',
      url: '/a/facilities',
      menu: true
    },
    {
      name: 'Organization',
      roles: [0,1,2,3],
      icon: '',
      child: [
        {
          name: 'Distributors',
          roles: [0,1],
          url: '/a/organization/people/2',
          menu: true
        },
        {
          name: 'Managers',
          roles: [0],
          url: '/a/organization/people/1',
          menu: true
        },
        {
          name: 'Managers',
          roles: [0,1,2],
          url: '/a/organization/people/3',
          menu: true

        },
        {
          name: 'Staff',
          roles: [0,1,2,3],
          url: '/a/organization/people/4',
          menu: true
        }
      ]
    },
    {
      name: 'Invitations',
      roles: [0,1,2,3],
      url: '/a/organization/invitations',
      menu: true
    }
  ];



  //Sets roles and permissions to be used on 
  //the view templates and widgets
  app.route('*')
  .get(function (req, res, next) { 

    res.locals.hasRole = function (index, isChild, parent) {
      var account_type = req.user.account_type;
      var this_nav = (isChild) ? nav[parent].child[index] : nav[index];

      if (_.indexOf(this_nav.roles, account_type) > -1 || this_nav.roles[0] === '*' ) {
        if (this_nav.menu) {
          return true;
        } else {
          return false;
        }
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

    //Minimal middleware that adds 
    //logged in user details to view
    //
    //checks if the current url is allowed
    //or viewable by the currently logged in
    //user.
    if (req.user) {
      res.locals.userData = req.user;

      //the next loop flattens my 
      //sub menus into a the top 
      //level menu array... so i can
      //check every single menu, navigation.
      var children_navs = [];
      for (var i = 0; i < nav.length; i++) {
        if (nav[i].child) {
          for (var x = 0; x < nav[i].child.length; x++) {
            children_navs.push(nav[i].child[x]);
          }
        }
      }

      var thisUrlRoles = _.find(nav.concat(children_navs), {url: req.url});
      var isPublicRoute = req.url.indexOf('/p/') > -1;

      //this should help ignore static files..
      //looking for a better hack.
      if (_.isUndefined(thisUrlRoles)) {
        // console.log('is static file: ' + req.url);
        return next();
      }

      if (isPublicRoute || _.indexOf(thisUrlRoles.roles, req.user.account_type) > -1 || thisUrlRoles.roles[0] === '*') {
        next();
      } else {
        return res.redirect('/a/profile');
      }
      // next();
    } else {
      //let other routes / middleware
      //handle unauthorized actions
      next();
    }
    


  });

  //User Routes

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

  var externalApi = require('./external.js');
  externalApi.routes(app);
    

  //Home route
  app.route('/')
  .get(login.ensureLoggedIn('/signin'), function(req, res){
    res.render('index');
  });

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
