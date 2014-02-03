/**
*  Admin Module
*
* Description
*/
angular.module('user', [])

.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/signin', {templateUrl: '/users/signin', controller: 'userController'});
}])
.controller('userController', function userController(){
	
})