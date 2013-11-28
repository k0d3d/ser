/**
*  Bills Module
*
* Description
*/
angular.module('bills', [])

.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/bills', {templateUrl: '/bills/index', controller: 'billsController'});
}])
.controller('billsController', ['$scope', '$location', '$routeParams', 'billsService', function itemIndexController($scope, $location, $routeParams,billsService){
    function init(){
      billsService.bills(function(f){
        $scope.bills = f;
      });
    }
    init();
}])
.factory('billsService', ['$http', 'Notification', 'Language', function($http, Notification, Lang){
  var i = {};

  //Fetches all bills ..hmmmmmmmm
  i.bills =  function(callback){
      $http.get('/api/bills').success(callback);
  };

  //Fetches a bill for a dispense record
  i.aBill = function(dispense_id, callback){
    $http.get('/api/bills/dispense/'+dispense_id)
    .success(function(data, res){
      callback(data);
    })
    .error(function(data, res){
      Notification.notifier({
        message: Lang.eng.dispense.bills.view.error,
        type: "error"
      });
    });
  };

  //pay for a bill
  i.postpay = function(amount, bill_id,callback){
    $http.put('/api/bills/'+bill_id, {amount: amount})
    .success(function(data, res){
      Notification.notifier({
        message: Lang.eng.dispense.bills.pay.success,
        type: "success"
      });
      callback(true);
    })
    .error(function(data, res){
      Notification.notifier({
        message: Lang.eng.dispense.bills.pay.error,
        type: "error"
      });
    });
  }

  //Typeahead for billing profiles
  i.pt = function(query, callback){
    $.getJSON('/api/bills/profiles/typeahead/'+escape(query), function(s) {
        var results = [];
        $.each(s,function(){
          results.push(this.profileName);
        });
        callback(results, s);
    });    
  };

  // Fetches all the billing profiles
  i.profiles = function(callback){
    $http.get('/api/bills/profiles')
    .success(function(data, res){
      callback(data);
    })
    .error(function(data, res){
      Notification.notifier({
        message: Lang.eng.bills.profiles.fetch.error,
        type: "error"
      });
    });
  };

  //Creates a new billing profile
  i.createProfile = function(profile, rules, callback){
    var r = [];
    _.each(rules, function(v, i){
      r.push(v._id);
    });    
    $http.post('/api/bills/profiles/', {
      rules: r,
      name: profile.name
    })
    .success(function(data, res){
      Notification.notifier({
        message: Lang.eng.bills.profiles.create.success,
        type: 'success'
      });
      callback(true);
    })
    .error(function(data, res){
      Notification.notifier({
        message: Lang.eng.bills.profiles.create.error,
        type: 'error'
      });
    });
  };
  //Saves the active billing profile along with its billing rules
  i.updateProfile = function(profile, rules, callback){
    var profile_id = profile.id || 0;
    $http.put('/api/bills/profiles/'+profile_id, {
      rules: rules,
      name: profile.name
    })
    .success(function(data, res){
      Notification.notifier({
        message: Lang.eng.bills.profiles.save.success,
        type: 'success'
      });
    })
    .error(function(data, res){
      Notification.notifier({
        message: Lang.eng.bills.profiles.save.error,
        type: 'error'
      });
    });
  };

  //Fetches rules belonging to a profile
  i.brules = function(profile_id, callback){
    $http.get('/api/bills/profiles/'+profile_id+'/rules')
    .success(function(data, res){
      callback(data);
    })
    .error(function(data, res){
      Notification.notifier({
        message: Lang.eng.bills.rule.fetch.error,
        type: 'error'
      });
    });
  };

  //Request all the billing rules from the server
  i.allrules = function(callback){
    $http.get('/api/bills/rules')
    .success(function(data, res){
      callback(data);
    })
    .error(function(data, res){
      Notification.notifier({
        message: Lang.eng.bills.rule.fetch.error,
        type: 'error'
      });
    });
  }

  //Posts the new rule to be created
  i.newruleR = function(rule, callback){
    $http.post('/api/bills/rules', rule)
    .success(function(data, res){
      Notification.notifier({
        message: Lang.eng.bills.rule.add.success,
        type: 'success'
      });
      callback(true);
    })
    .error(function(data, res){
      Notification.notifier({
        message: Lang.eng.bills.rule.add.error,
        type: 'error'
      });
      callback(true);
    });
  };
  return i;
}]);