/**
*  Admin Module
*
* Description
*/
angular.module('organization', [])

.config(['$routeProvider', function ($routeProvider){
  //$routeProvider.when('/a/organization', {templateUrl: '/organization/all-staff', controller: 'staffController'});
  $routeProvider.when('/a/organization/people/:accountType', {templateUrl: '/organization/all-staff', controller: 'staffController'});
  $routeProvider.when('/a/organization/people/:personId/person/:accountType', {templateUrl: '/organization/profile', controller: 'personController'});
  $routeProvider.when('/a/organization/invitations', {templateUrl: '/organization/invites', controller: 'invitesController'});
}])
.controller('staffController', ['$scope', 'organizeStaffService', '$routeParams', '$timeout', function userController($scope, oss, $routeParams, $timeout) {
  $scope.$parent.headerTitle = 'Organization';


  oss.getMyPeople({
    account_type: $routeParams.accountType
  })
  .then(function (data) {
    $scope.people = data;
  });


  $scope.onDropAssignWard = function (e) {
    //console.log($(e.target).text());
    angular.element(e.target).removeClass('collection-li-over');
    var lgaName = angular.element(e.target).scope().col.name;
    var staffId = angular.element(e.target).scope().dndDragItem.userId._id;
    oss.addLgaToStaff(lgaName, staffId)
    .then(function () {
      var indx = angular.element(e.target).scope().dndDragItem.ndx;
      $timeout(function () {
        $scope.people[indx].coverage.push(lgaName);
      });
    });
  };

  //When dragged in evet
  $scope.onOver = function (e) {
    $(e.target).addClass('collection-li-over');
  };
  //When dragged out event
  $scope.onOut = function (e) {
    $(e.target).removeClass('collection-li-over');
  };

  $scope.$watch('current_state', function (n) {
    if (n) {
      oss.getLGA(n)
      .then(function (lga) {
        $scope.lgas = lga;
      });

      oss.getMedFac(n)
      .then(function (med) {
        $scope.meds = med;
      });
    }
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

  //Creates new staff.
  $scope.create_new_staff = function () {
    oss.inviteStaff($scope.new_staff).then(function (r) {
      $scope.new_staff = {};
    });
  };  

  //Activate Staff
  $scope.activate_staff = function (index) {
    oss.activateStaff($scope.invites[index])
    .then(function (r) {

    });
  }

}])
.directive('staffSelect', ['organizeStaffService', function (oss) {
  return {
    link: function (scope, element, attrs) {
      var kind = attrs.kind;

      oss.getMyWorkForce(kind)
      .then(function (wf) {
        scope.pplWf = [];

        angular.forEach(_.compact(wf), function(v) {
          if (_.isArray(v)) {
            angular.forEach(_.compact(v), function (vSub) {
              scope.pplWf.push(vSub);
            });
          } else {
            scope.pplWf.push(v);
          }
          
        });
      });      
    },
    scope: {
      staffSelect: '='
    },
    template: '<select class="form-control" ng-model="staffSelect.staff" placeholder="name or email address" ng-options="c.userId.email for c in pplWf " required></select>'
  };
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
      });
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
    getMyWorkForce : function (kind) {
      kind = kind || 'employees';
      return $http.get('/api/organization/workforce?direction=' + kind)
      .then(function (r) {
        return r.data;
      }, function (err) {
        return err;
      });
    },

    //fetches the list of lga for the selected
    //state
    getLGA : function getLGA (stateId) {
      return $http.get('/api/organization/states/' + stateId + '/lga')
      .then(function (lgas) {
        return lgas.data;
      }, function () {

      });
    },
    //fetches the list of lga for the selected
    //state
    getMedFac : function getMedFac (stateId) {
      return $http.get('/api/organization/states/' + stateId + '/facility')
      .then(function (f) {
        return f.data;
      }, function () {

      });
    },
    addLgaToStaff: function addLgaToStaff (tag, staffId) {
      return $http.put('/api/organization/people/' + staffId + '/tag?' +  $.param({tagType: 1, tag: tag}))
      .then(function (done) {
        return done.data;
      });
    }
  };
}]);
