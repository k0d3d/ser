/**
*  Module
*
* Description
*/
angular.module('dashboard', [])

.config(['$routeProvider', function ($routeProvider){
	$routeProvider.when('/', {templateUrl: '/home/index', controller: 'dashboardIndexController'});
}])
.controller('dashboardIndexController', function($scope,ordersService){
	// itemsService.count(function(data){
	// 	console.log(data);
	// 	$scope.itemsCount = data;
	// });
	// ordersService.count(function(data){
	// 	$scope.ordersCount = data;
	// });
})
.controller('dashboardOrderController', function(){
	
});
