/**
*  Admin Module
*
* Description
*/
angular.module('admin', [])

.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/x/users', {
    templateUrl: '/admin/user',
    controller: 'adminUsersCT'
    })
  .when('/x/orders', {
    templateUrl: '/admin/orders',
    controller: 'adminOrdersCt'
    })
  .when('/x/drugs', {
    templateUrl: '/admin/item',
    controller: 'adminItemsCt'
    });
}
])

.controller('adminUsersCT', [
    '$scope',
    'adminService',
    'Notification',
    function ($scope, adminService, N) {
    $scope.$parent.headerTitle = 'Admin:: Manage Users';
    $scope.users_list = [];

    $scope.load_users = function (page, limit) {
        adminService.loadUsers({
            page: page,
            limit: limit
        })
        .then(function (res) {
            $scope.users_list = res;
        });
    };

    $scope.search_user = function (q) {
        adminService.search(q)
        .then(function(res) {
            if (res.length) {
                $scope.users_list = res;
            } else  {
                N.notifier({
                  title: 'Try Something Else',
                  text: 'We could not find a user based on your search criteria. Try again.',
                  class_name: 'growl-danger'
                });
            }
        });
    };

    $scope.manage_user = function (action, userId) {
        adminService[action](userId)
        .then(function(r) {

        });
    };

    $scope.toggle_admin = function (index) {
        adminService.updateUserType($scope.users_list[index]._id, {isAdmin: $scope.users_list[index].isAdmin})
        .then(function () {
            //possibly update UI
            N.notifier({
              title: 'Awesome!',
              text: 'You have updated this users account.',
              class_name: 'growl-success'
            });
        });
    };

    //load the users into the scope
    $scope.load_users(0, 20);

}])
.controller('adminOrdersCt', ['$scope', 'adminService', function ($scope, adminService) {

  $scope.orderFilter = {};

  (function(){
    $scope.orders = [];
    $scope.__temp = {};

    adminService.fetchAllOrders(0, 20)
    .then(function(r){
      angular.forEach(r, function(v){
        //v.nextStatus = v.orderStatus + 1;
        $scope.orders.push(v);
      });
    });


  })();

  $scope.routeFilterParam = function routeFilterParam (item) {
      //is it after e.g. 5days ago and before today
      // console.log(moment(item.orderDate, 'MM-DD-YYYY').isAfter(moment($scope.orderFilter.fromDate)));
      // console.log(moment(item.orderDate, 'MM-DD-YYYY').isBefore(moment($scope.orderFilter.toDate) ));
      if (moment(item.orderDate).isAfter(moment($scope.orderFilter.fromDate)) &&
        moment(item.orderDate).isBefore(moment($scope.orderFilter.toDate) )) {
        return true;
      } else {
        return false;
      }
  };


  $scope.showP = function () {
    $scope.orderFilter = {
        fromDate : moment().subtract('days', 5).format('MM-DD-YYYY'),
        toDate : moment().add('days', 1).format('MM-DD-YYYY')
    };
    console.log($scope.orderFilter);
  };


}])
.controller('adminItemsCt', ['$scope', 'adminService', function ($scope, adminService) {

  $scope.orderFilter = {};

  (function(){
    $scope.items = [];
    $scope.__temp = {};

    adminService.fetchAllItems(0, 20)
    .then(function(r){
      angular.forEach(r, function(v){
        //v.nextStatus = v.orderStatus + 1;
        $scope.items.push(v);
      });
    });


  })();

  $scope.routeFilterParam = function routeFilterParam (item) {
      //is it after e.g. 5days ago and before today
      // console.log(moment(item.orderDate, 'MM-DD-YYYY').isAfter(moment($scope.orderFilter.fromDate)));
      // console.log(moment(item.orderDate, 'MM-DD-YYYY').isBefore(moment($scope.orderFilter.toDate) ));
      if (moment(item.orderDate).isAfter(moment($scope.orderFilter.fromDate)) &&
        moment(item.orderDate).isBefore(moment($scope.orderFilter.toDate) )) {
        return true;
      } else {
        return false;
      }
  };


  $scope.showP = function () {
    $scope.orderFilter = {
        fromDate : moment().subtract('days', 5).format('MM-DD-YYYY'),
        toDate : moment().add('days', 1).format('MM-DD-YYYY')
    };
    console.log($scope.orderFilter);
  };


}])
.factory('adminService', function ($http) {
    return {
        updateUserType: function updateUserType (userId, params) {
            return $http.post('/api/internal/admin/users/' + userId , params)
            .then(function () {
                return true;
            });
        },
        fetchAllItems: function fetchAllItems (page, limit) {
            return $http({
                url: '/api/internal/admin/items',
                method: 'GET',
                params: {page: page, limit: limit}
            })
            .then(function (r) {
                return r.data;
            });
        },
        fetchAllOrders: function fetchAllOrders (page, limit) {
            return $http({
                url: '/api/internal/admin/orders',
                method: 'GET',
                params: {page: page, limit: limit}
            })
            .then(function (r) {
                return r.data;
            });
        },
        search: function search (q) {
            return $http({
                url: '/api/internal/admin/search?',
                method: 'GET',
                params: q
            })
            .then(function (r) {
                return r.data;
            });
        },
        loadUsers: function loadUsers (params) {
            return $http({
                url: '/api/internal/admin/users?',
                method: 'GET',
                params: params
            })
            .then(function (r) {
                return r.data;
            });
        },
        activateUser: function activateUser (userId) {
            return $http.put('/api/internal/admin/users/' + userId + '?action=activate')
            .then(function () {
                return true;
            });
        },
        deactivateUser: function deactivateUser (userId) {
            return $http.put('/api/internal/admin/users/' + userId + '?action=deactivate')
            .then(function () {
                return true;
            });
        },
        deleteUser: function deleteUser (userId) {
            return $http.delete('/api/internal/admin/users/' + userId )
            .then(function () {
                return true;
            });
        }
    };
});