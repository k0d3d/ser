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
  }])
  .controller('drugIndexController', ['$scope', 'drugService', function drugIndexController ($scope, ds){
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
  .factory('drugService', ['$http', 'Language', 'Notification', function ($http, L, N) {
    var d = {};

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
