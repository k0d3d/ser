/*jslint white: false */
/* jshint indent:2 */

  /**
  *  drug Module
  *
  * Description
  */
angular.module('drug', [])

  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.when('/a/drugs', {templateUrl: '/drug/index', controller: 'drugIndexController'})
    .when('/a/drugs/:drugId/item', {controller: 'drugPageController'})
    .when('/a/drugs/add-new', {templateUrl: '/drug/add', controller: 'drugAddController'});
    $locationProvider.html5Mode(true);
  }])
  .controller('drugIndexController', ['$scope', 'drugService', 'organizeStaffService', function drugIndexController ($scope, ds, oss){
    //Change header title
    $scope.$parent.headerTitle = 'All Drug Items';

    ds.fetchAll()
    .then(function (r) {
      $scope._drugs = r;
    });

    ds.getStockDownRequest()
    .then(function (r) {
      $scope._request = r;
      ds.getStockUpRequest()
      .then(function (u) {
        angular.forEach(u, function (v) {
          $scope._request.push(v);
        });
      });
    });

    //ds.search
    $scope.searchcmp = function () {
      $scope.summary = $scope.newprice = '';
      ds.search($scope.drugname, 0, function (r) {
        $scope.drugs = r;
      });
    };

    $scope.more = function (index) {
      ds.moreInfo($scope.drugs[index]._id, function(r){
        $scope.summary = r;
        $scope.summary.index = index;
      });
    }

    $scope.up = function (id, price, index) {
      console.log(price);
      ds.updatePrice(id, price, function () {
        $scope.drugs[index].currentPrice = price;
        $scope.newprice = '';
      });
    };


    $scope.add_to_list = function (item) {
      ds.addToMyList({drugId: item._id})
      .then(function (r) {
        
      });      
    };
    //requests the availbale staff and managers or employers
    $scope.item_stock = function (item) {
      $scope.current_item = item;
    };

    //add to stock request
    $scope.stock_from = function (stockUp) {
      var current_item = $scope.current_item;
      //stockUp.staff = stockUp.staff || {};
      ds.postStockUp(stockUp, current_item._id)
      .then(function (done) {

      });
    };

    //send stock to employee
    $scope.stock_to = function (stockTo) {
      var current_item = $scope.current_item;
      ds.postStockTo(stockTo, current_item._id)
      .then(function (done) {

      });
    };

    //view all stock up transaction
    $scope.view_stock_up = function (current_item) {
      ds.getStockUpHistory(current_item._id)
      .then(function (done) {
        $scope.stockLog = done;

      });
    };

    //view all stock down transaction
    $scope.view_stock_down = function (current_item) {
      ds.getStockDownHistory(current_item._id)
      .then(function (done) {
        $scope.stockLog = done;
      });
    };

    $scope.approve_request = function (item) {
      var nextStatus = (item.status < 2) ? item.status + 1 : 2;
      ds.attendRequest(item.itemId._id, item.transactionId, nextStatus)
      .then(function (done) {
        item.status = done.status;
      });
    };

    $scope.reject_request = function (item) {
      var nextStatus = - 1;
      ds.attendRequest(item.itemId._id, item.transactionId, nextStatus)
      .then(function (done) {
        item.status = done.status;
      });
    };
    $scope.cancel_request = function (item) {
      var nextStatus = - 2;
      ds.cancelRequest(item.itemId._id, item.transactionId, nextStatus)
      .then(function (done) {
        item.status = done.status;
      });
    };
  }])
  .controller('drugAddController', ['$scope', 'drugService', function ($scope, ds) {
    //Init the add item form model and 
    //the images field array
    $scope.add_item_form = {
      images: [],
      pharma: {},
      distributor: []
    }

    $scope.autoCompleteItemName = function (result) {
      $scope.add_item_form.itemName = result.productName;
      $scope.add_item_form.sciName = result.composition;
      $scope.add_item_form.nafdacRegNo = result.regNo;
      $scope.add_item_form.pharma.pharmaName = result.man_imp_supp;
      $scope.$apply();
    };

    $scope.add_drug = function (data) {
      ds.addNewDrug(data)
      .then(function (r) {
        if (r instanceof Error) {
          console.log(r);
        } else {
          if ($scope.nextAction === 'newAddition') {
            $scope.add_item_form = '';
          } else if ($scope.nextAction === 'listPage') {
            $scope.commons.href('/a/drugs');
          }
          
        }
      });
    };


  }])
  .controller('drugPageController', ['$scope', 'drugService', function ($scope, ds) {
      
  }])
  .filter('stockRequestState', function () {
    var states = {
      '-2': 'request cancelled.',
      '-1': 'cancelling request',
      '0': 'request sent',
      '1': 'request received',
      '2': 'request confirmed and verified'
    };
    return function (num) {
      return states[num];
    };
  })
  .factory('drugService', ['$http', 'Notification', 'Language', function ($http, N, L) {
    var d = {};

    d.attendRequest = function (itemId, transactionId, nextStatus) {
      return $http.post('/api/drugs/' + itemId + '/requests/' + transactionId + '?nextStatus=' + nextStatus)
      .then(function (done) {
        return done.data;
      });
    };
    d.cancelRequest = function (itemId, transactionId, nextStatus) {
      return $http.delete('/api/drugs/' + itemId + '/requests/' + transactionId + '?nextStatus=' + nextStatus)
      .then(function (done) {
        return done.data;
      });
    };

    d.getStockUpHistory = function (itemId) {
      return $http.get('/api/drugs/' + itemId + '/history?action=stockUp')
      .then(function (r) {
        return r.data;
      });
    };
    d.getStockUpRequest = function () {
      return $http.get('/api/drugs/requests?action=stockUp')
      .then(function (r) {
        return r.data;
      });
    };

    d.getStockDownHistory = function (itemId) {
      return $http.get('/api/drugs/' + itemId + '/history?action=stockDown')
      .then(function (r) {
        return r.data;
      });      
    };

    d.getStockDownRequest = function () {
      return $http.get('/api/drugs/requests?action=stockDown')
      .then(function (r) {
        return r.data;
      });      
    };

    d.addNewDrug = function (data) {
      return $http.post('/api/drugs', data)
      .then(function (r) {
        N.notifier({
          title : 'Yippie!',
          text: L[L.set].items.save.success,
          class_name: 'growl-success'
        });
        return r.data;
      }, function (err) {
        N.notifier({
          title : 'Oops!',
          text: L[L.set].items.save.error,
          class_name: 'growl-danger'
        });        
        return err;
      });
    };

    d.addToMyList = function (data) {
      return $http.post('/api/internal/organization/staff/drugs/', data)
      .then(function (r) {
        return r.data;
      }, function (err) {
        console.log(err);
        return err;
      });
    };

    d.fetchAll = function (options)  {
      options = options || {};
      return $http.get('/api/drugs', options)
      .then(function (r) {
        return r.data;
      }, function (err) {
        return err;
      });
    };

    d.fetchOne = function (id) {
      return $http.get('/api/drugs/' + id)
      .then(function (r) {
        return d.data;
      }, function (err) {
        return err;
      });
    };
    
    d.updateOne = function (id) {
      return $http.put('/api/drugs/' + id)
      .then(function (r) {
        return d.data;
      }, function (err) {
        return err;
      });
    };    
    d.deleteOne = function (id) {
      return $http.delete('/api/drugs/' + id)
      .then(function (r) {
        return d.data;
      }, function (err) {
        return err;
      });
    };

    //d.fetchProps = function (query, )

    d.search = function (srchstr, page, callback) {
      $http.get('/api/drugs/' + srchstr + '/page/' + page)
      .success(function (d) {
        if(_.isEmpty(d)) {
          N.notifier({
            message: L[L.set].drug.search.notfound,
            type: 'error'
          });          
        }
        callback(d);
      })
      .error(function () {
        N.notifier({
          message: L[L.set].drug.search.error,
          type: 'error'
        });
      });
    };

    d.moreInfo = function (id, callback) {
      $http.get('/api/drugs/' + id + '/view/summary')
      .success(function (d) {
        callback(d);
      })
      .error(function (d) {
        N.notifier({
          message: L[L.set].drug.summary.error,
          type: 'error'
        });
      });
    };

    d.updatePrice = function (id, price, cb) {
      $http.put('/api/drugs/' + id, {price : price})
      .success(function () {
        N.notifier({
          message: L[L.set].drug.update.success,
          type: 'success'
        });
        cb();
      })
      .error(function () {
        N.notifier({
          message: L[L.set].drug.update.error,
          type: 'error'
        });
      });
    };

    d.postStockTo = function postStockTo (stockToData, itemId) {
      return $http.post('/api/drugs/' + itemId + '/stockto', stockToData)
      .then(function (done) {
        return done.data;
      });
    };

    d.postStockUp = function postStockUp (stockUpData, itemId) {
      return $http.post('/api/drugs/' + itemId + '/stockup', stockUpData)
      .then(function (done) {
        return done.data;
      });      
    };

    return d;
  }]);
