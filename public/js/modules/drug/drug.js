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


    $scope.add_to_list = function (item) {
      ds.addToMyList({drugId: item._id})
      .then(function (r) {
        
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
  .factory('drugService', ['$http', 'Notification', 'Language', function ($http, N, L) {
    var d = {};

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

    return d;
  }]);
