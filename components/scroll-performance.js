/**
 * Scroll Performance Optimizer
 * Detects scroll performance issues and optimizes accordingly
 */

(function() {
  // Performance detection variables
  let lastFrameTime = 0;
  let consecutiveSlowFrames = 0;
  const FRAME_THRESHOLD = 1000/30; // Consider frames slower than 30fps as slow
  const CONSECUTIVE_FRAMES_THRESHOLD = 5; // Number of consecutive slow frames to trigger optimization

  // Check device capabilities
  const isLowEndDevice = 
    navigator.deviceMemory < 4 || // Low memory (less than 4GB)
    navigator.hardwareConcurrency < 4; // Less than 4 cores

  // Apply basic optimizations for low-end devices immediately
  if (isLowEndDevice) {
    document.body.classList.add('reduce-animations');
  }

  // Set up scroll performance monitoring
  let scrollTimeout;
  let isMonitoring = false;
  
  // Performance monitoring function
  function monitorScrollPerformance() {
    if (!isMonitoring) return;
    
    const now = performance.now();
    const deltaTime = now - lastFrameTime;
    
    if (lastFrameTime && deltaTime > FRAME_THRESHOLD) {
      consecutiveSlowFrames++;
      
      if (consecutiveSlowFrames >= CONSECUTIVE_FRAMES_THRESHOLD) {
        document.body.classList.add('reduce-animations');
        isMonitoring = false;
      }
    } else {
      consecutiveSlowFrames = Math.max(0, consecutiveSlowFrames - 1);
    }
    
    lastFrameTime = now;
    requestAnimationFrame(monitorScrollPerformance);
  }

  // Start monitoring on scroll
  window.addEventListener('scroll', function() {
    if (!isMonitoring) {
      isMonitoring = true;
      consecutiveSlowFrames = 0;
      requestAnimationFrame(monitorScrollPerformance);
    }
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      isMonitoring = false;
    }, 1000);
  }, { passive: true });

  // Reset optimization after page becomes idle
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
      // Wait a bit before removing the optimization class
      setTimeout(function() {
        if (!isLowEndDevice) {
          document.body.classList.remove('reduce-animations');
        }
      }, 5000);
    }
  });
})();