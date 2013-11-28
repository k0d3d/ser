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
