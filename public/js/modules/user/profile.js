jQuery(document).ready(function () {
    //fetches d list of states or gets d stateId 
    //if a state name is passed in.
    function getStates (state) {
        var src = ['Anambra',
                'Enugu',
                'Akwa Ibom',
                'Adamawa',
                'Abia',
                'Bauchi',
                'Bayelsa',
                'Benue',
                'Borno',
                'Cross River',
                'Delta',
                'Ebonyi',
                'Edo',
                'Ekiti',
                'Gombe',
                'Imo',
                'Jigawa',
                'Kaduna',
                'Kano',
                'Katsina',
                'Kebbi',
                'Kogi',
                'Kwara',
                'Lagos',
                'Nasarawa',
                'Niger',
                'Ogun',
                'Ondo',
                'Osun',
                'Oyo',
                'Plateau',
                'Rivers',
                'Sokoto',
                'Taraba',
                'Yobe',
                'Zamfara'], 
            em = {};

        if (state) {

            for ( var key in src ) {
                if ( src.hasOwnProperty( key ) )
                {
                    em[src[key]] = key;
                }
            } 
            return parseInt(em[state]) + 1;

        } else {
            return src;
        }

    }

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

    $('.x-editable').editable('enable');
    $('.states-select').editable({
        source : getStates()
    });
    $('.lga-select').editable({
        source: function () {
            var em = [];
            $.ajax({
                url: '/api/organization/states/' + getStates($('.states-select').text()) + '/lga',
                async: false,
                global: false,
                dataType: 'json',
                complete: function (dt) {
                    if (dt.status === 200) {
                        _.each(dt.responseJSON, function (v, i) {
                            em.push(v.name);
                            if (dt.responseJSON.length >= i + 1)  {
                                return em;
                            }
                        });
                    } 
                }

            });
            return em;
        }
    });
    $(document).on('click', '.start-edit', function (e) {
      $('.x-editable').editable('toggleDisabled');
    });
});