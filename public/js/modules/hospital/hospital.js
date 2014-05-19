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

hospital.controller('hospitalIndexController', ['$scope', 'hospitalService', function indexController($scope, hs){
  $scope.$parent.headerTitle = 'Hospitals';

  //Request hospitals
  // hs.all({page: 0}, function(r){
  //   $scope.hospitals = r;
  // });

  $scope.removeh = function(index){
    hs.remove($scope.hospitals[index]._id,$scope.hospitals[index].user, function(r){
      $scope.hospitals.splice(index, 1);
    });
  };

}]);

hospital.controller('hospitalAddController', ['$scope', 'hospitalService', function indexController($scope, hs){
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
hospital.controller('hospitalDeetsController', ['$scope', 'hospitalService', '$routeParams', function indexController($scope, hs, $routeParams){
  function init () {
    $scope.form = {};

    var userId  = $routeParams.hospitalId;
    hs.deets(userId, function (r) {
      $scope._deets = r;
    });
  }
  init();


}]);

hospital.factory('hospitalService',['$http', 'Notification', 'Language',  function($http, N, Lang){
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
  }


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

