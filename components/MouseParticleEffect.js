/**
 * Optimized Mouse Particle Effect
 * 
 * Features:
 * - Uses requestAnimationFrame for smooth animation
 * - Adjusts particle count based on device performance
 * - Uses GPU-accelerated properties for animations
 * - Implements throttling for better performance
 * - Automatically disables on low-end devices
 */

class MouseParticleEffect {
  constructor(options = {}) {
    // Default configuration
    this.options = {
      particleCount: 10,
      particleColor: 'rgba(138, 92, 246, 0.8)',  // Default violet color
      particleSize: 5,
      particleLifetime: 1000, // ms
      particleSpeed: 1,
      disableOnMobile: true,
      disableOnLowEnd: true,
      ...options
    };
    
    // State variables
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    this.lastFrameTime = 0;
    this.mousePosition = { x: 0, y: 0 };
    this.isRunning = false;
    this.throttleDelay = 50; // ms between particle creation events
    this.lastThrottleTime = 0;
    
    // Check device capabilities
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.isLowEndDevice = (
      navigator.deviceMemory < 4 || // Less than 4GB RAM
      navigator.hardwareConcurrency < 4 || // Less than 4 cores
      this.isMobile // Consider all mobile as low-end for this effect
    );
    
    // Adjust particle count based on device capability
    if (this.isMobile) {
      this.options.particleCount = Math.min(5, this.options.particleCount);
      this.options.particleLifetime = Math.min(800, this.options.particleLifetime);
      this.throttleDelay = 100; // More aggressive throttling on mobile
    }
    
    // Don't initialize if disabled for this device type
    if ((this.options.disableOnMobile && this.isMobile) || 
        (this.options.disableOnLowEnd && this.isLowEndDevice)) {
      return;
    }
    
    this.init();
  }
  
  init() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '99999';
    this.canvas.style.willChange = 'transform'; // GPU acceleration hint
    this.canvas.style.transform = 'translateZ(0)'; // Force GPU acceleration
    
    // Set canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });
    
    // Get context
    this.ctx = this.canvas.getContext('2d');
    
    // Add mouse event listeners with passive flag for better performance
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });
    
    // Add canvas to DOM
    document.body.appendChild(this.canvas);
    
    // Start animation loop
    this.isRunning = true;
    requestAnimationFrame((timestamp) => this.animate(timestamp));
    
    // Add visibility change detection to pause when tab is not visible
    document.addEventListener('visibilitychange', () => {
      this.isRunning = document.visibilityState === 'visible';
      if (this.isRunning) {
        this.lastFrameTime = performance.now();
        requestAnimationFrame((timestamp) => this.animate(timestamp));
      }
    });
  }
  
  resizeCanvas() {
    if (!this.canvas) return;
    
    // Update canvas size with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    
    // Update context scale
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }
  
  handleMouseMove(event) {
    this.mousePosition.x = event.clientX;
    this.mousePosition.y = event.clientY;
    
    // Throttle particle creation for performance
    const now = performance.now();
    if (now - this.lastThrottleTime > this.throttleDelay) {
      this.createParticles();
      this.lastThrottleTime = now;
    }
  }
  
  createParticles() {
    // Create new particles at mouse position
    for (let i = 0; i < this.options.particleCount; i++) {
      const size = Math.random() * this.options.particleSize + 1;
      const speed = Math.random() * this.options.particleSpeed;
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      // Create particle with optimized data structure
      this.particles.push({
        x: this.mousePosition.x,
        y: this.mousePosition.y,
        size: size,
        vx: vx,
        vy: vy,
        color: this.options.particleColor,
        life: this.options.particleLifetime,
        maxLife: this.options.particleLifetime
      });
    }
    
    // Limit total particles for performance
    const maxParticles = this.isMobile ? 20 : 50;
    if (this.particles.length > maxParticles) {
      this.particles = this.particles.slice(-maxParticles);
    }
  }
  
  animate(timestamp) {
    if (!this.isRunning) return;
    
    // Calculate delta time for smooth animation
    const deltaTime = timestamp - (this.lastFrameTime || timestamp);
    this.lastFrameTime = timestamp;
    
    // Clear canvas with composite operation for trail effect
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Update life
      p.life -= deltaTime;
      
      // Skip rendering if particle life is done
      if (p.life <= 0) {
        // Remove dead particle
        this.particles.splice(i, 1);
        i--;
        continue;
      }
      
      // Calculate opacity based on remaining life
      const opacity = p.life / p.maxLife;
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      
      // Use rgba with calculated opacity
      const color = p.color.replace(/[\d.]+\)$/g, `${opacity})`);
      this.ctx.fillStyle = color;
      this.ctx.fill();
    }
    
    // Request next frame
    requestAnimationFrame((timestamp) => this.animate(timestamp));
  }
  
  // Public method to change options during runtime
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }
  
  // Public method to destroy the effect
  destroy() {
    this.isRunning = false;
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    document.removeEventListener('mousemove', this.handleMouseMove);
  }
}

// Export the class
typeof module !== 'undefined' ? module.exports = MouseParticleEffect : null;
