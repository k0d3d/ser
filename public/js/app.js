/*jslint white: false */
// Declare app level module which depends on filters, and services

var app = angular.module('stocUser', [
  'ngRoute',
  'services',
  'user',
  'organization'
  ]);
app.config(function ($routeProvider, $locationProvider) {
  $routeProvider
  .otherwise({
      redirectTo: '/'
    });
  $locationProvider.html5Mode(true);
});

app.controller('MainController', function ($scope, $http, $location, Notification) {
  $scope.modal = {};
  $scope.notification = {};
  $scope.waiting = '';

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