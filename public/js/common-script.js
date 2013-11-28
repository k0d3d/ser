$(function() {
    // make code pretty
    window.prettyPrint && prettyPrint()
});

/*====LEFT BAR ACCORDION====*/
$(function() {
    $('#nav-accordion').dcAccordion({
        eventType: 'click',
        autoClose: true,
        saveState: true,
        disableLink: true,
        speed: 'slow',
        showCount: false,
        autoExpand: true,
//        cookie: 'dcjq-accordion-1',
        classExpand: 'dcjq-current-parent'
    });
});
/*====LEFT BAR TOGGLE====*/
$(function() {
    $(".left-toggle").click(function() {
        $('.main-wrapper').toggleClass('merge-right');
    });

    $('.main-container').click(function() {
        if ($('.main-wrapper').hasClass('merge-right'))
        {
            $('.main-wrapper').removeClass('merge-right');
        }

    });
});

/*====ACTION BAR TOOLTIP====*/
$(function() {
    $('.action-bar a').tooltip({
        placement: 'top'

    });
});


/*================================
 SCROLL TOP
 =================================*/
$(function() {
    $(".scroll-top").hide();
    $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
            $('.scroll-top').fadeIn();
        } else {
            $('.scroll-top').fadeOut();
        }
    });

    $('.scroll-top a').click(function() {
        $('body,html').animate({
            scrollTop: 0
        }, 500);
        return false;
    });
});
/*==NICE SCROLL==*/
$(function() {
    $('.recent-users-scroll').niceScroll({
        cursorcolor: "#4074b4",
        cursorwidth: "5px"
    });
    $('.support-ticket-scroll').niceScroll({
        cursorcolor: "#4074b4",
        cursorwidth: "5px"
    });

    $('.right-shortcut-bar-items').niceScroll({
        cursorcolor: "#aaa",
        cursorwidth: "5px"
    });



    /*
     $('#recnet-post-scroll').slimScroll({
     color: '#111',
     height: '335px',
     railVisible: true,
     railColor: '#ccc',
     railOpacity: 0.9
     });
     $('.right-shortcut-bar-items').slimScroll({
     color: '#111',
     height: '100%',
     railVisible: true,
     railColor: '#ccc',
     railOpacity: 0.9
     });*/

});

/*Collapsible*/
$(function() {


    $('.widget-collapse').click(function(e)
    {
        var widgetElem = $(this).children('i');
        $(this).parents('.widget-head')
                .next('.widget-container')
                .slideToggle('slow');

        if ($(widgetElem).hasClass('icon-arrow-down')) {
            $(widgetElem).removeClass('icon-arrow-down');
            $(widgetElem).addClass('icon-arrow-up');


        }

        else
        {
            $(widgetElem).removeClass('icon-arrow-up');
            $(widgetElem).addClass('icon-arrow-down');

        }


        e.preventDefault();

    });


    $('.widget-remove').click(function(e) {
        $(this).parents('.widget-module').remove();
        e.preventDefault();

    });

});


