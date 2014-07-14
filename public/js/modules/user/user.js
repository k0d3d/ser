/**
*  Admin Module
*
* Description
*/
angular.module('user', [])

.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/a/profile', {
    templateUrl: '/user/profile', 
    controller: 'userController'
  });
}])
.controller('userController', [
  '$scope', 
  'userServices', 
  'ordersService', 
  'Notification',
  'drugService',
  'organizeStaffService',
  'facilityServices',
  function userController($scope, US, ordersService, N, ds, oss, facilityService){
  //Change HeaderTitle
  $scope.$parent.headerTitle = 'Profile';
  $scope.activity = [] ;

  //Fetch Activities
  US.fetchActivities()
  .then(function (i) {
    angular.forEach(i, function (v) {
      v.created = new Date(v.created);
      $scope.activity.push(v);
    });
    N.broadcastActivity(i.length);
    // N.activityCount = i.length;
    // $scope.activity = i;
  });

  US.fetchProfile()
  .then(function (i) {
    $scope.userProfile = i;
    $scope.userProfile.image = i.image || 'default-avatar.jpg';
    // angular.extend($scope.userProfile, i);
  });


  $scope.confirm_order = function confirm_order (order) {
    order.orderStatus = 3;
    ordersService.updateOrder(order)
    .then(function () {

    });
  };  

  $scope.update_profile = function update_profile (data, value) {
    var field = value.split('.');
    US.updateProfile({name : field[1], value: data})
    .then(function (r) {

    });
  };

  $scope.update_account_notices = function update_account_notices (field) {
    // e.stopPropagation();
    var value = $scope.userAccount.allowedNotifications[field];
    // console.log(field, value);
    US.updateAccount({name : 'allowedNotifications.' + field, value: !value})
    .then(function (r) {
      N.notifier({
        title: 'Success',
        text: 'Alert preference changed!!',
        class_name: 'growl-success'
      });
    });    
  };

  $scope.validate_facility = function validate_facility (data) {
    facilityService.searchFacility(data)
    .then(function (res) {
      if (!_.isEmpty(res)) {
        $scope.valRes = res;
      } else {
        $scope.valRes = 'none';
      }
      
    });
  };

  $scope.validate_this = function validate_this (res) {
    US.validateThis(res)
    .then(function (v) {
      $('#activate-hospital-modal').modal('hide');
    });
  };
  //quick send to quote
  $scope.quickQuote = [];

  //Places a quick quote
  $scope.place_quick_cart = function place_quick_cart (load) {
    var l = 0;
    function __qu () {    
      var item = load.pop();
      if (!item.packageCount) return alert('please check the amount to be ordered.');
      item.orderAmount = item.packageCount * item.itemId.packageQty;
      item.owner = {
        "userId" : item.itemId.supplier.supplierId,
        "account_type": 2
      };
      item.currentPrice =  item.itemId.currentPrice;
      item.itemId = item.itemId._id;
      // item.instantQuote = true;
      delete item._id;
      ordersService.addToQuotations(item)
      .then(function(data){
          item.sentRequest = 'sent';
          $scope.my_quotation.push(data);

          l++;
          
          if (load.length) {
            __qu();
          } else {
            N.notifier({
              title: 'Welldone!',
              text: l + 'Quick Quote(s) Requested',
              class_name: 'growl-success'
            });
          }
      });    
    }

    __qu();

  };
  //removes a drug from the users profile.+ 
  $scope.remove_my_drug = function (drugId, index) {
    oss.removeMyDrug(drugId)
    .then(function () {
      $scope.userProfile.drugs.splice(index, 1);
    });
  };

  $scope.change_profile_photo = function (name) {
    return US.updateProfile({name : 'image', value: name});   
  };

  $scope.hide_activity = function (index) {
    var id = $scope.activity[index]._id;
    US.hideActivity({id: id})
    .then(function () {
      $scope.activity.splice(index, 1);
      $scope.$parent.activity--;
    });
  };

}])
.filter('territory', function () {
  return function (arr) {
    var e = '';
    angular.forEach(arr, function (v) {
      e += ', ' + v.toUpperCase();
    });
    return e;
  };
})
.factory('userServices', ['$http', 'Notification', function ($http, N) {
  return {
    fetchActivities: function fetchActivities () {
      return $http.get('/api/internal/activities')
      .then(function (r) {
        return r.data;
      });
    },
    fetchProfile: function fetchProfile (){
      return $http.get('/api/internal/users/profile')
      .then(function (r) {
        return r.data;
      });
    },
    updateProfile: function updateProfile (data) {
      return $http.put('/api/internal/users/profile', data)
      .then(function (r) {
        return r.data;
      });
    },
    updateAccount: function updateProfile (data) {
      return $http.put('/api/internal/users', data)
      .then(function (r) {
        return r.data;
      });
    },
    // searchFacility: function searchFacility (data) {
    //   return $http.get('/api/internal/facilities/search?type=facilty&' + $.param(data))
    //   .then(function (r) {
    //     return r.data;
    //   });
    // },
    validateThis : function validateThis (data) {
      return $http.post('/api/internal/facilities/validate', data)
      .then(function (r){
        N.notifier({
          title: 'Welldone',
          text: 'Hospital Validated Successfully',
          class_name: 'growl-success'
        });
        return r.data;
      });
    },
    hideActivity : function hideActivity (data) {
      return $http.delete('/api/internal/activities?id='+ data.id)
      .then(function () {
        return true;
      });
    }
  };
}]);