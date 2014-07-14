
module.exports.routes = function (app, login) {   

  //load the api routes from orders.js
  require('./admin/orders').routes(app, login);

  //load the api routes from users.js
  require('./admin/users').routes(app, login);

  // //load the api routes from orders.js
  // require('./api/activities').routes(app);
};