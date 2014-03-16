/**
*  Admin Module
*
* Description
*/
angular.module('organization', [])

.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/organization', {templateUrl: '/organization/all-staff', controller: 'staffController'});
}])
.controller('staffController', function userController(){
  
})