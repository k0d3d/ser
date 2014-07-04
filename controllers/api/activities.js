var 
    Notify = require('../../models/postman.js').Notify,    
    _ = require('lodash'),
    maps = require('googlemaps'),
    MedFac = require('../../models/facility');

module.exports.routes = function (app) {


  //
  //Activities 
  //
  app.route('/api/v1/activities')
  .get(function (req, res) {
    var notify = new Notify();
    var userId = req.user._id,
        accountType = req.user.account_type,
        noticesBulk = [],
        tasksList = ['myOrderNotices'];

    function __queueNotices () {
      var task = tasksList.pop();
      notify[task](userId, accountType)
      .then(function (r) {
        _.each(r, function (v) {
          noticesBulk.push(v);
        });
        if (tasksList.length) {
          __queueNotices();
        } else {
          res.json(200, noticesBulk);
        }
      }, function (err) {
        res.json(400, err);
      });
    }

    __queueNotices();

  });


  //Check ins and Check Out
  //
  //Find Medical Facilities using the users current geo-location
  //or using his coverage area as fallback.
  app.route('/api/v1/users/checkin')
  .get(function (req, res) {
    if (req.query.supl === 'get-location-marks') {

      if (!req.query.longitude || !req.query.latitude) {
        return res.json(400, {message: "latitude or longitude missing from query"});
      } else {
        maps.reverseGeocode(req.query.latitude + ',' + req.query.longitude, function (err, data) {
          console.log(err);
          var medfacs = new MedFac();
          var address = _.pluck(data.results[0].address_components, 'short_name');
          medfacs.searchGovtRegister(req.user._id, req.user.account_type, {
            limit: 200, 
            address : address,
            name: req.query.name,
            geo: {
              lat: req.query.latitude,
              lng: req.query.longitude
            }
          })
          .then(function (med_fac_list) {
            res.json(200, med_fac_list);
          });
        });
      }
    }
  })
  .post(function (req, res) {
    
  });

  //save and tag a geo-coordinate to a medical facility
  app.post('/api/v1/facilities/:facId/geo-tag', function (req, res) {
    var medfacs = new MedFac();
    medfacs.saveGeoLocation(req.params.facId, req.body.latitude, req.body.longitude)
    .then(function () {
      res.json(200, true);
    }, function (err) {
      res.json(400, err.message);
    });
  });


};