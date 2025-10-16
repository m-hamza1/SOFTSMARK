document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('quote-request-form');
    if (!form) return;

    // Initialize form fields
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    requiredFields.forEach(field => {
        // Add proper aria labels
        field.setAttribute('aria-required', 'true');
        
        // Add field validation
        field.addEventListener('invalid', function(e) {
            e.preventDefault();
            this.classList.add('border-red-500');
            
            // Remove existing error message if any
            const existingError = this.parentElement.querySelector('.error-message');
            if (existingError) existingError.remove();
            
            // Add error message
            const errorMessage = document.createElement('span');
            errorMessage.className = 'error-message text-red-400 text-xs mt-1 block';
            errorMessage.textContent = this.validationMessage;
            this.parentElement.appendChild(errorMessage);
        });

        // Clear error on input
        field.addEventListener('input', function() {
            this.classList.remove('border-red-500');
            const errorMessage = this.parentElement.querySelector('.error-message');
            if (errorMessage) errorMessage.remove();
        });
    });

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Remove any existing error messages
        form.querySelectorAll('.error-message').forEach(msg => msg.remove());
        
        // Validate all required fields
        let isValid = true;
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('border-red-500');
                const errorMessage = document.createElement('span');
                errorMessage.className = 'error-message text-red-400 text-xs mt-1 block';
                errorMessage.textContent = 'This field is required';
                field.parentElement.appendChild(errorMessage);
            }
        });

        // Email validation
        const emailField = form.querySelector('#quote-email');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                isValid = false;
                emailField.classList.add('border-red-500');
                const errorMessage = document.createElement('span');
                errorMessage.className = 'error-message text-red-400 text-xs mt-1 block';
                errorMessage.textContent = 'Please enter a valid email address';
                emailField.parentElement.appendChild(errorMessage);
            }
        }

        // If form is valid, submit it
        if (isValid) {
            const formData = new FormData(form);
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            // Disable button and show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

            // Send the form data
            fetch(form.action, {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(result => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;

                if (result.includes('Thank you')) {
                    // Success
                    alert('Thank you! Your quote request has been sent successfully.');
                    form.reset();
                    
                    // Close modal if it exists
                    const modal = document.getElementById('quote-modal');
                    if (modal) {
                        modal.classList.add('hidden', 'opacity-0');
                    }
                } else {
                    // Show error from PHP
                    alert(result || 'There was an error sending your quote. Please try again.');
                }
            })
            .catch(error => {
                // Reset button state and show error
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                alert('There was an error sending your quote. Please try again or contact us directly.');
                console.error('Error:', error);
            });
        }
    });
});