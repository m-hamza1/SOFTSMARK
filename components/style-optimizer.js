/**
 * Style Attribute Optimizer
 * Removes empty style attributes which can cause rendering issues
 */

(function() {
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Find all elements with empty style attributes
    const elementsWithEmptyStyle = document.querySelectorAll('[style=""]');
    
    // Remove the empty style attributes
    elementsWithEmptyStyle.forEach(element => {
      element.removeAttribute('style');
    });
    
    // Log the number of fixed elements (for debugging)
    if (elementsWithEmptyStyle.length > 0) {
      console.log(`Fixed ${elementsWithEmptyStyle.length} elements with empty style attributes`);
    }
  });
})();