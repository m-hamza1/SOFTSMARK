/**
 * Animation Observer Optimizer
 * Uses Intersection Observer API to efficiently trigger animations only when elements are visible
 * This reduces CPU load by only animating what's in the viewport
 */

(function() {
  // Configuration
  const config = {
    rootMargin: '0px',
    threshold: 0.1 // Trigger when at least 10% of the element is visible
  };

  // Classes to apply when element comes into view
  const animationClasses = {
    'animate-fade-in': 'opacity-0', // Elements that should fade in
    'animate-slide-up': 'translate-y-8 opacity-0', // Elements that should slide up and fade in
    'animate-slide-left': '-translate-x-8 opacity-0', // Elements that slide in from left
    'animate-slide-right': 'translate-x-8 opacity-0', // Elements that slide in from right
    'animate-scale': 'scale-95 opacity-0', // Elements that scale up
  };

  // Get all animation targets
  const targets = document.querySelectorAll('[data-animation]');

  // Apply initial state to all targets
  targets.forEach(target => {
    const animationType = target.dataset.animation || 'animate-fade-in';
    const initialClass = animationClasses[animationType];
    
    if (initialClass) {
      target.classList.add('transition-all', 'duration-700', 'ease-out');
      target.classList.add(...initialClass.split(' '));
      
      // Store the animation type for later use
      target.setAttribute('data-animation-applied', 'false');
    }
  });

  // Create observer callback
  const handleIntersection = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const animationType = target.dataset.animation || 'animate-fade-in';
        const initialClass = animationClasses[animationType];
        
        // Check if animation was already applied
        if (target.getAttribute('data-animation-applied') === 'false') {
          // Use requestAnimationFrame for smoother visual updates
          requestAnimationFrame(() => {
            // Remove initial classes to trigger animation
            if (initialClass) {
              target.classList.remove(...initialClass.split(' '));
            }
            target.setAttribute('data-animation-applied', 'true');
          });
          
          // Stop observing this element after animation is applied
          observer.unobserve(target);
        }
      }
    });
  };

  // Create and start the intersection observer
  const observer = new IntersectionObserver(handleIntersection, config);
  
  // Begin observing all targets
  targets.forEach(target => {
    observer.observe(target);
  });

  // Add a method to manually refresh the observer (useful after dynamic content changes)
  window.refreshAnimations = function() {
    const newTargets = document.querySelectorAll('[data-animation]:not([data-animation-applied])');
    newTargets.forEach(target => {
      const animationType = target.dataset.animation || 'animate-fade-in';
      const initialClass = animationClasses[animationType];
      
      if (initialClass) {
        target.classList.add('transition-all', 'duration-700', 'ease-out');
        target.classList.add(...initialClass.split(' '));
        target.setAttribute('data-animation-applied', 'false');
        observer.observe(target);
      }
    });
  };
})();