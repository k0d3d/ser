var expressJWT = require('express-jwt'),
    appConfig = require('config').express,
    cors = require('cors');

module.exports.routes = function (app) {

  app.route('/api/v1/*')
  .all(cors(appConfig.cors.options), function (req, res, next) {
    //if we are requesting the 
    //authentication route, please skip 
    //to the next route.. 
    //should be handled 
    if (req.url === '/api/v1/users/session' && req.method === 'POST') {
      next();
    } else {
      console.log('esle');
      if (req.headers.authorization) {      
        expressJWT({secret: appConfig.secret, skip: ['/api/v1/users/session', '/api/v1/routetest']})
        .call(null, req, res, next);
      } else {
        res.json(401, {status: 'not authd'});
      }
    }
  });  

  //testing if server is online...
  app.get('/api/v1/routetest', function (req, res) {
    res.json(200, true);
  });  

  //load the api routes from orders.js
  require('./api/orders').routes(app);

  //load the api routes from orders.js
  require('./api/users').routes(app);

  //load the api routes from orders.js
  require('./api/activities').routes(app);
};