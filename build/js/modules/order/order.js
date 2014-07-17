/**
* orders Module
*
* Description
*/
angular.module('order', []).

config(['$routeProvider',function($routeProvider){
  $routeProvider.when('/a/orders', {templateUrl: '/order/index', controller: 'ordersIndexController'})
  .when('/a/orders/new', {templateUrl: '/order/new-order-search-item', controller: 'orderAddController'})
  .when('/a/invoices', {templateUrl: '/order/invoice', controller: 'invoiceController'})
  .when('/a/orders/cart', {templateUrl: '/order/cart', controller: 'orderCartController'});
}])
.controller('invoiceController', ['$scope', 'ordersService', function ($scope, ordersService) {
  ordersService.loadInvoices()
  .then(function (i) {
    $scope.invoices = i;
  });
}])
.controller('orderCartController', [
  '$scope',
  '$http',
  'ordersService',
  '$rootScope',
  'Notification',
  '$route',
  function($scope, $http, ordersService, $rootScope, N, $route) {
  $scope.$parent.headerTitle = 'Pending Quotations';

  $scope.orderCart = [];

  //Fetch All Orders
  ordersService.orders('quotes', 'full')
  .then(function (i) {
    angular.forEach(i, function (v) {
      try {
        if (v.status === 0 && v.itemId.instantQuote === false) {
          v.viewPrice = '...';
          v.canGo = false;
        } else {
          v.viewPrice = v.perItemPrice * v.orderAmount;
          v.canGo = true;
        }
        $scope.orderCart.push(v);
      } catch (e) {
        N.notifier({
          title: 'Ooops!',
          text: 'We could not load one of the quotes',
          class_name: 'growl-danger'
        });
      }


    });
    //within callback.
    $scope.cart_meta = {
      string: function () {
        var count = $scope.orderCart.length;
        if (count < 5) {
          return "Add (" + (5 - count) + ") more times to checkout";
        } else {
          return "Request Quotation";
        }
      },
      state: ($scope.orderCart.length < 5) ? true : false
    };

   // $rootScope.my_quotation = i;
  });

  //$scope.orderCart = $rootScope.orderCart;

  $scope.order_this = function(order, index){
    ordersService.postCartItem(order)
    .then(function () {
      $scope.orderCart.splice(index, 1);
      $scope.my_quotation.splice(index, 1);
      $route.reload();
    });
  };

  $scope.send_request_invoice = function send_request_invoice (cart) {
    if (cart.length < 5) {
      return alert('Cart is incomplete: minimum of 5 items');
    }
    ordersService.sendInvoiceRequest(cart)
    .then(function () {
      $scope.canVerify = true;
      $scope.cart_meta.string = function () {return 'Quotation Sent';};
      $scope.cart_meta.state = false;

    });

  };

  $scope.removeFromCart = function removeFromCart (index) {
    ordersService.remove($scope.orderCart[index].orderId)
    .then(function (){
      $scope.orderCart.splice(index, 1);
      $scope.my_quotation.splice(index, 1);
      $route.reload();
    });
  };


}])
.controller('ordersIndexController', [
  '$scope',
  '$http',
  '$location',
  '$routeParams',
  'ordersService',
  'organizeStaffService',
  '$route',
  function ($scope, $http, $location, $routeParams, ordersService, organizeStaffService, $route) {
  $scope.$parent.headerTitle = 'Orders';

  $scope.orderFilter = {
    status : 2,
  };

  $scope.orderStatusFilter =  function orderStatusFilter (item) {

    var state = $scope.orderFilter.status;
    if (state == 2) {
      return (item.status < 2)? true : false;
    }
    if (state == 3) {
      return (item.status >= 2 && item.status < 5) ? true : false;
    }
    if (state == 6) {
      return (item.status >= 5 && item.status <= 6)? true : false;
    }
    return false;
    // console.log(item);
  };



  (function(){
    $scope.orders = [];
    $scope.__temp = {};

    ordersService.orders(7, 'full')
    .then(function(r){
      angular.forEach(r, function(v, i){
        //v.nextStatus = v.orderStatus + 1;
        $scope.orders.push(v);
      });
    });


  }());


  //hides an order from being visible on the table
  $scope.hide_order = function(index){
    var orderId = $scope.orders[index].orderId;

    ordersService.hideOrderItem(orderId)
    .then(function(o){
      $scope.orders.splice(index, 1);
    });
  };

  //populates the drop down list of staff
  $scope.check_people = function () {
    if (_.isEmpty($scope.employer_peeps)) {
      organizeStaffService.getMyPeople({account_type: 4})
      .then(function (dp) {
        $scope.employer_peeps = dp;
      });
    }
  };

  //watch the __temp scope for changes.
  //make calls for order updates when the scope
  //changes
  // $scope.$watch('__temp', function (n) {
  //   console.log(n);
  //   if (!_.isEmpty(n)) {
  //     var orderId = n.orderId;
  //     ordersService.getOrderStatusUpdates(orderId)
  //     .then(function (data) {
  //       $scope.__temp.orderStatusList = data;
  //       //qucik hack for tooltips.
  //       //please remove. it is very embarassing
  //       //.Oh mighty koded
  //       setTimeout(function () {
  //         $('.tooltips').tooltip();
  //       }, 1000);
  //     });
  //   }
  // });

  $scope.get_status_updates = function (n) {
      var orderId = n.orderId;
      ordersService.getOrderStatusUpdates(orderId)
      .then(function (data) {
        // $scope.__temp.orderStatusList = data;
        n.statusLog = data;
        //qucik hack for tooltips.
        //please remove. it is very embarassing
        //.Oh mighty koded
        setTimeout(function () {
          $('.tooltips').tooltip();
        }, 1000);
      });
  };

  $scope.open_order_manager = function (cmp) {
    $scope.__manageOrderModal = cmp;
  };

  $scope.update_order = function (order, index) {
    ordersService.updateOrder(order)
    .then(function () {
      $scope.orders[index] = order;
      $('#manage-order-modal').modal('hide');
      $route.reload();
    });
  };
  $scope.cancel_order = function (order, index) {
    order.status = -1;
    ordersService.updateOrder(order)
    .then(function () {
      $scope.orders[index] = order;
      $('#manage-order-modal').modal('hide');
      $route.reload();
    });
  };

  $scope.__isEnabled = function (status, permission) {
    var per = {
      'change_price' : [0,1],
      'send_quotation_button': [0,1],
      'change_qty' : [0,1],
      'update_order': [3,4,5],
      'comment': [1],
      'resolution': [2,3,4,5],
      'option_r_confirm': [2],
      'option_r_in_transit': [3],
      'option_r_supplied': [4],
      'option_r_paid' : [5],
      'cancel_order' : [1,2,3,4]
    };
    if (per[permission].indexOf(parseInt(status)) > -1) {
      return true;
    } else {
      return false;
    }
  };



}])
.controller('orderAddController', [
  '$scope',
  '$http',
  '$location',
  'ordersService',
  'drugService',
  '$routeParams',
  'organizeStaffService',
  function($scope, $http, $location, ordersService, drugService, $routeParams, oss){
  $scope.form = {
    itemData: {},
    supplierData: {}
  };
  $scope.searchedItems = null;
  $scope.modal = {};
  if($routeParams.itemId){
    drugService.summary($routeParams.itemId, 'main', function(r){
      $scope.summary = r;
      $scope.form.itemData.itemName = r.itemName;
      $scope.form.itemData.id = r._id;
      $scope.form.nafdacRegNo = r.nafdacRegNo;
      $scope.form.nafdacRegName = r.itemName;
      $scope.form.orderPrice = r.itemPurchaseRate;
      $scope.form.suppliers = {
        supplierName : r.supplierName,
        supplierID : r.supplierID
      };
    });
  }

  $scope.search = function(queryObj){
    // $scope.ds = '';
    // var page = p || 0;

    ordersService.searchCmp(queryObj)
    .then(function (r) {
      angular.forEach(r.drug, function (v, i) {
        r.drug[i].packageQty = 1;
      });
      $scope.searchedItems = r;
      $scope.searchedItems.s = queryObj.s;

    });
  };


  $scope.more = function (index) {
    ordersService.moreInfo($scope.cmps[index]._id, function(r){
      $scope.ds = r;
      $scope.ds.index = index;
    });
  };


  $scope.saveButtonClass = 'btn-primary';
  $scope.submitOrder = function(){
    ordersService.save($scope.form, function(data){
      $scope.form = '';
    });
  };


  $scope.add_to_cart = function (item){
    if (!item.packageCount) return false;
    item.orderAmount = item.packageCount * item.packageQty;
    //return console.log(item);
    ordersService.addToQuotations(item)
    .then(function(data){
        item.sentRequest = 'sent';
        $scope.my_quotation.push(data);
        $scope.form = '';
    });
  };

  $scope.add_to_list = function (item) {
    oss.addToMyList({drugId: item._id})
    .then(function (r) {

    });
  };

}])
.factory('ordersService',['$http', 'Notification','Language', function($http, N, L){
    var f = {};

    f.loadInvoices = function loadInvoices () {
      return $http.get('/api/internal/invoices')
      .then(function (r) {
        return r.data;
      });
    };

    f.sendInvoiceRequest = function sendInvoiceRequest(cart) {
      return $http.post('/api/internal/invoice', cart)
      .then(function (inv) {
        return inv.data;
      });
    };

    f.searchCmp = function searchCmp (queryCmp){

      return $http.get('/api/internal/item/search?' + $.param(queryCmp))
      .then(function (i) {
        return i.data;
      }, function (err) {
        return err;
      });

    };

    //Gets orders by status and display
    f.orders = function orders (status, displayType){
      return $http.get('/api/internal/orders/' + status + '/display/' + displayType)
      .then(function (d){
        return d.data;
      }, function (err) {
        return err;
      });
    };

    //Post one item to be sent as an order.
    //Accepts a replied quotation.
    f.postCartItem = function postCartItem (form){
      return $http.put('/api/internal/orders/' + form.orderId + '/status/2', form)
      .then(function (r) {
        N.notifier({
          title: L[L.set].titles.success,
          text: L[L.set].order.cart.place.success,
          class_name: 'growl-success'
        });
        return r.data;
      }, function (err) {
        // N.notifier({
        //   title:  L[L.set].titles.error,
        //   text:  err,
        //   class_name: 'growl-danger'
        // });
        //return err;
      });
    };

    //post one item to be added to the cart
    f.addToQuotations = function(form){
      return $http.post('/api/internal/orders', form)
      .then(function (r) {
        N.notifier({
          title: L[L.set].titles.success,
          text: r.message || L[L.set].order.cart.place.success,
          class_name: 'growl-success'
        });
        return r.data;
      }, function (err) {
        N.notifier({
          title:  L[L.set].titles.error,
          text:  err,
          class_name: 'growl-danger'
        });
        //return err;
      });
    };

    f.fetchActivities = function () {
      return $http.get('/api/internal/activities')
      .then(function (r) {
        return r.data;
      }, function (err) {
        return err;
      });
    };

    //makes an order update request.
    f.updateOrder = function (o) {
      return $http.put('/api/internal/orders/'+escape(o.orderId), o)
      .then(function (data) {
        N.notifier({
          title: L[L.set].titles.error,
          text: L[L.set].order.update.success,
          class_name: 'growl-success'
        });
        return data.data;
      });
    };

    f.count = function(callback){
      $http.get('api/orders/count').
        success(function(d){
          callback(d);
        });
    };

    //remove or cancel an order
    f.hideOrderItem = function(orderId){
      return $http.delete('/api/internal/orders/' + orderId)
      .then(function (r) {
        return r.data;
      }, function(err) {

      });
    };

    //remove or cancel an order
    f.remove = function(order_id){
      return $http.delete('/api/internal/orders/'+order_id)
      .then(function (r) {
        N.notifier({
          title: L[L.set].titles.success,
          text: L[L.set].order.cancel.success,
          class_name: 'growl-success'
        });
        return r.data;
      });
    };

    f.notifySupplier = function(id, type, cb){
      $http.post('/api/internal/suppliers/'+id+'/notify?type='+type)
      .success(function(d){
        cb(d);
      })
      .error(function(err){
        //Fit in error here
      });
    };

    //Request for order statuses and updates for a
    //particular order
    f.getOrderStatusUpdates = function getOrderStatusUpdates (orderId) {
      return $http.get('/api/internal/orders/' + orderId + '/statuses')
      .then(function (data) {
        return data.data;
      }, function (err) {
        N.notifier({
          title:  L[L.set].titles.error,
          text:  err,
          class_name: 'growl-danger'
        });
      });
    };

    return f;
}])
.directive('orderSupplierTypeAhead', ['itemsService', function(itemsService){
  var linker = function(scope, element, attrs){
    var nx;
      element.typeahead({
        source: function(query, process){
          return itemsService.getSupplierName(query,function(results, s){
            nx = s;
            return process(results);
          });
        },
        updater: function(name){
          _.some(nx, function(v,i){
            if(v.supplierName === name){
              scope.form.suppliers = {
                supplierID : v._id,
                supplierName: v.supplierName
              };
              return true;
            }
          });
          scope.$apply();
          return name;
        }
      });
  };
  return {
    link: linker
  };
}])
.directive('orderItemTypeAhead', ['itemsService', function(itemsService){
  var linker = function(scope, element, attrs){
    var nx;
      element.typeahead({
        source: function(query, process){
          return itemsService.getItemName(query,function(results, s){
            nx = s;
            return process(results);
          });
        },
        updater: function(name){
          itemsService.summary(name,'main', function(r){
            scope.form.itemData.itemName = r.itemName;
            scope.form.itemData.id = r._id;
            scope.form.suppliers = {
              supplierID : r.suppliers[0]._id,
              supplierName: r.suppliers[0].supplierName
            };
            scope.form.nafdacRegNo = r.nafdacRegNo;
            scope.form.nafdacRegName = r.itemName;
            scope.form.orderPrice = r.itemPurchaseRate;
            scope.summary = r;
          });
          scope.$apply();
          return name;
        }
      });
  };
  return {
    link: linker
  };
}])
.directive('orderCartBasket', ['ordersService', '$rootScope', function (OS, $rootScope) {
  return {
    link: function (scope) {
      //Fetch All Orders
      OS.orders('quotes', 'count')
      .then(function (i) {
       scope.my_quotation = i;
       // $rootScope.my_quotation = i;
      });

    },
    controller: 'orderCartController',
  };
}])

.filter('orderState', function () {
  return function (num) {
    switch (parseInt(num)) {
      case -1:
      return 'cancelled';
      break;
      case 0:
      return 'requesting quote';
      break;
      case 1:
      return 'replied quote';
      break;
      case 2:
      return 'order accepted';
      break;
      case 3:
      return 'confirmed';
      break;
      case 4:
      return 'in transit';
      break;
      case 5:
      return 'supplied';
      break;
      case 6:
      return 'paid';
      break;
      default:
      return 'archived';
      break;
    }
  }
});

