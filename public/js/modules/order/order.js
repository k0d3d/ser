/**
* orders Module
*
* Description
*/
angular.module('order', []).

config(['$routeProvider',function($routeProvider){
  $routeProvider.when('/a/orders', {templateUrl: '/order/index', controller: 'ordersIndexController'})
  .when('/a/orders/new', {templateUrl: '/order/new-order-search-item', controller: 'orderAddController'})
  .when('/a/orders/cart', {templateUrl: '/order/cart', controller: 'orderCartController'});
}])
.controller('orderCartController', ['$scope', '$http', 'ordersService', '$rootScope', function($scope, $http, ordersService, $rootScope) {
  $scope.$parent.headerTitle = 'Search and Place Order';

  //$scope.orderCart = $rootScope.orderCart;
  console.log($scope.orderCart);

  $scope.order_this = function(order, index){
    console.log(order);
    ordersService.postCartItem(order)
    .then(function () {
      $scope.orderCart.splice(index, 1);
    });
  };

  $scope.$on('cartloaded', function () {
    $scope.orderCart = $rootScope.orderCart;
  });

}])
.controller('ordersIndexController', ['$scope', '$http', '$location', '$routeParams', 'ordersService', 'organizeStaffService', function ($scope, $http, $location, $routeParams, ordersService, organizeStaffService) {
  $scope.$parent.headerTitle = 'Orders';
 
  $scope.ordersfilter = {
    orderStatus : ''
  };
  //
  (function(){
    $scope.orders = [];
    $scope.__temp = {};
    
    ordersService.orders(7, 'full')
    .then(function(r){
      angular.forEach(r, function(v, i){
        //v.nextStatus = v.orderStatus + 1;
        $scope.orders.push(v);
      });
      switch($routeParams.type){
        case 'invoices':
        $scope.ordersfilter.orderStatus = "Supplied";
        break;
        case 'order':
        console.log('message');
        $scope.ordersfilter.orderStatus = "Pending Order";
        break;
        default:
        $scope.ordersfilter.orderStatus = "";
        break;
      }
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
  $scope.$watch('__temp', function (n) {
    console.log(n);
    if (!_.isEmpty(n)) {
      var orderId = n.orderId;
      ordersService.getOrderStatusUpdates(orderId)
      .then(function (data) {
        $scope.__temp.orderStatusList = data;
        //qucik hack for tooltips.
        //please remove. it is very embarassing
        //.Oh mighty koded
        setTimeout(function () {
          $('.tooltips').tooltip();
        }, 1000);
      });
    }
  });

  $scope.open_order_manager = function (cmp) {
    console.log(cmp);
    $scope.__manageOrderModal = cmp;
  };

  $scope.update_order = function (order) {
    ordersService.updateOrder(order)
    .then(function () {
      $('#manage-order-modal').modal('hide');
    });
  };
  $scope.cancel_order = function (order) {
    order.status = -1;
    ordersService.updateOrder(order)
    .then(function () {
      $('#manage-order-modal').modal('hide');
    });
  };

}])
.controller('orderAddController',function($scope, $http, $location, ordersService,drugService, $routeParams){
  $scope.form = {
    itemData: {},
    supplierData: {}
  };
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

  if($location.by === 'composition'){
    $scope.plcordr = true;
  }else{
    $scope.searchndl = true;
  }

  $scope.search = function(queryObj){
    // $scope.ds = '';
    // var page = p || 0;
    
    ordersService.searchCmp(queryObj)
    .then(function (r) {
      console.log(r);
      //if (!_.isError(r)) {
        $scope.searchedItems = r;
        $scope.searchedItems.s = queryObj.s;
      //}
      
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
    if (!item.orderAmount) return false;
    
    //return console.log(item);
    ordersService.addToCart(item)
    .then(function(data){
        console.log(data);
        $rootScope.orderCart.push(data);
        $scope.form = '';
    });

    
  };


})
.factory('ordersService',['$http', 'Notification','Language', function($http, N, L){
    var f = {};

    f.searchCmp = function(queryCmp){

      return $http.get('/api/internal/item/search?' + $.param(queryCmp))
      .then(function (i) {
        return i.data;
      }, function (err) {
        return err;
      });

    };

    f.getAllSuppliers = function(callback){
      $http.get('/api/orders/suppliers/'+escape(query)).success(function(data){
        callback(data);
      });
    };
    f.getSupplierName = function(query, callback){
      // $http.get('/api/orders/supplier/typeahead/'+query).success(function(data){
      //   callback(data);
      // });
      $.getJSON('/api/orders/supplier/typeahead/'+escape(query), function(s) {
          var results = [];
          $.each(s,function(){
            results.push(this.supplierName);
          });
          callback(results);
      });
    };

    //Gets orders by status and display
    f.orders = function(status, displayType){
      return $http.get('/api/orders/' + status + '/display/' + displayType)
      .then(function (d){
        return d.data;
      }, function (err) {
        return err;
      });
    };

    //Post one item to be sent as an order
    f.postCartItem = function(form){
      return $http.put('/api/orders/' + form.orderId + '/status/1', form)
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
    f.addToCart = function(form){
      return $http.post('/api/orders', form)
      .then(function (r) {
        N.notifier({
          title: L[L.set].titles.success,
          text: L[L.set].order.cart.place.success,
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
      return $http.get('/api/activities')
      .then(function (r) {
        return r.data;
      }, function (err) {
        return err;
      });
    };

    //makes an order update request.
    f.updateOrder = function (o) {
      return $http.put('/api/orders/'+escape(o.orderId), o)
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
      return $http.delete('/api/orders/' + orderId)
      .then(function (r) {
        return r.data;
      }, function(err) {

      });
    };

    //remove or cancel an order
    f.remove = function(order_id){
      return $http.delete('/api/orders/'+order_id)
      .then(function (r) {
        return r.data
      }, function(err) {

      });
    };

    f.moreInfo = function (id, callback) {
      $http.get('/api/orders/ndl/' + id + '/summary')
      .success(function (d) {
        callback(d);
      })
      .error(function (d) {
        Notification.notifier({
          message: Lang[Lang.set].order.summary.error,
          type: 'error'
        });
      });
    };

    f.notifySupplier = function(id, type, cb){
      $http.post('/api/suppliers/'+id+'/notify?type='+type)
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
      return $http.get('/api/orders/' + orderId + '/statuses')
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
      OS.orders(0, 'short')
      .then(function (i) {
       scope.orderCart = i;
       $rootScope.orderCart = i;
       $rootScope.$broadcast('cartloaded');
      });

    },
    //controller: 'orderCartController',
  };
}])
.directive('orderList', ['ordersService','Notification','Language', function(OS, N, L){
  function link () {
    

  }
  function Ctrlr ($scope){
  
    $scope.updateOrder = function(index){
      if($scope.orderList[index].nextStatus == 'supplied' && 
        (!$scope.orderList[index].amountSupplied || 
          !$scope.orderList[index].orderInvoice)){
        alert('Please check the required fields: Missing Amount / Invoice Number');
        return false;
      }
      if($scope.orderList[index].nextStatus == 'paid' && 
        (!$scope.orderList[index].paymentReferenceType || 
          !$scope.orderList[index].paymentReferenceID)){
        alert('Please check the required fields: Payment ID / Payment Type');
        return false;
      } 
      var o ={
        status : $scope.orderList[index].nextStatus,
        itemData : $scope.orderList[index].itemData,
        amount : $scope.orderList[index].orderAmount,
        order_id : $scope.orderList[index]._id,
        invoiceno : $scope.orderList[index].orderInvoice,
        amountSupplied: $scope.orderList[index].amountSupplied,
        paymentReferenceType: $scope.orderList[index].paymentReferenceType,
        paymentReferenceID: $scope.orderList[index].paymentReferenceID
      };
      OS.updateOrder(o, function(r){
        $scope.orderList[index].orderStatus = r.result;
        $scope.orderList[index].nextStatus = $scope.getStatus({status: r.result});
        if(r.result == 'supplied' && ($scope.orderList[index].amountSupplied < $scope.orderList[index].orderAmount)){
          N.notifier({
            message: L[L.set].order.update.amountDis,
            type: 'info'
          });
        }
      });
    };


    $scope.removeOrder = function(event, order_id){
      var currentItem = event.currentTarget;
      OS.remove(order_id, function(o){
        if(o.state === 1){
          $(currentItem).parents('tr').remove();
        }
      });
    };    

  }
  return {
    link: link,
    controller: Ctrlr,
    scope: {
      orderList: '=',
      ordersFilter: '=',
      getStatus: '&'
    },
    templateUrl: '/templates/order-list'
  };
}])
.filter('orderState', function () {
  return function (num) {
    switch (parseInt(num)) {
      case -1:
      return 'cancelled';
      break;
      case 1:
      return 'placed';
      break;
      case 2:
      return 'disputed';
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
      return 'unknown';
      break;
    }
  }
});