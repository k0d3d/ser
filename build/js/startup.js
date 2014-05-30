    
      $(function () {
      $('[data-typer-targets]').typer();
      });
    
      $(function() {
      $('.scrollto, .gototop').bind('click',function(event){
      var $anchor = $(this);
      $('html, body').stop().animate({
      scrollTop: $($anchor.attr('href')).offset().top
      }, 1500,'easeInOutExpo');
      event.preventDefault();
      });
      });
      // GA.js
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
          ga('create', 'UA-51278084-1', 'stoc-cloud-dev.herokuapp.com');
          ga('send', 'pageview');            