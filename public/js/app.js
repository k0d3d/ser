/*jslint white: false */
// Declare app level module which depends on filters, and services

var app = angular.module('stocUser', [
  'ngRoute',
  'ui.bootstrap',
  'services',
  'directives',
  'user',
  'organization',
  'drug',
  'order',
  'language',
  'facility',
  'ngTagsInput',
  'ngDragDrop',
  'xeditable',
  'checklist-model'
  ]);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

app.config(function ($routeProvider, $locationProvider, $httpProvider) {
  $routeProvider
  //.when('/', {templateUrl: '/drug/index', controller: 'drugIndexController'})
  .otherwise({
      redirectTo: '/a/profile'
    });
  $locationProvider.html5Mode(true);
  $httpProvider.interceptors.push('errorNotifier');

});

app.controller('MainController', [
  '$scope', 
  '$rootScope',
  '$http', 
  '$location', 
  'Notification', 
  'ordersService',
  'organizeStaffService',
  'appServices',
  function ($scope, $rootScope, $http, $location, Notification, OS, OSS, appServices) {


    $scope.workForce = {};

    //Fetch All Orders
    // OSS.getMyWorkForce()
    // .then(function (i) {
    //   $scope.workForce = i;
    // });

    $scope.modal = {};
    $scope.notification = {};
    $scope.waiting = '';
    $scope.headerTitle = 'Dashboard';

    

    $scope.appName = 'stocCloud';

    // $scope.commons = {
    //   href : function href (target) {
    //     //clear any modal-overlay displayed
    //     $scope.modal = {};
    //     $location.path(target);
    //   },
    //   backBtn: function backBtn() {
    //     history.back();
    //   }
    // };

    appServices.getCommons()
    .then(function (r) {
      // angular.extend($scope.commons, r);
      $scope.commons = r;
      // console.log($scope.commons);
    });

    $scope.$on('newNotification', function (){
      $.gritter.add(Notification.notice);      
    });

    $scope.$on('newEvent', function () {
      $scope.modal = Notification.message;
    });

    $scope.$on('newCart', function () {
      //angular.forEach()
      //$socpe.orderCart.push()
    });

    $scope.$on('activity_refresh', function () {
      $scope.activity = Notification.activityCount;
    });

    $scope.toggleModal = function (modalId, modalData, index) {
      if ($scope.__modal_data) {
        delete $scope.__modal_data;
      }
      if (modalData) {
        $scope.__modal_data = angular.copy(modalData);

      }
      if (index) {
        $scope.__modal_index = index;
      }
      $('#' + modalId).modal('toggle');
    };


}]);
app.filter('moment', function(){
    return function(time){
        var m = moment(time);
        return m.fromNow();
    };
});
app.filter('etaMoment', function(){
    return function(time){
        var m = moment(time);
        return m.calendar();
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
        url: attrs.postUrl,
        paramName: attrs.postParam,
        maxFiles : 5,
        clickable: true,
        previewsContainer: attrs.previews || false,
        //uploadMultiple: true,
        autoProcessQueue: true,
        init : function () {
          this.on('success', function (file, name) {
            if (typeof scope.ngModel === 'object') {
              scope.ngModel.push(name);
            } else {
              scope.ngModel = name;
            }
            scope.$apply();
            scope.postCb({name: scope.ngModel})
            .then(function () {

            }); 
          });
        }
      });
    },
    scope: {
      ngModel: '=',
      postCb: '&'
    },
    require: 'ngModel'
  };
}]);

app.directive('toggleActiveButton', [ function () {
  return {
    compile: function (element, attrs) {
      element.on('click', function () {

        var eleClass = attrs.toggleActiveButton;
        angular.element('.' + eleClass).removeClass('btn-success');
        element.addClass('btn-success');
      });
    }
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
  };
}]);

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
}]);

app.directive('linkTo', function () {
  return {
    link: function (scope, ele, attrs) {
        // var t = attrs.linkTo.split('-');
        // var aspect = t[0].trim();
        var id = scope.linkToId, accountType = scope.linkToAccountType;

        switch (scope.linkTo) {
          case 'drug':
            $(ele).prop('href', '/a/drugs/' + id + '/item');
            break;
          case 'user':
            $(ele).prop('href', '/a/organization/people/' + id+ '/person/' + accountType);
            break;
          default: 
            $(ele).prop('href', '/a/drugs/' + id + '/item');
            break;
        }

    },
    scope: {
      linkTo: '@',
      linkToId: '@',
      linkToAccountType: '@'
    }
  };
});