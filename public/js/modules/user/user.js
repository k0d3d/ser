/**
*  Admin Module
*
* Description
*/
angular.module('user', [])

.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/a/profile', {templateUrl: '/user/profile', controller: 'userController'});
}])
.controller('userController', ['$scope', 'userServices', 'ordersService', function userController($scope, US, ordersService){
  //Change HeaderTitle
  $scope.$parent.headerTitle = 'Profile';
  //Fetch Activities
  US.fetchActivities()
  .then(function (i) {
    $scope.activity = i;
  });


  $scope.confirm_order = function (order) {
    order.orderStatus = 3;
    ordersService.updateOrder(order)
    .then(function () {

    });
  };  
}])
.factory('userServices', ['$http', function ($http) {
  return {
    fetchActivities: function () {
      return $http.get('/api/internal/activities')
      .then(function (r) {
        return r.data;
      });
    }
  }
}])