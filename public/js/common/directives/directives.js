/* Directives */
  /**
  * directives Modules
  *
  * Description
  */
  angular.module('directives', []);
  angular.module('directives').directive('typeAhead',function(ordersService, itemsService){

    var linker = function(scope, element, attrs){
      $(element).typeahead({
        name: 'item-search',
        remote: '/search.php?query=%QUERY',
        // minLength: 3,
        // limit: 10
      })
    };
    return{
      restrict: 'A',
      link: linker
    };
  });
  angular.module('directives').directive('onFinish',function($timeout){
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
  angular.module('directives').directive('modalbox', [function(){
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
  angular.module('directives').directive('toggleActiveList', [function(){
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
  angular.module('directives').directive('orderActionButton', function(ordersService){
    function getStatus (status){
        var d;
        switch(status){
          case 'pending order':
            d = 'supplied';
            //scope.orders[attrs.thisIndex].next ="Supplied";
          break;
          case 'supplied':
            d = 'paid';
            //scope.orders[attrs.thisIndex].next ="Paid";
          break;
          case 'paid':
           d = 'Complete';
          break;
          default:
          break;
        }
        return d;
    }

    return {
      link: function(scope, element, attrs, controller){
        var invoiceNo, index;
        //Observe index
        attrs.$observe('index', function(newValue){
          index = newValue;
          scope.kush.next = getStatus(scope.kush.orderStatus);
          //bindEmAll(index, scope, element);
          //console.log(scope.kush);
        });

        //Bind to 
        element.on('click', function(e){
          e.preventDefault();

          var o ={
            status : getStatus(scope.kush.orderStatus),
            itemData : scope.kush.itemData[0],
            amount : scope.kush.orderAmount,
            order_id : scope.kush._id,
            invoiceno : scope.kush.orderInvoice,
            amountSupplied: scope.kush.amountSupplied
          }
          //scope.$apply();
          ordersService.updateOrder(o, function(r){
            scope.kush.orderStatus = r.result;
            scope.kush.next = getStatus(r.result);
            console.log(r);
          });
        });
      },
      scope : {
        kush : "="
      }
    };
  });

angular.module('directives').directive('tooltips', function () {
  return {
    restrict: 'C',
    link: function (element, attrs) {
      $(element).tooltip({
        title : attrs.title
      });
    }
  };
});

  angular.module('directives').directive('scrollBar', function(){
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
  angular.module('directives').directive('pagination', [function(){
    function link(scope, element, attrs){
      scope.pageno = 0;
      scope.limit = 10;
      $('button.prevbtn', element).on('click', function(e){
        var page = scope.pageno - 1;
        if(scope.pageno === 1) return false;
        scope.pageTo({pageNo: page, limit: scope.limit, cb: function(r){
          if(r) scope.pageno--;
        }});
      });
      $('button.nextbtn', element).on('click', function(e){
        var page = scope.pageno + 1;
        scope.pageTo({pageNo: page, limit: scope.limit, cb: function(r){
          if(r) scope.pageno++;
        }});
      });
      scope.pagelimit = function(limit){
        scope.pageTo({pageNo: scope.pageno, limit: limit, cb: function(r){
          if(r) scope.limit = limit;
        }});        
      };
    }

    function Ctrl () {
      // init
      $scope.sort = {       
        sortingOrder : 'id',
        reverse : false
      };
      
      $scope.gap = 5;
      
      $scope.filteredItems = [];
      $scope.groupedItems = [];
      $scope.itemsPerPage = 5;
      $scope.pagedItems = [];
      $scope.currentPage = 0;

      var searchMatch = function (haystack, needle) {
          if (!needle) {
            return true;
          }
          return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
      };

      // init the filtered items
      $scope.search = function () {
        $scope.filteredItems = $filter('filter')($scope.items, function (item) {
          for(var attr in item) {
            if (searchMatch(item[attr], $scope.query))
              return true;
          }
          return false;
        });
        // take care of the sorting order
        if ($scope.sort.sortingOrder !== '') {
          $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sort.sortingOrder, $scope.sort.reverse);
        }
        $scope.currentPage = 0;
        // now group by pages
        $scope.groupToPages();
      };
      
    
      // calculate page in place
      $scope.groupToPages = function () {
          $scope.pagedItems = [];
          
          for (var i = 0; i < $scope.filteredItems.length; i++) {
              if (i % $scope.itemsPerPage === 0) {
                  $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredItems[i] ];
              } else {
                  $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
              }
          }
      };
      
      $scope.range = function (size,start, end) {
          var ret = [];        
          console.log(size,start, end);
                        
          if (size < end) {
              end = size;
              start = size-$scope.gap;
          }
          for (var i = start; i < end; i++) {
              ret.push(i);
          }        
           console.log(ret);        
          return ret;
      };
      
      $scope.prevPage = function () {
          if ($scope.currentPage > 0) {
              $scope.currentPage--;
          }
      };
      
      $scope.nextPage = function () {
          if ($scope.currentPage < $scope.pagedItems.length - 1) {
              $scope.currentPage++;
          }
      };
      
      $scope.setPage = function () {
          $scope.currentPage = this.n;
      };

      // functions have been describe process the data for display
      $scope.search();

      fessmodule.directive("customSort", function() {

      });

    }
    return {
      link: link,
      scope: {
        pageTo: '&',
        items : '@paginationss'
      },
      controller: Ctrl,
      templateUrl: '/templates/pagination'
    };
  }]);


angular.module('directives').directive('equals', function() {
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