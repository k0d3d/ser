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


  }());    
}])
.factory('adminService', function ($http) {
    return {
        updateUserType: function updateUserType (userId, params) {
            return $http.post('/api/internal/admin/users/' + userId , params)
            .then(function () {
                return true;
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