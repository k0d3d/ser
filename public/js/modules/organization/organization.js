/**
*  Admin Module
*
* Description
*/
angular.module('organization', [])

.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/organization', {templateUrl: '/organization/all-staff', controller: 'staffController'});
  $routeProvider.when('/organization/people/:accountType', {templateUrl: '/organization/all-staff', controller: 'staffController'});
  $routeProvider.when('/organization/people/:personId/staff', {templateUrl: '/organization/profile', controller: 'personController'});
  $routeProvider.when('/organization/invitations', {templateUrl: '/organization/invites', controller: 'invitesController'});
}])
.controller('staffController', ['$scope', 'organizeStaffService', '$routeParams', function userController($scope, oss, $routeParams) {
  $scope.$parent.headerTitle = 'Staff';
  //Creates new staff.
  $scope.create_new_staff = function () {
    oss.inviteStaff($scope.new_staff).then(function (r) {
      $scope.new_staff = {};
    });
  };

  oss.getMyPeople({
    account_type: $routeParams.accountType
  })
  .then(function (data) {
    $scope.people = data;
  });
}])
.controller('personController', ['$scope', 'organizeStaffService', function () {
  $scope.$parent.headerTitle = 'Profile';
}])
.controller('invitesController', ['$scope', 'organizeStaffService', function ($scope, oss) {
  //Load all invites
  oss.loadInvites()
  .then(function (r) {
    $scope.invites = r;
  });

  //Activate Staff
  $scope.activate_staff = function (index) {
    oss.activateStaff($scope.invites[index])
    .then(function (r) {

    });
  }

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
    },
    activateStaff : function (data) {
      console.log(data);
      return $http.put('/api/organization/invites?activation=1', data)
      .then(function (r) {
        return r.data;
      }, function (err) {
        return err;
      })
    },
    getMyPeople : function (options) {
      return $http.get('/api/organization/people/' + options.account_type)
      .then(function (r) {
        return r.data;
      }, function (err) {
        return err;
      })
    }
  };
}]);
