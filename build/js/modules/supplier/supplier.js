/**
*  item Module
*
* Description
*/
angular.module('supplier', [])

.config(['$routeProvider', function ($routeProvider){
	$routeProvider
		.when('/suppliers', {
			templateUrl: '/suppliers/index', 
			controller: 'supplierIndexController'
		})
		.when('/suppliers/add', {
			templateUrl: '/suppliers/new', 
			controller: 'supplierAddController'
		})
		.when('/suppliers/:supplierId/edit', {
			templateUrl: '/suppliers/edit', 
			controller: 'supplierEditController'
		});
}])
.controller('supplierIndexController', function supplierIndexController($scope, $location, $routeParams,supplierServices){
	function init(){
		$scope.supplierList = {};
		$scope.supplierView = {};
		supplierServices.all(1, function(r){
			if(r !== false)$scope.supplierList = r;
		});
	}
	init();

	$scope.viewMore = function(index){
		$('#modal-supplier-view').modal('toggle');
		$scope.supplierView = $scope.supplierList[index];
	}

	$scope.removeSupplier = function(index){
		var id = $scope.supplierList[index]._id;
		supplierServices.remove(id, function(after){
			//Any other callback logic after success or error
		});
	}

})
.controller('supplierAddController', function supplierAddController($scope, $location, $routeParams, supplierServices){
	$scope.supplierForm = {};
	$scope.addSupplier = function(){
		supplierServices.post($scope.supplierForm, function(r){
			if(r !== false){
				//Any other callback logic after success or error
				$scope.supplierForm = '';
				//$scope.newSupplier = false;
				//$scope.all = true;
			}
		});
	};
})
.controller('supplierEditController', function supplierEditController($scope, $location, $routeParams, supplierServices){
	$scope.supplierForm = {};
	function init(){
		if($routeParams.supplierId.length > 0){
			supplierServices.one($routeParams.supplierId, function(r){
				$scope.supplierForm = r;
			});
		}
	}
	init();
	$scope.update = function(){
		supplierServices.update($scope.supplierForm, function(r){
			if(r !== false){
			}
		});
	};
})
.factory("supplierServices", ['$http','Notification','Language', function($http, Notification, Lang){
	var a = {};

	a.all = function(page, callback){
		$http.get('/api/supplier/'+page)
		.success(function(data, status){
			callback(data);
		})
		.error(function(data, status){
			callback(false);
		});
	};

	a.post = function(supplierData, callback){
		$http.post("/api/supplier", supplierData)
		.success(function(data, status){
			Notification.modal({
				heading: 'Supplier Added',
				body: Lang.eng.supplier.add.success,
				type: 'success'
			});
			callback(data);
		})
		.error(function(data, status){
			Notification.modal({
				heading: 'Supplier Operation Error',
				body: Lang.eng.supplier.add.error,
				type: 'error'
			});			
			callback(false);
		});
	};

	a.one = function(supplierId, callback){
		$http.get("/api/supplier/"+supplierId)
		.success(function(data, status){
			callback(data);
		})
		.error(function(data, status){
			callback(false);
		});		
	};

	a.update = function(supplierData, callback){
		var supplierId = supplierData._id;
		$http.put("/api/supplier/"+supplierId, supplierData )
		.success(function(data, status){
			Notification.notifier({
				message: Lang.eng.supplier.update.success,
				type:'success'
			});			
			callback(data);
		})
		.error(function(data, status){
			Notification.notifier({
				message: Lang.eng.supplier.update.error,
				type: 'error'
			});
			callback(false);
		});			
	};

	a.remove = function(id, callback){
		$http.delete("/api/supplier/"+id)
		.success(function(data, success){
			Notification.notifier({
				message: "Supplier Deleted",
				type: 'success'
			});
		})
		.error(function(data, success){
			Notification.notifier({
				message: "Error deleting this supplier",
				type: 'error'
			});
		});
	};

	return a;
}]);