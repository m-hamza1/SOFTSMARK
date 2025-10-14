/**
 * Custom Cursor Effect
 * A simple glowing dot that follows the mouse cursor
 */

class CustomCursor {
  constructor() {
    this.cursor = null;
    this.isVisible = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    this.animationId = null;

    // Check if it's a touch device - don't initialize on mobile
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!this.isTouchDevice) {
      this.init();
    }
  }

  init() {
    // Create cursor element
    this.cursor = document.createElement('div');
    this.cursor.style.position = 'fixed';
    this.cursor.style.width = '8px';
    this.cursor.style.height = '8px';
    this.cursor.style.borderRadius = '50%';
    this.cursor.style.background = 'radial-gradient(circle, rgba(138, 92, 246, 0.8) 0%, rgba(99, 102, 241, 0.6) 50%, transparent 100%)';
    this.cursor.style.pointerEvents = 'none';
    this.cursor.style.zIndex = '99999';
    this.cursor.style.transform = 'translate(-50%, -50%)';
    this.cursor.style.transition = 'opacity 0.3s ease';
    this.cursor.style.opacity = '0';

    // Add to DOM
    document.body.appendChild(this.cursor);

    // Add event listeners
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });
    document.addEventListener('mouseenter', () => this.showCursor());
    document.addEventListener('mouseleave', () => this.hideCursor());

    // Start animation loop
    this.animate();
  }

  handleMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    if (!this.isVisible) {
      this.showCursor();
    }
  }

  showCursor() {
    this.isVisible = true;
    this.cursor.style.opacity = '1';
  }

  hideCursor() {
    this.isVisible = false;
    this.cursor.style.opacity = '0';
  }

  animate() {
    // Smooth follow with easing
    this.cursorX += (this.mouseX - this.cursorX) * 0.15;
    this.cursorY += (this.mouseY - this.cursorY) * 0.15;

    this.cursor.style.left = `${this.cursorX}px`;
    this.cursor.style.top = `${this.cursorY}px`;

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.cursor) {
      document.body.removeChild(this.cursor);
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseenter', this.showCursor);
    document.removeEventListener('mouseleave', this.hideCursor);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const customCursor = new CustomCursor();
  // Store reference for potential cleanup
  window.customCursor = customCursor;
});