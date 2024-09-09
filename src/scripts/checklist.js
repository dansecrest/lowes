// Checklist module

var checklist = (function($) {
    var checkboxes = document.querySelectorAll("input[type='checkbox']");

    // Initialize checklist
    var init = function() {
        // localStorage.clear();

        // Get all checkboxes and run them through setup
        for (var i = 0; i < checkboxes.length; i++) {
            setupCheckbox(checkboxes[i]);
        }
    };

    // Setup each checkbox for local storage
    var setupCheckbox = function(checkbox) {
        var storageId = checkbox.getAttribute('id');
        var value = localStorage.getItem(storageId);

        checkbox.checked = value === 'true';

        checkbox.addEventListener('change', function() {
            // Set item if checked, otherwise remove it
            if (this.checked === true) {
                localStorage.setItem(storageId, this.checked);
            }
            else {
                localStorage.removeItem(storageId);
            }
        });
    };

    // Public
    return {
        init: init
    };
})(jQuery);
