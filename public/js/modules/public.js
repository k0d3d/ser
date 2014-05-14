var publicModule = angular.module('stocPublic', [
  'ngRoute',
  'order',
  'services',
  'language',
  'drug',
  ]);


publicModule.controller('userController', [
  '$scope',
  'userServices',
  '$location',
  '$window',
  function userController ($scope, userServices, $location, $window) {
    $scope.send_login = function () {
      userServices.login($scope.form).then(function (r) {

        if (r.status !== 200) {
          $scope.auth_message = r.data.message;
        } else {
          $window.location.href = r.data.nextUrl;
        }

      });
    };
    $scope.send_registration = function() {
      userServices.register($scope.form).then(function (r) {
        console.log(r);
        if (r.status !== 200) {
          $scope.auth_message = r.data.message;
        } else {
          $window.location.href = r.data.nextUrl;
        }
      });
    };
  }
] );

publicModule.factory('userServices', ['$http', function ($http) {
  return {
    login : function (deets) {
      return $http.post('/users/session', deets)
      .then(function (r) {
        console.log(r);
        return r;
      }, function (err) {
        return err;
      });
    },
    register: function (deets) {
      return $http.post('/users', deets)
      .then(function (r) {
        return r;
      }, function (err) {
        return err;
      });
    }
  };
}]);

publicModule.directive('passwordMatch', function() {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      var checkMatch, firstPasswordElement, theElement, _i, _len, _ref, _results;
      firstPasswordElement = angular.element(document.getElementById('password_true'));
      checkMatch = function() {
        return scope.$apply(function() {
          var valid;
          valid = elem.val() === firstPasswordElement.val();
          return ctrl.$setValidity('passwordMatch', valid);
        });
      };
      _ref = [firstPasswordElement, elem];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        theElement = _ref[_i];
        _results.push(theElement.bind('keyup', function() {
          return checkMatch();
        }));
      }
      return _results;
    }
  };
});

