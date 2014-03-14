/**
*  Admin Module
*
* Description
*/
angular.module('admin', [])

.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/admin', {templateUrl: '/admin/index', controller: 'adminController'});
}])
.controller('adminController', ['$scope', 'billsService', function adminController($scope, biller){

    function init(){
        //Holds the new rule form
        $scope.newrule = {
           reference:{}
        };

        //holds the list of all created billing profiles
        $scope.p = [];

        //Holds the list of select billing profiles
        $scope.activeProfile = [];

        //Holds the list of visible rules
        $scope.listrules = [];
        $scope.l = [];

        $scope.profileInput = {
            name: '',
            id: 0
        };

        //Calls for the list of created profiles
        biller.profiles(function(r){
            $scope.profiles = r;
            angular.forEach(r, function(value, index){
                $scope.p.push(value.profileName);
            });
        });
    }
    init();

    function keisha (){

    }

    // //Watch the profile name input field for changes
    // $scope.$watch("profile_name_input", function(newV, oldV){
    //     if(newV === oldV) return newV;
    //     $scope.activeProfile.unshift({
    //         id: 0,
    //         name: newV
    //     });
    // });

    // Saves a new rule. 
    $scope.newruleC = function(){
        biller.newruleR($scope.newrule, function(){

        });
    };

    $scope.popRules = function(){
        biller.allrules(function(r){
            $scope.rulez =r;
        });
    };

    $scope.pushrule = function(index){
        if(_.indexOf($scope.l, $scope.rulez[index].name) > -1) return false;
        $scope.l.push($scope.rulez[index].name);
        $scope.listrules.push($scope.rulez[index]);
    };

    $scope.$watch('activeProfile', function(n, o){
        if(n.length === 0) return false;
        $scope.profileInput.name = n.profileName;
        $scope.profileInput.id = n._id;
        biller.brules(n._id, function(r){
            $scope.l =[];
            angular.forEach(r, function(value, index){
                $scope.l.push(value.name);
            });
            $scope.listrules =  r;
        });
    }, true);

    //Creates a new billing profile
    $scope.saveProfile = function(){
        if($scope.profileInput.name.length === 0) return false;
        if(_.indexOf($scope.p, $scope.profileInput.name) > -1){
            biller.updateProfile($scope.profileInput, $scope.listrules, function(r){

            });
        }else{
            biller.createProfile($scope.profileInput, $scope.listrules, function(r){
                $scope.p.push($scope.profileInput.name);
            });
        }
    };
}])
.directive('propdrug', ["itemsService", function(itemsService){
  var linker = function(scope, element, attrs){
    var nx;
      element.typeahead({
        source: function(query, process){
          if(query === "all" || query === "ALL" || query === "All" || query === "*" ) return process(["All"]);
          return itemsService.getItemName(query,function(results, s){
            nx = s;
            return process(results);
          });
        },
        updater: function(name){
          _.some(nx, function(v,i){
            if(v.itemName === name){
              scope.newrule.reference.id = v._id;
              scope.newrule.reference.name = v.itemName;
              return true;
            }
          });          
          scope.$apply();
          return name;
        }
      });
  };
  return {
    link: linker
  };
}]);