var utils = (function($) {

    // Back to top action
    var backToTop = function(time) {
        $('body, html').animate({
            scrollTop: 0
        }, time);
    };

    // Public
    return {
        backToTop: backToTop
    };
})(jQuery);
