/**
 * Performance-optimized initialization for mouse particle effect
 * Only initializes when page is fully loaded and idle
 */

// Check if the browser supports requestIdleCallback
const requestIdleCallbackSupported = 
  typeof window !== 'undefined' && 
  'requestIdleCallback' in window;

// Function to initialize the effect
function initMouseParticleEffect() {
  // Initialize with optimized settings
  const effect = new MouseParticleEffect({
    particleCount: 5,
    particleColor: 'rgba(138, 92, 246, 0.7)',
    particleSize: 4,
    particleLifetime: 800,
    disableOnMobile: true,
    disableOnLowEnd: true
  });
  
  // Store the instance on window for potential later reference
  window.mouseParticleEffect = effect;
}

// Wait for everything to load first
window.addEventListener('load', function() {
  // If requestIdleCallback is supported, use it to defer initialization
  if (requestIdleCallbackSupported) {
    window.requestIdleCallback(() => {
      initMouseParticleEffect();
    }, { timeout: 2000 }); // Set a timeout in case the browser is never idle
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      initMouseParticleEffect();
    }, 1000); // Defer by 1 second
  }
});