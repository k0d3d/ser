/* Directives */
  /**
  * directives Modules
  *
  * Description
  */
var app = angular.module('directives', []);

app.directive('onFinish',function($timeout){
  return {
    restrict: 'A',
    link: function(scope, element, attr){
      if(scope.$last === true){
        $timeout(function(){
          switch (attr.onFinish){
            case "panorama":
              $('.panorama').panorama({
                 //nicescroll: false,
                 showscrollbuttons: false,
                 keyboard: true,
                 parallax: false
              });
            break;
            case "tableheader":
              $('table.table').fixedHeader();
            break;
            case "checkViewState":
              scope.$emit('onFinishLoaded', true);
            break;
            default:
            break;
          }
        });
        
      }
    }
  };
});

app.directive('alertMessage', ['$interpolate', '$sce', function ($interpolate, $sce) {
  //passing in the status for different 
  //alert type and stages. this function
  //return the right sentence, and html
  //formating to be displayed
  function gramar (alertType, alertDesc,  status) {
    var words = {
      'order': {
        '-1' : ' {{meta.orderAmount}} {{meta.itemId.itemPackaging}} of {{meta.itemId.itemName}} ' + alertDesc + ' {{meta.hospitalId.name}}',
        '0' : alertDesc + ' from <a href="">{{meta.hospitalId.name}}</a> for {{meta.orderAmount}} {{meta.itemId.itemPackaging}} of {{meta.itemId.itemName}}',
        '1' : '{{meta.orderAmount}} {{meta.itemId.itemPackaging}} of {{meta.itemId.itemName}}' + alertDesc ,
      }
    };

    status = (status > 1) ? 1 : status;

    return words[alertType][status];
  }

  return {
    link: function (scope) {
      var phrase = $interpolate(gramar(scope.act.alertType, scope.act.alertDescription, scope.act.meta.status || 0))(scope.act);
      scope.phrase = $sce.trustAsHtml(phrase);
    },
    scope: {
      act: '=alertMessage' 
    },
    template: '<strong ng-bind-html="phrase"></strong>'
  };
}]);

app.directive('modalbox', [function(){
  return {
    link: function($scope, iElm, iAttrs, controller) {
      $(iElm).on('click',function(){
        $('#mopop').modal('show');
      });
    }
  };
}]);

/**
* directives Module
*
* Description
*/
app.directive('toggleActiveList', [function(){
  // Runs during compile
  return {
    link: function($scope, iElm, iAttrs, controller) {
      iElm.on('click','li',function(e){
        e.preventDefault();
        $('ul.list-block li').removeClass('active');
        $(e.currentTarget).addClass('active');
      });
    }
  };
}]);

app.directive('tooltips', function () {
  return {
    restrict: 'C',
    link: function (element, attrs) {
      $(element).tooltip({
        title : attrs.title
      });
    }
  };
});

app.directive('scrollBar', function(){
    return {
        link: function(scope, element, attrs){
          //if(attrs.activate)
            $(element).on('scrollbar', function(){
                if(element.height() >= attrs.maxContainerHeight){
                    element.slimScroll({
                        height: attrs.maxContainerHeight+'px',
                        distance: '0'
                    });
                }
            });
        }
    };
});

app.directive('pagination', [function(){
  function link(scope, element, attrs){
    scope.currentPage = 0;
    // scope.limit = 10;
    $('button.prevbtn', element).on('click', function(e){
      if(scope.currentPage === 0) return false;
      scope.currentPage--;
      scope.$apply();

      // var page = scope.pageno - 1;
      // scope.pageTo({pageNo: page, limit: scope.limit, cb: function(r){
      //   if(r) scope.pageno--;
      // }});
    });
    $('button.nextbtn', element).on('click', function(e){
      scope.currentPage++;
      scope.$apply();
      // var page = scope.pageno + 1;
      // scope.pageTo({pageNo: page, limit: scope.limit, cb: function(r){
      //   if(r) scope.pageno++;
      // }});
    });
    scope.pagelimit = function(pageLimit){
      scope.pageTo({
        currentPage: scope.currentPage, 
        pageLimit: pageLimit, 
        cb: function(r){
          if(r) scope.pageLimit = pageLimit;
        }
      });  
      //quick hack!! should suffice for now
      scope.pageLimit = pageLimit;      
    };
  }
  return {
    link: link,
    scope: {
      pageTo: '&',
      currentPage: '=',
      pageLimit: '='
    },
    templateUrl: '/templates/pagination'
  };
}]);

app.directive('equals', function() {
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    link: function(scope, elem, attrs, ngModel) {
      if(!ngModel) return; // do nothing if no ng-model

      // watch own value and re-validate on change
      scope.$watch(attrs.ngModel, function() {
        validate();
      });

      // observe the other value and re-validate on change
      attrs.$observe('equals', function (val) {
        validate();
      });

      var validate = function() {
        // values
        var val1 = ngModel.$viewValue;
        var val2 = attrs.equals;

        // set validity
        ngModel.$setValidity('equals', val1 === val2);
      };
    }
  }
});