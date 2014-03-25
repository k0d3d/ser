/*jslint white: false */
/* jshint indent:2 */

  /**
  *  drug Module
  *
  * Description
  */
angular.module('drug', [])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/drugs', {templateUrl: '/drug/index', controller: 'drugIndexController'})
    .when('/drugs/:drugId/item', {templateUrl: '/drug/one-item', controller: 'drugPageController'})
    .when('/drugs/add-new', {templateUrl: '/drug/add', controller: 'drugAddController'});
  }])
  .controller('drugIndexController', ['$scope', 'drugService', function drugIndexController ($scope, ds){
    //Change header title
    $scope.$parent.headerTitle = 'All Drug Items';

    ds.fetchAll()
    .then(function (r) {
      $scope._drugs = r;
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
  }])
  .controller('drugAddController', ['$scope', 'drugService', function ($scope, ds) {
    //Init the add item form model and 
    //the images field array
    $scope.add_item_form = {
      images: []
    }

    $scope.autoCompleteItemName = function (result) {
      console.log(result);
      $scope.add_item_form.sciName = result.composition;
      $scope.add_item_form.nafdacRegNo = result.regNo;
      $scope.$apply();
    }

    $scope.add_drug = function (data) {
      ds.addDrug(data)
      .then(function (r) {
        $scope.commons.href('/drugs');
      });
    };

  }])
  .controller('drugPageController', ['$scope', 'drugService', function ($scope, ds) {
      
  }])
  .factory('drugService', ['$http', function ($http) {
    var d = {};

    d.addDrug = function (data) {
      return $http.post('/api/drugs', data)
      .then(function (r) {
        return r.data;
      }, function (err) {
        console.log(err);
        return err;
      });
    }

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

    return d;
  }]);
