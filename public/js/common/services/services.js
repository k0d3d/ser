/* Services */

angular.module('services', [])


.factory('Notification', function($rootScope, $timeout){
	var s = {};

	s.message = {
		heading: '',
		body: '',
		type: '',
		state:{},
		close: function(){
			this.state.overlay = '';
			this.state.dialog = '';
		}
	};

	s.notice = {
		message: '',
		icon: '',
		type: ''
	};

	s.resetNotification = function(){
		this.notice.message = '';
		this.notice.type = '';
		this.notice.icon ='';
		this.broadcastNotification();
	};
	
	//Opens a modal box
	s.notifier = function(m){
		var self =this;
		var icon = {
			"error" : "fa-exclamation-triangle", 
			"success": "fa-check",
			"info":"fa-info"
		}
		this.notice.message = m.message;
		this.notice.type = m.type;
		this.notice.icon = icon[m.type];
		this.broadcastNotification();
		//$timeout(self.resetNotification(),5000 );
		$timeout(function(){
			self.resetNotification();
		},5000 );
	};

	//Subtle notifications esp when connections
	//to server fail
	s.modal = function(n){
		var state = {
			"success": {
				"state": 'md-show',
				"class": 'md-success',
				"overlay": 'success-overlay'
			},
			"error":{
				"state": 'md-show',
				"class":'md-error',
				"overlay": 'error-overlay'
			}
		}
		this.message.heading = n.heading;
		this.message.body = n.body;
		this.message.state.overlay = state[n.type].overlay;
		this.message.class= state[n.type].class;
		this.message.state.dialog= state[n.type].state;
		this.broadcastEvent();
	};

	s.broadcastNotification = function() {
	    $rootScope.$broadcast('newNotification');
	};

	s.broadcastEvent = function(){
		$rootScope.$broadcast('newEvent');
	};
	return s;
})
.factory('Dialog', function($rootScope, $timeout){
	var d = {};

	d.dom = {
		heading : '',
		content : '',
		
	}
	return d;
})
.factory('Transaction', ['$http', '$q', function($http, $q){
	return {
		getTransactions: function(cb){
			$http.get('/api/transactions')
			.success(function(d){
				cb(d);
			})
		},
		rollbackTransactions: function(transactionId, cb){
			return $http.post('/api/transaction/'+transactionId+'?task=rollback')
			.then(cb, function(err){
				//Error Handler
				return $q.reject();
			}); 
		},
		cancelTransaction: function(transactionId, cb){
			return $http.post('/api/transaction/'+transactionId+'?task=cancel')
			.then(cb, function(err){
				//Error Handler
				return $q.reject();
			});
		}
	};
}])
.factory('serviceService', ['$http', 'Notification', 'Language', function($http, N, L){
	return {
		all: function(cb){
			$http.get('/api/bills/services')
			.success(function(r){
				N.notifier({
					message: L.eng.admin.services.allService.success,
					type: 'success'
				});
				cb(r);
			})
			.error(function(err){
				N.notifier({
					message: err,
					type: 'error'
				});
			});
		},
		delService: function(service_id, cb){
			$http.delete('/api/bills/services/'+service_id)
			.success(function(r){
				N.notifier({
					message: L.eng.admin.services.removeService.success,
					type: 'success'
				});
				cb(true);
			})
			.error(function(err){
				N.notifier({
					message: err,
					type: 'error'
				});
			});
		},
		newService: function(name, cb){
			$http.post('/api/bills/services/',{
				name: encodeURI(name)
			})
			.success(function(r){
				N.notifier({
					message: L.eng.admin.services.addService.success,
					type: 'success'
				});
				cb(r);
			})
			.error(function(err){
				N.notifier({
					message: err,
					type: 'error'
				});
			});
		},
		getItemName: function(query, cb){
			$http.get('/api/bills/services/s?s='+encodeURI(query))
			.success(function(r){

				cb(_.map(r, function(v){
					return v.name;
				}), r);
			})
			.error(function(err){
				N.notifier({
					message: err,
					type: 'error'
				});
			});
		}

	};

}])
.factory('userService', ['$http', 'Notification', 'Language', function ($http, N, L) {
	return {
		 loginUser: function (u, p, cb) {
		 	$http.post('/api/user/session',{
		 		email: encodeURI(u),
		 		password:p
		 	})
		 	.success(function (r) {
		 		N.notifier({
		 			message: L.eng.admin.auth.success,
		 			type: 'success'
		 		});
		 		cb(r);
		 	})
		 	.error(function (err) {
		 		N.notifier({
		 			message: err,
		 			type: 'error'
		 		});
		 	});
		 },
		 logoutUser: function (cb) {
		 	$http.delete('/api/user/session/')
		 	.success(function (r) {

		 	})
		 	.error( function (err) {

		 	});
		 }
	};

}]);
