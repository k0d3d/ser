/**
*  Admin Module
*
* Description
*/
angular.module('organization', [])

.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/organization', {templateUrl: '/organization/all-staff', controller: 'staffController'});
  $routeProvider.when('/a/organization/people/:accountType', {templateUrl: '/organization/all-staff', controller: 'staffController'});
  $routeProvider.when('/a/organization/people/:personId/staff/:accountType', {templateUrl: '/organization/profile', controller: 'personController'});
  $routeProvider.when('/a/organization/invitations', {templateUrl: '/organization/invites', controller: 'invitesController'});
}])
.controller('staffController', ['$scope', 'organizeStaffService', '$routeParams', function userController($scope, oss, $routeParams) {
  $scope.$parent.headerTitle = 'Organization';
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
.controller('personController', ['$scope', 'organizeStaffService', '$routeParams', function ($scope, oss, $routeParams) {
  $scope.$parent.headerTitle = 'Profile';

  oss.getPersonProfile({
    account_type: $routeParams.accountType,
    userId: $routeParams.personId

  })
  .then(function (data) {
    $scope.person = data;
  });

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
.factory('organizeStaffService', ['$http', 'Notification', 'Language', function ($http, N, L) {
  return {
    inviteStaff : function (form) {
      return $http.post('/api/organization/invites', form)
      .then(function (r) {
        N.notifier({
          title: L[L.set].titles.success,
          text: L[L.set].organization.invite.success ,
          class_name: 'growl-success'
        });
        return r;
      }, function (err) {
        N.notifier({
          title: L[L.set].titles.error,
          text: L[L.set].organization.invite.error ,
          class_name: 'growl-danger'
        });
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
        N.notifier({
          title: L[L.set].titles.success,
          text: L[L.set].organization.activate.success ,
          class_name: 'growl-success'
        });        
        return r.data;
      }, function (err) {
        return err;
      })
    },
    //fetch the list of people having a 
    //specific account type
    getMyPeople : function (options) {
      return $http.get('/api/organization/people/' + options.account_type)
      .then(function (r) {
        return r.data;
      }, function (err) {
        return err;
      });
    },
    getPersonProfile : function (options) {
      return $http.get('/api/organization/people/' + options.userId + '/staff/' + options.account_type)
      .then(function (r) {
        return r.data;
      }, function (err) {
        return err;
      });
    },
    //get the list of people employed under the currently 
    //logged in user. 
    getMyWorkForce : function () {
      return $http.get('/api/organization/workforce')
      .then(function (r) {
        return r.data;
      }, function (err) {
        return err;
      });
    }
  };
}]);
