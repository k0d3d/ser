/*jslint white: false */
// Declare app level module which depends on filters, and services

var app = angular.module('integraApp', [
  'admin',
  'order',
  'stock',
  'report',
  'drug',
  'bills',
  'dispense',
  'supplier',
  'dashboard',
  'hospital',
  'directives',
  'services',
  'language'
  ]);
app.config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    otherwise({
      redirectTo: '/'
    });
  $locationProvider.html5Mode(true);
});

app.controller('MainController', function($scope, $http, $location, Notification){
  $scope.modal = {};
  $scope.notification = {};
  $scope.waiting = '';
  function href(target){
    $scope.modal = {};
    $location.path(target);
  }
  function backBtn(){
    history.back();
  }
  

  //List of Item forms 
  var itemForm = [
   'Tablets',
   'Capsules',
   'Vials',
   'Caplets',
   'Amples',
   'Emugels',
   'Gels',
   'Ointments',
   'Suspensions',
   'Syrup',
   'Powder',
   'Cream',
   'Lotion',
   'Drops',
   'Sprays',
   'Suppositories',
   'Solutions',
   'Sheet'
  ];

  //List of Item Packaging
  var itemPackaging = [
     'Tin',
     'Carton',
     'Sachet',
     'Roll',
     'Pieces',
     'Packet',
     'Gallon',
     'Bottles',
     'Bags',
     'Box',
     'Tube'
  ];

  $scope.commons = {
    href : href,
    backBtn: backBtn,
    itemForm : itemForm,
    itemPackaging: itemPackaging

  };

  $scope.$on('newNotification', function(){
    $scope.notification = Notification.notice;
  });
  $scope.$on('newEvent', function(){
    $scope.modal = Notification.message;
  });
});
app.filter('moment', function(){
    return function(time){
        var m = moment(time);
        return m.fromNow();
    };
});