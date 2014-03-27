/**
*  Admin Module
*
* Description
*/
angular.module('user', [])

.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/a/profile', {templateUrl: '/user/profile', controller: 'userController'});
}])
.controller('userController', function userController($scope){
	//Change HeaderTitle
  $scope.$parent.headerTitle = 'Profile';
})