/**
*  Module
*
* Description
*/
var hospital = angular.module('facility', []);
hospital.config(['$routeProvider', function ($routeProvider){
  $routeProvider
  .when('/a/facilities', {
    templateUrl: '/hospital/index', 
    controller: 'hospitalIndexController'
  })
  .when('/a/facilities/add',{
    templateUrl: '/hospital/new',
    controller: 'hospitalAddController'
  })
  .when('/a/facilities/:facilityId',{
    templateUrl: '/hospital/details',
    controller: 'hospitalDeetsController'
  });
}]);

hospital.controller('hospitalIndexController', ['$scope', 'facilityServices', function indexController($scope, facilityService){
  $scope.$parent.headerTitle = 'Hospitals';

  //Request hospitals within the 
  //currently logged in users
  //coverage
  facilityService.searchFacility({page: 0})
  .then(function(r){
    $scope.valRes = r;
  });

  $scope.remove = function(index){
    facilityService.remove($scope.hospitals[index]._id,$scope.hospitals[index].user, function(r){
      $scope.hospitals.splice(index, 1);
    });
  };

  $scope.search_gvt = function (data) {
    facilityService.searchFacility(data)
    .then(function (res) {
      if (!_.isEmpty(res)) {
        $scope.valRes = res;
      } else {
        $scope.valRes.length = 0;
      }
      
    });
  };

}]);

hospital.controller('hospitalAddController', ['$scope', 'facilityServices', function indexController($scope, hs){
  function init () {
    $scope.form = {};
  }
  init();

  //Send the new hospital reg.
  $scope.regnew = function(){
    hs.register($scope.form, function(r){
      $scope.form = '';
    });
  };

}]);
hospital.controller('hospitalDeetsController', ['$scope', 'facilityServices', '$routeParams', function indexController($scope, hs, $routeParams){
  function init () {
    $scope.form = {};

    var userId  = $routeParams.hospitalId;
    hs.deets(userId, function (r) {
      $scope._deets = r;
    });
  }
  init();


}]);

hospital.factory('facilityServices',['$http', 'Notification', 'Language',  function($http, N, Lang){
  var h = {};

  //Get the list of register hospitals
  h.all = function(options, callback){
    $http.get('/api/hospitals/pages/'+options.page)
    .success(function(d, r){
      callback(d);
    })
    .error(function(d, r){
      N.notifier({
        message: Lang[Lang.set].hospital.fetch.error,
        type: 'error'
      });
    });
  };

  h.deets = function (id, cb) {
    $http.get('/api/hospitals/' + id)
    .success(function (r) {
      cb(r);
    })
    .error(function (err) {
      N.notifier({
        message: err,
        type: 'error'
      });      
    });
  };

  h.searchFacility = function searchFacility (data) {
    return $http.get('/api/internal/facilities/search?type=facilty&' + $.param(data))
    .then(function (r) {
      return r.data;
    });
  };

  //Send a new registration request
  h.register = function(post, callback){
    $http.post('/api/facilities', post)
    .success(function(d, r){
      N.notifier({
        message: Lang[Lang.set].hospital.register.success,
        type: 'success'
      });
      callback(true);      
    })
    .error(function(d, r){
      N.notifier({
        message: Lang[Lang.set].hospital.register.error,
        type: 'error'
      });
      callback(true);
    });
  };

  //send a delete hospital request
  h.remove = function(hospitalId, userId, callback){
    $http.delete('/api/hospitals/'+hospitalId+'/user/'+userId)
    .success(function(d, r){
      N.notifier({
        message: Lang[Lang.set].hospital.delete.success,
        type: 'success'
      });
      callback(true);
    })
    .error(function(d, r){
      N.notifier({
        message: Lang[Lang.set].hospital.delete.error,
        type: 'error'
      });      
    });
  };

   
  return h;
}]);

