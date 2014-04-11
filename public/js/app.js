/*jslint white: false */
// Declare app level module which depends on filters, and services

var app = angular.module('stocUser', [
  'ngRoute',
  'services',
  'user',
  'organization',
  'drug',
  'order',
  'language',
  'facility',
  'ngTagsInput',
  'ngDragDrop'
  ]);
app.config(function ($routeProvider, $locationProvider, $httpProvider) {
  $routeProvider
  .otherwise({
      redirectTo: '/'
    });
  $locationProvider.html5Mode(true);
  $httpProvider.interceptors.push('errorNotifier');
});

app.controller('MainController', [
  '$scope', 
  '$http', 
  '$location', 
  'Notification', 
  'ordersService',
  'organizeStaffService',
  function ($scope, $http, $location, Notification, OS, OSS) {

    $scope.orderCart = [];

    //Fetch All Orders
    OS.orders(0, 'short')
    .then(function (i) {
      $scope.orderCart = i;
    });

    $scope.workForce = {};

    //Fetch All Orders
    OSS.getMyWorkForce()
    .then(function (i) {
      $scope.workForce = i;
    });

    $scope.modal = {};
    $scope.notification = {};
    $scope.waiting = '';
    $scope.headerTitle = 'Dashboard';

    $scope.appName = 'stocCloud';

    $scope.commons = {
      href : function href (target) {
        //clear any modal-overlay displayed
        $scope.modal = {};
        $location.path(target);
      },
      backBtn: function backBtn() {
        history.back();
      }

    };

    $scope.itemCategory = [
    'Anasthetics', 
    'Analgesics,Anti Inflammatory & Anti Pyretics', 
    'Animal Vaccine Products', 
    'Anti Acids & Ulcer Healer Drugs', 
    'Anti Diabetics ', 
    'Anti  Asthmatics', 
    'Anti Bacterial Agents & Anti Protozal agents', 
    'Anti Biotics', 
    'Anti Caner', 
    'Anti Diarrhoea Drugs & Laxatives', 
    'Antiemetics & Antispasmodic', 
    'Anti Fungals', 
    'Anti Hemorroid Preparations', 
    'Anti Helminitics', 
    'Anti Histamines', 'Anti Malrials', 'Anti Migraine Drugs', 'Anti Muscarinic', 'Anti Neoplastic & Immunomodulating Agents', 'Anti Psychotic', 'Antiseptics,Disinfectants & Mouthwashes', 'Anti tussive,Expectorants & Mucolytics', 'Antiviral', 'Cardiovascular System', 'Contraceptives', 'Dermatological Preparations', 'Parkinson Drugs', 'Eye,Ear & Throat Preparations', 'Haematinics', 'Herbal Products', 'Hormones,Synthetics,Substitutes & Thyroid Drugs', 'Human Biologicals', 'Human Vaccine Products', 'Hypnotics,Anxiolities,Anti Convulsants & Anti depressant', 'Insecticides', 'Oxytocics', 'Pesticide Products', 'Rubefacients', 'Skeletal Muscle Relaxants', 'Vaccines & Biologicals', 'Veterinary Drugs/Products', 'Vitamins & Minerals', 'Miscellaneous', 'Others'];

    $scope.$on('newNotification', function (){
      $.gritter.add(Notification.notice);      
    });

    $scope.$on('newEvent', function () {
      $scope.modal = Notification.message;
    });

    $scope.toggleModal = function (modalId) {
      $('#' + modalId).modal('toggle');
    };


}]);
app.filter('moment', function(){
    return function(time){
        var m = moment(time);
        return m.fromNow();
    };
});
app.filter('dashed', function () {
  
  return function (word) {
    if ('undefined' === typeof(word)) {
      return 'Empty Profile';
    } else {
      return word;
    }
  };
});
app.filter('acctype', function () {
  
  return function (index) {
    var accounts = ['Pharmaceutical Company', 'Pharma Manager', 'Distributor', 'Dist. Manager', 'Sales Agent'];
    return accounts[index];
  };
});
app.filter('showHide', function () {
  
  return function (word) {
    return word ? 'Hide' : 'Show';
  };
});
app.directive('dropzone', [function () {
  return {
    link : function (scope, element, attrs) {
      $(element).dropzone({ 
        url: '/upload-doc',
        paramName: 'itemImage',
        maxFiles : 5,
        clickable: true,
        //uploadMultiple: true,
        autoProcessQueue: true,
        init : function () {
          this.on('success', function (file, name) {
            scope.ngModel.push(name);
          })
        }
      });
    },
    scope: {
      ngModel: '='
    },
    require: 'ngModel'
  };
}]);

app.directive('typeAhead', [function () {
  return {
    link : function (scope, element, attrs) {
   
      // constructs the suggestion engine
      var _productName = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('productName'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        //remote: '/api/internal/items/typeahead?query=%QUERY'
        remote: scope.remote
      });

      _productName.initialize();

      $(element).typeahead({
        hint: true,
        highlight: true,
        minLength: 1
      },
      {
        name: 'product-name',
        displayKey: 'productName',
        // `ttAdapter` wraps the suggestion engine in an adapter that
        // is compatible with the typeahead jQuery plugin
        source: _productName.ttAdapter()
      });

      //listen element to typeahead event
      $(element).on('typeahead:selected', function (e, suggestion) {
        scope.typeAhead({result: suggestion});
      });
    },
    scope: {
      remote: '@',
      typeAhead: '&'
    }
  }
}]);
app.directive('tooltips', function () {
  return {
    restrict: 'C',
    link: function (element, attrs) {
      $(element).tooltip({
        title : attrs.title
      });
    }
  }
});
app.factory('errorNotifier', ['$q', 'Notification', 'Language', function($q, N, L) {
  return {
    responseError: function (response) {
      console.log(response);
      N.notifier({
        title: L[L.set].titles.error ,
        text: response.data.message || response.data,
        class_name: 'growl-danger'
      });
      return $q.reject(response);
    }
  }
}])