jQuery(document).ready(function(){
    
    
    $.fn.editable.defaults.pk = $('.contentpanel').data('itemId'); 
    $.fn.editable.defaults.ajaxOptions =  {
      type: "PUT"
    };

    $.fn.editable.defaults.url = '/api/drugs/' + $('.contentpanel').data('itemId');

    $('.x-editable').editable('disable');
    $(document).on('click', '.start-edit', function (e) {
      $('.x-editable').editable('toggleDisabled');
    });
});