// Form validation functions
function validateField(input) {
  const value = input.value.trim();
  const errorClass = 'border-red-500';
  let isValid = true;
  
  // Remove any existing error message
  const existingError = input.parentElement.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Check if field is empty
  if (!value && input.hasAttribute('required')) {
    showError(input, 'This field is required');
    isValid = false;
  }
  
  // Email validation
  if (input.type === 'email' && value) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(value)) {
      showError(input, 'Please enter a valid email address');
      isValid = false;
    }
  }
  
  // Budget validation
  if (input.id === 'quote-budget-amount' && value) {
    if (isNaN(value) || parseFloat(value) < 1000) {
      showError(input, 'Budget must be at least $1,000');
      isValid = false;
    }
  }
  
  // Update input styling
  if (!isValid) {
    input.classList.add(errorClass);
  } else {
    input.classList.remove(errorClass);
  }
  
  return isValid;
}

function showError(input, message) {
  const errorSpan = document.createElement('span');
  errorSpan.className = 'error-message text-red-400 text-xs mt-1 block';
  errorSpan.textContent = message;
  input.parentElement.appendChild(errorSpan);
}

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
  const quoteForm = document.getElementById('quote-request-form');
  if (!quoteForm) return;

  const inputs = quoteForm.querySelectorAll('input[required], select[required]');
  
  // Add validation styles on blur
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(input);
    });
    
    input.addEventListener('input', function() {
      // Remove error styles when user starts typing
      input.classList.remove('border-red-500');
      const errorSpan = input.parentElement.querySelector('.error-message');
      if (errorSpan) {
        errorSpan.remove();
      }
    });
  });

  quoteForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent default submission
    
    let isValid = true;
    
    // Validate all required fields
    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      return false;
    }

    // If validation passes, submit the form using fetch
    const formData = new FormData(quoteForm);
    
    // Disable submit button and show loading state
    const submitButton = quoteForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

    fetch('/SOFTSMARK/send-quote.php', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(result => {
      // Reset submit button
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;

      if (result.includes('Thank you!')) {
        // Success - show message and reset form
        alert('Thank you! Your quote has been sent. We will contact you soon.');
        quoteForm.reset();
        
        // Close modal if it exists
        const modal = document.getElementById('quote-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.add('opacity-0');
        }
      } else {
        // Show error from PHP
        alert(result || 'There was an error sending your quote. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      // Reset submit button
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
      alert('There was an error sending your quote. Please try again or contact us directly.');
    });
  });
});