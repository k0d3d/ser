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
.controller('orderCartController', ['$scope', '$http', 'ordersService', function($scope, $http, ordersService){
  $scope.$parent.headerTitle = 'Search and Place Order';

  $scope.order_this = function(order, index){
    console.log(order);
    ordersService.postCartItem(order)
    .then(function () {
      $scope.$parent.orderCart.splice(index, 1);
    });
  };

  // $scope.placeOrder = function (cb) {
  //   if (!confirm('Confirm you want to place an order for these items!')) {
  //     cb(false); 
  //     return false;
  //   } 

  //   $scope.printScope = null;
  //   $scope.printScope = angular.copy($scope.basket);

  //   oS.postCart($scope.basket, function (list) {
  //     var cartIds = _.map($scope.orderCart, function (a) {
  //       return a.itemId;
  //     });


  //     var l = list.length;

  //     function __pop() {
  //       var t = list.pop();
  //       var o = _.indexOf(cartIds, t);

  //       if (o > -1) {
  //         $scope.orderCart.splice(o, 1);
  //       }
        
  //       if (l--) {
  //         __pop();
  //       } else {
  //         cb(true);
  //       }

  //     }

  //     __pop();
  //   });
  // };

  // $scope.send_sms = function(){
  //   var allSuppliers = _.map($scope.basket, function(v, i){
  //     return v.supplier.supplierID;
  //   });
  //   var uniqSupId = _.uniq(allSuppliers);
  //   if(uniqSupId.length > 1){
  //     return alert('Cannot send SMS to '+ uniqSupId.length +' suppliers at once');
  //   }else{
  //     oS.notifySupplier(uniqSupId, 'sms', function(d){

  //     });
  //   }
  // };

}])
.controller('ordersIndexController', function($scope, $http, $location, $routeParams, ordersService){
  $scope.$parent.headerTitle = 'Orders';
  $scope.getStatus = function (status){
    var d;
    switch(status){
      case 'pending order':
        d = 'supplied';
        //scope.orders[attrs.thisIndex].next ="Supplied";
      break;
      case 'supplied':
        d = 'paid';
        //scope.orders[attrs.thisIndex].next ="Paid";
      break;
      case 'paid':
       d = 'Complete';
      break;
      case 'received':
        d = 'supplied';
      break;
      case 'dispatched':
        d = 'supplied';
      break;
      default:
      d = null;
      break;
    }
    return d;
  };  
  $scope.ordersfilter = {
    orderStatus : ''
  };
  (function(){
    $scope.orders = [];
    
    ordersService.orders(7, 'small')
    .then(function(r){
      angular.forEach(r, function(v, i){
        v.nextStatus = v.orderStatus + 1;
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

  $scope.hide_order = function(index){
    var orderId = $scope.orders[index].orderId;
    
    ordersService.hideOrderItem(orderId)
    .then(function(o){
      $scope.orders.splice(index, 1);
    });
  };

  $scope.changeStatus = function(){
    var o = {
      status : $scope.uo.status,
      itemData : $scope.uo.itemData,
      amount : $scope.uo.amount,
      order_id : $scope.uo.order_id,
      invoiceno : $scope.uo.invoiceno
    };
    ordersService.updateOrder(o,function(r){

    });
  };
})
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
        $scope.$parent.orderCart.push(data);
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
      var res = [];
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
      })
    }

    f.updateOrder = function(o,callback){
      $http.put('/api/orders/'+escape(o.order_id), {
          "status": o.status,
          "itemData":o.itemData,
          "amount":o.amount,
          "orderInvoiceNumber": o.invoiceno,
          "amountSupplied": o.amountSupplied || undefined,
          "paymentReferenceType": o.paymentReferenceType,
          "paymentReferenceID": o.paymentReferenceID
        })
      .success(function(data){
        N.notifier({
          message: Lang.eng.order.update.success,
          type: 'success'
        });
        callback(data);
      })
      .error(function(data){
        N.notifier({
          message: Lang.eng.order.update.error,
          type: 'error'
        });        
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

    return f;
}]).directive('orderSupplierTypeAhead', ['itemsService', function(itemsService){
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
.directive('orderList', ['ordersService','Notification','Language', function(OS, N, L){
  function link (scope, element, attrs) {
    

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
}]);