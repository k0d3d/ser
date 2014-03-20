/**
*  Admin Module
*
* Description
*/
angular.module('organization', [])

.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/organization', {templateUrl: '/organization/all-staff', controller: 'staffController'});
  $routeProvider.when('/organization/invitations', {templateUrl: '/organization/invites', controller: 'staffController'});
}])
.controller('staffController', ['$scope', 'organizeStaffService', function userController($scope, oss) {

  oss.loadInvites()
  .then(function (r) {
    $scope.invites = r;
  });

  $scope.create_new_staff = function () {
    oss.inviteStaff($scope.new_staff).then(function (r) {
      $scope.new_staff = {};
    });
  };
}])
// .directive('invites', [function () {
//   return {
//     link : link,
//     templateUrl: 
//   }
// }])
.factory('organizeStaffService', ['$http', function ($http) {
  return {
    inviteStaff : function (form) {
      return $http.post('/api/organization/invites', form)
      .then(function (r) {
        return r;
      }, function (err) {
        return err;
      });
    },
    loadInvites : function () {
      return $http.get('/api/organization/invites')
      .then(function (r) {
        return r.data;
      }, function (err) {
        return err;
      });
    }
  };
}]);
