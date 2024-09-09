(function($) {
    $(document).ready(function() {
        var subnavCondensed = $('.subnav.condensed');


        // Scroll window actions
        $(window).scroll(function() {
            var top = $(this).scrollTop();

            // Toggle condensed subnav
            if (top > 250) {
                subnavCondensed.addClass('show');
            }
            else {
                subnavCondensed.removeClass('show');
            }
        });

        $('#subnav-toggle').click(function() {
            subnavCondensed.toggleClass('open');
        });


        // Mobile global nav toggle
        $('#nav-toggle').click(function() {
            $('body').toggleClass('nav-open');
        });


        // Checklist print button
        $('#print').click(function() {
            window.print();
        });


        // Footer back to top button
        $('#back-to-top a').click(function(event) {
            event.preventDefault();

            utils.backToTop(500);
        });


        // Email validation override
        $.validator.methods.email = function(value, element) {
            return this.optional(element) || /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value);
        };


        // Form validation
        $('#email-form').validate({
            rules: {
                email: {
                    required: true,
                    email: true
                }
            },
            messages: {
                email: "Please enter a valid email address."
            },
            onkeyup: function(element) {$(element).valid()}
        });
    });
})(jQuery);
