/**
*  Admin Module
*
* Description
*/
angular.module('user', [])

.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/profile', {templateUrl: '/user/profile', controller: 'userController'});
}])
.controller('userController', function userController(){
	
})