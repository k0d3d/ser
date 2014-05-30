/**
* reports Module
*
* Description
*/
angular.module('report', []).

config(['$routeProvider',function($routeProvider){
  $routeProvider.when('/reports', {templateUrl: '/reports/dashboard', controller: 'reportsDashboardController'});
}]).
controller('reportsDashboardController', function($scope, $http, $location, $dialog, ordersService){

})