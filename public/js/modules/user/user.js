/**
*  Admin Module
*
* Description
*/
angular.module('user', [])

.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/a/profile', {templateUrl: '/user/profile', controller: 'userController'});
}])
.controller('userController', [
  '$scope', 
  'userServices', 
  'ordersService', 
  function userController($scope, US, ordersService){
  //Change HeaderTitle
  $scope.$parent.headerTitle = 'Profile';
  //Fetch Activities
  US.fetchActivities()
  .then(function (i) {
    $scope.activity = i;
  });

  US.fetchProfile()
  .then(function (i) {
    $scope.userProfile = i;
  });


  $scope.confirm_order = function confirm_order (order) {
    order.orderStatus = 3;
    ordersService.updateOrder(order)
    .then(function () {

    });
  };  

  $scope.update_profile = function update_profile (data, value) {
    var field = value.split('.');
    US.updateProfile({name : field[1], value: data})
    .then(function (r) {

    });
  };

  $scope.validate_facility = function validate_facility (data) {
    US.validateFacility(data)
    .then(function (res) {
      if (!_.isEmpty(res)) {
        $scope.valRes = res;
      } else {
        $scope.valRes = 'none';
      }
      
    });
  };

  $scope.validate_this = function validate_this (res) {
    US.validateThis(res)
    .then(function (v) {

    });
  };
}])
.filter('territory', function () {
  return function (arr) {
    var e = '';
    angular.forEach(arr, function (v) {
      e += ', ' + v.toUpperCase();
    });
    return e;
  };
})
.factory('userServices', ['$http', function ($http) {
  return {
    fetchActivities: function fetchActivities () {
      return $http.get('/api/internal/activities')
      .then(function (r) {
        return r.data;
      });
    },
    fetchProfile: function fetchProfile (){
      return $http.get('/api/internal/users/profile')
      .then(function (r) {
        return r.data;
      });
    },
    updateProfile: function updateProfile (data) {
      return $http.put('/api/internal/users/profile', data)
      .then(function (r) {
        return r.data;
      });
    },
    validateFacility: function validateFacility (data) {
      return $http.get('/api/internal/facilities/search?type=facilty&' + $.param(data))
      .then(function (r) {
        return r.data;
      });
    },
    validateThis : function validateThis (data) {
      return $http.post('/api/internal/facilities/validate', data)
      .then(function (r){
        return r.data;
      });
    }
  };
}]);