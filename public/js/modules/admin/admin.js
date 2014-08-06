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
  .when('/x/invoices', {
    templateUrl: '/admin/invoice',
    controller: 'adminInvoicesCt'
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

    $scope.load_users = function (page, limit, cb) {
      adminService.loadUsers({
          page: page,
          limit: limit
      })
      .then(function (res) {
        if (res.length) {
          cb(res.length);
          $scope.users_list = res;
        }
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

    $scope.manage_user = function (action, userId, index) {
        adminService[action](userId)
        .then(function() {
          if (action === 'deleteUser') {
            $scope.users_list.splice(index, 1);
          }
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
    $scope.toggle_premium = function (index) {
        adminService.updateUserType($scope.users_list[index]._id, {isPremium: $scope.users_list[index].isPremium})
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
    // $scope.load_users($scope.currentPage, $scope.pageLimit);

}])
.controller('adminOrdersCt', ['$scope', 'adminService', function ($scope, adminService) {
  $scope.$parent.headerTitle = 'Admin:: Manage Orders';
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
  $scope.$parent.headerTitle = 'Admin:: Manage Items';
  $scope.orderFilter = {};
  $scope.currentPage = 0;
  $scope.pageLimit = 10;

  $scope.getPageItems = function (currentPage, pageLimit) {
    $scope.items = [];
    $scope.__temp = {};

    adminService.fetchAllItems({page: currentPage, limit: pageLimit})
    .then(function(r){
      angular.forEach(r, function(v){
        //v.nextStatus = v.orderStatus + 1;
        $scope.items.push(v);
      });
    });


  };

  // get the first page
  $scope.getPageItems($scope.currentPage, $scope.pageLimit);

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
.controller('adminInvoicesCt', [
  '$scope',
  'adminService',
  'ordersService',
  function ($scope, adminService, ordersService) {
  $scope.$parent.headerTitle = 'Admin:: Manage Invoices';
  $scope.activeInv = {};

  adminService.loadInvoices()
  .then(function (d) {
    var ew = [];
    angular.forEach(d, function (iv) {
      var ld = iv;
      ld.groupedOrders = _.groupBy(iv.order, function (ob) {return ob.orderSupplier.name;});
      ew.push(ld);
    });
    console.log(ew);
    $scope.invoices = ew;
  });

  $scope.send_invoice = function (id, state) {
    adminService.updateInvoices(id, state, {})
    .then(function () {

    });
  };


  $scope.search = function(queryObj){
    console.log('message');

    ordersService.searchCmp(queryObj)
    .then(function (r) {
      angular.forEach(r.drug, function (v, i) {
        r.drug[i].packageQty = 1;
      });
      $scope.searchedItems = r;
      $scope.searchedItems.s = queryObj.s;

    });
  };


  $scope.add_to_invoice = function (item){
    if (!item.packageCount || !$scope.activeInv.thisHospitalId || !$scope.activeInv.thisInvoiceId) return false;
    item.orderAmount = item.packageCount * item.packageQty;
    //return console.log(item);
    adminService.addItemToInvoice($scope.activeInv.thisInvoiceId, $scope.activeInv.thisHospitalId, item)
    .then(function(data){
        item.sentRequest = 'sent';
        $scope.my_quotation.push(data);
        $scope.form = '';
    });
  };

  $scope.getTotal = function (order) {
    console.log(order.length);
    return order.length;
  };

  $scope.delete_invoice_item = function (index, invoiceId, thisOrder) {
    var orderId = thisOrder[index].orderId;
    adminService.deleteInvoiceItem(invoiceId, orderId)
    .then(function () {
      thisOrder.splice(index, 1);
    });
  };

  $scope.send_item_sms = function (index, invoiceId, thisOrder, hospitalId) {
    var orderData = thisOrder[index];
    orderData.hospitalId = hospitalId;
    adminService.sendInvoiceItemBySms(invoiceId, orderData)
    .then(function () {

    });
  };

  $scope.orders2sup = function (orders, invoiceId, kind) {
    adminService.sendInvoiceItemToSup(orders, invoiceId, kind)
    .then(function () {

    });
  };

}])
.factory('adminService', ['$http', 'Notification', function ($http, N) {
    return {
        sendInvoiceItemToSup: function sendSMSToSup (orders, invoiceId, kind) {
          return $http({
            url: '/api/internal/admin/invoices/' + invoiceId,
            method: 'POST',
            data: orders,
            params: {action: kind}
          })
          .then(function () {
            N.notifier({
              title: 'Welldone!',
              text: 'Supplier has been notified about these orders.',
              class_name: 'growl-success'
            });
          });
        },
        deleteInvoiceItem: function deleteInvoiceItem (invoiceId, item) {
          return $http({
            url: '/api/internal/admin/invoices/' + invoiceId,
            method: 'DELETE',
            params: {orderId: item}
          })
          .then(function (d) {
            return d.data;
          });
        },
        addItemToInvoice: function addItemToInvoice (invoiceId, hospitalId, item) {
          return $http({
            url : '/api/internal/admin/invoices/' + invoiceId,
            data: item,
            method: 'PUT',
            params: {hospitalId: hospitalId.userId, action: 'request'}
          })
          .then(function (d) {
            return d.data;
          });
        },
        loadInvoices: function loadInvoices (page, limit) {
          return $http({
            url: '/api/internal/admin/invoices',
            method: 'GET',
            params: {page: page, limit: limit}
          })
          .then(function (d) {
            return d.data;
          });
        },
        sendInvoiceItemBySms: function sendInvoiceItemBySms (id, orderData) {
          return $http({
            url: '/api/internal/admin/invoices/' + id ,
            method: 'PUT',
            data: orderData,
            params: {action: 'send-sms'}
          })
          .then(function (d) {
            N.notifier({
              title: 'Success!',
              text: 'The order has been sent to the supplier via sms',
              class_name: 'growl-success'
            });
            return d.data;
          });
        },
        updateInvoices: function updateInvoices (id, state, query) {
          return $http({
            url: '/api/internal/admin/invoices/' + id ,
            method: 'PUT',
            params: {page: query.page, limit: query.limit, state: state, action: 'update'}
          })
          .then(function (d) {
            return d.data;
          });
        },
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
                url: '/api/internal/admin/users/search?',
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
}]);