jQuery(document).ready(function(){
    jQuery("a[rel^='prettyPhoto']").prettyPhoto();
    //Replaces data-rel attribute to rel.
    //We use data-rel because of w3c validation issue
    jQuery('a[data-rel]').each(function() {
      jQuery(this).attr('rel', jQuery(this).data('rel'));
    });

    $.fn.editable.defaults.pk = $('.contentpanel').data('userId'); 
    $.fn.editable.defaults.ajaxOptions =  {
      type: "PUT"
    };

    $.fn.editable.defaults.url = '/api/users/profile';

    $('.x-editable').editable('disable');
    $(document).on('click', '.start-edit', function (e) {
      $('.x-editable').editable('toggleDisabled');
    });
});