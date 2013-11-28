/**
* orders Module
*
* Description
*/
angular.module('order', []).

config(['$routeProvider',function($routeProvider){
  $routeProvider.when('/orders', {templateUrl: '/order/index', controller: 'ordersIndexController'});
}]).
controller('ordersIndexController', function($scope, $http, $location, ordersService){
  (function(){
    ordersService.orders(0, function(r){
      $scope.orders = r;
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

})
.controller('orderAddController',function($scope, $http, $location, ordersService,itemsService, $routeParams){
  $scope.form = {
    itemData: {},
    supplierData: {}
  };
  $scope.modal = {};
  if($routeParams.itemId){
    itemsService.summary($routeParams.itemId, 'main', function(r){
      $scope.summary = r;
      $scope.form.itemData.itemName = r.itemName;
      $scope.form.itemData.itemID = r.itemID;
      $scope.form.itemData._id = r._id;
      $scope.form.suppliers = {
        supplierName : r.supplierName,
        supplierID : r.supplierID
      };
    });
  }
  $scope.saveButtonClass = 'btn-primary';
  $scope.submitOrder = function(){
    ordersService.save($scope.form, function(data){
      $scope.form = '';
    });
  };
})
.factory('ordersService',['$http', 'Notification','Language', function($http, N, L){
    var f = {};
    f.orders = function(page, callback){
      $http.get('/api/orders/'+ page)
      .success(function(data){
        callback(data);
      })
      .error(function(err){
        N.notifier({
          message:L[L.set].order.fetch.error,
          error: 'error'
        });
      });
    };
    f.updateOrder = function(o,callback){
      $http.put('/api/orders/' + o.order_id + '/hospital/'+ o.hospitalId +'/status/'+ o.orderStatus +'/')
      .success(function(data){
        N.notifier({
          message: L[L.set].order.update.success,
          type: 'success'
        });
        callback(data);
      })
      .error(function(data){
        N.notifier({
          message: L[L.set].order.update.error,
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

    return f;
}]).directive('judge', ['ordersService', function(os){
  var linker = function(scope, element, attrs){

  };

  var judgeCtrl = function judgeCtrl ($scope){
    function getStatus (status){
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
      default:
        break;
      }
      return d;
    }
    $scope.changeStatus = function(index){
      var o = {
        orderStatus : getStatus($scope.judge[index].orderStatus),
        hospitalId : $scope.judge[index].hospitalId,
        order_id : $scope.judge[index]._id,
      };
      os.updateOrder(o,function(){
        $scope.judge[index].orderStatus = getStatus($scope.judge[index].orderStatus);
      });
    };
  };
  return {
    link: linker,
    scope: {
      judge: '=',
      dx:'@'
    },
    templateUrl: '/order/order-list-tpl',
    controller: judgeCtrl
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
            scope.form.itemData.itemID = r.itemID;
            scope.form.itemData._id = r._id;
            scope.form.suppliers = {
              supplierID : r.suppliers[0]._id,
              supplierName: r.suppliers[0].supplierName
            };
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
}]);