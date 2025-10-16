// Function to ensure the form validation script is loaded
function ensureFormValidation() {
    // Check if the validation script is already loaded
    if (typeof validateField === 'undefined') {
        // Load the validation script
        const script = document.createElement('script');
        script.src = '/SOFTSMARK/assets/js/form-validation.js';
        script.defer = true;
        document.head.appendChild(script);
        
        // Wait for script to load
        return new Promise((resolve) => {
            script.onload = () => {
                resolve();
            };
        });
    }
    return Promise.resolve();
}

// Initialize form validation when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    ensureFormValidation().then(() => {
        const form = document.getElementById('quote-request-form');
        if (form) {
            // Automatically focus the first input when the form becomes visible
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.target.classList.contains('hidden')) {
                        return;
                    }
                    const firstInput = form.querySelector('input:not([type="hidden"])');
                    if (firstInput) {
                        firstInput.focus();
                    }
                });
            });

            // Start observing the modal for visibility changes
            const modal = document.getElementById('quote-modal');
            if (modal) {
                observer.observe(modal, {
                    attributes: true,
                    attributeFilter: ['class']
                });
            }

            // Pre-validate fields on blur
            form.querySelectorAll('input[required], select[required]').forEach(input => {
                input.addEventListener('blur', () => validateField(input));
            });
        }
    });
});