/**
* orders Module
*
* Description
*/
angular.module('order', []).

config(['$routeProvider',function($routeProvider){
  $routeProvider.when('/orders', {templateUrl: '/orders/all', controller: 'ordersIndexController'})
  .when('/orders/pending/:type', {templateUrl: '/orders/all', controller: 'ordersIndexController'})
  .when('/dashboard/orders/cart', {templateUrl: '/orders/cart', controller: 'orderCartController'})
  .when('/search/item', {templateUrl: '/drug/drug-search', controller: 'orderAddController'})
  .when('/dashboard/order/by/:by', {templateUrl: '/orders/add', controller: 'orderAddController'})
  .when('/dashboard/order/:itemId', {templateUrl: '/orders/add', controller: 'orderAddController'});
}])
.controller('orderCartController', ['$scope', '$http', 'ordersService', '$localStorage', function($scope, $http, oS, $localStorage){
  
  $scope.placeOrder = function (cb) {
    if (!confirm('Confirm you want to place an order for these items!')) {
      cb(false); 
      return false;
    } 

    $scope.printScope = null;
    $scope.printScope = angular.copy($scope.basket);

    // var doc = new jsPDF('p','in', 'letter');

    // // We'll make our own renderer to skip this editor
    // var specialElementHandlers = {
    //   '#frontpage': function(element, renderer){
    //     return true;
    //   },
    //   '.search-bar': function(element, renderer){
    //     return true;
    //   }
    // };

    // // All units are in the set measurement for the document
    // // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
    // doc.fromHTML($('.table-content').get(0), 0.5, 0.5, {
    //   'width': 800,
    //   'elementHandlers': specialElementHandlers
    // });

    // doc.save('Order Cart'+ Date.now());

    oS.postCart($scope.basket, function (list) {
      var cartIds = _.map($scope.orderCart, function (a) {
        return a.itemId;
      });


      var l = list.length;

      function __pop() {
        var t = list.pop();
        var o = _.indexOf(cartIds, t);

        if (o > -1) {
          $scope.orderCart.splice(o, 1);
        }
        
        if (l--) {
          __pop();
        } else {
          $localStorage.orderCart = angular.toJson($scope.orderCart);
          cb(true);
        }

      }

      __pop();
    });
  };

  $scope.send_sms = function(){
    var allSuppliers = _.map($scope.basket, function(v, i){
      return v.supplier.supplierID;
    });
    var uniqSupId = _.uniq(allSuppliers);
    if(uniqSupId.length > 1){
      return alert('Cannot send SMS to '+ uniqSupId.length +' suppliers at once');
    }else{
      oS.notifySupplier(uniqSupId, 'sms', function(d){

      });
    }
  };

}])
.controller('ordersIndexController', function($scope, $http, $location, $routeParams, ordersService){
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
    
    ordersService.orders(function(r){
      angular.forEach(r, function(v, i){
        v.nextStatus = $scope.getStatus(v.orderStatus.toLowerCase());
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

  $scope.removeOrder = function(event, order_id){
    var currentItem = event.currentTarget;
    console.log(currentItem);
    ordersService.remove(order_id, function(o){
      if(o.state === 1){
        $(currentItem).parents('tr').remove();
      }
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

  $scope.toggle = function(){
    $scope.plcordr = !$scope.plcordr;
    $scope.searchndl = !$scope.searchndl;
  };

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

  $scope.orderthis = function(){
    if($scope.ds.length === 0) return false;
    $scope.form = {
      orderType: 'Medication',
      itemData : {
        itemName: $scope.ds.productName,
        sciName: $scope.ds.composition
      },
      suppliers:{
        supplierName: $scope.ds.man_imp_supp
      },
      nafdacRegNo: $scope.ds.regNo,
      nafdacRegName: $scope.ds.productName
    };
    $scope.toggle();
  };

  $scope.saveButtonClass = 'btn-primary';
  $scope.submitOrder = function(){
    ordersService.save($scope.form, function(data){
      $scope.form = '';
    });
  };


  $scope.addToCart = function (item){
    var summary = $scope.summary;
    var toOrder = {
      itemId: item._id,
      itemName: item.itemName,
      sciName: item.sciName,
      orderAmount: item.amount,
      orderPrice: item.amount * item.currentPrice,
      supplier: item.pharmaId,
      orderDate: Date.now()
    };

    $scope.orderCart.push(toOrder);
    $scope.sdqty = $scope.sdprice = $scope.toOrderSupplier = '';
    //Store Cart Locally
    $scope.$storage.orderCart = __cleanJSON($scope.orderCart);
  };
})
.factory('ordersService',['$http', 'Notification','Language', function($http, Notification, Lang){
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
    f.orders = function(callback){
      var res = [];
      $http.get('/api/orders').success(function(data){
        var r = data;
        angular.copy(r,res);
        return callback(res);
      });
    };
    f.postCart = function(form, callback){
      $http.post('/api/orders/cart', form).
        success(function(data) {
          Notification.notifier({
            message : Lang.eng.order.place.success,
            type: 'success'
          });
            callback(data);
        }).
        error(function(err){
          Notification.notifier({
            message : Lang.eng.order.place.error,
            type: 'error'
          });          
        });
    };
    f.save = function(form, callback){
      $http.post('/api/orders', form).
        success(function(data) {
          Notification.notifier({
            message : Lang.eng.order.place.success,
            type: 'success'
          });
            callback(data);
        }).
        error(function(err){
          Notification.notifier({
            message : Lang.eng.order.place.error,
            type: 'error'
          });          
        });
    };
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
        Notification.notifier({
          message: Lang.eng.order.update.success,
          type: 'success'
        });
        callback(data);
      })
      .error(function(data){
        Notification.notifier({
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
    f.remove = function(order_id, callback){
      $http.delete('/api/orders/'+order_id)
      .success(callback);
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