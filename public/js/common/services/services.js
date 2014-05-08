/* Services */

angular.module('services', [])


.factory('Notification', function($rootScope){
	var s = {};

	s.notice = {

		// (string | mandatory) the heading of the notification
		title: '',
		// (string | mandatory) the text inside the notification
		text: '',
		// (string | optional) the image to display on the left
		image: null,
		// (bool | optional) if you want it to fade out on its own or just sit there
		sticky: true,
		// (int | optional) the time you want it to be alive for before fading out
		time: ''

	};

	s.resetNotification = function(){
		this.notice.message = '';
		this.notice.type = '';
		this.notice.icon ='';
		this.broadcastNotification();
	};
	
	//Opens a modal box
	s.notifier = function(m){
		this.notice = m;
		this.broadcastNotification();
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
.factory('appServices', ['$http', function ($http) {
	return {
		getCommons: function () {
      return $http.get('/api/internal/commons')
      .then(function (r) {
        return r.data;
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
