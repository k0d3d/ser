/* Directives */
  /**
  * directives Modules
  *
  * Description
  */
  angular.module('directives', []);
  angular.module('directives').directive('typeAhead',function(ordersService, itemsService){
    var ser;

    var linker = function(scope, element, attrs){
        ser = {
          suppliername : ordersService.getSupplierName,
          itemname : itemsService.getItemName,
          nafdacdrugs: itemsService.getNafdacDrug
        };
        scope.selectedItem ={
          suppliername: '',
          itemname: '',
          nafdacDrug: ''
        };
        element.typeahead({
          source: function(query, process){
            return ser[attrs.thName](query,function(results){
              return process(results);
            });
          },
          updater: function(item){
            scope.selectedItem[attrs.thName] = item;
            scope.$apply();
            return item;
          }
        });
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

  angular.module('directives').directive('tooltip', function(){
      return {
          link: function(scope, element, attrs){
              element.tooltip({
                placement: attrs.tooltipPosition || 'top'
              });
          }
      }
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
  angular.module('directives').directive('pagination', ["supplierServices", function(ss){
    function link(scope, element, attrs){
      scope.pageno = 1;
      scope.$watch(attrs.pagination, function(n){
        if(!n || n.length) return element.hide();
        if(n.length > 0){
          element.show();
        }
        if(n.length === 0){
          element.hide();
        }
      })
      $('button.prevbtn', element).on('click', function(e){
        var page = scope.pageno - 1;
        if(scope.pageno <= 1) return false;
        ss.all(page, function(r){
          scope.pagination = r;
          console.log(typeof(scope.pageno));
          scope.pageno--;
        });
      });
      $('button.nextbtn', element).on('click', function(e){
        var page = scope.pageno + 1;
        ss.all(page, function(r){
          scope.pagination = r;
          scope.pageno++;
        });
      });    
    }
    return {
      link: link,
      scope: {
        pagination: "=",
      },
      template:"<button class='btn btn-success prevbtn'>Previous</button><span>{{pageno}}</span><button class='btn btn-success nextbtn'>Next</button>"
    }
  }]);