class ParticleEffect {
  constructor(container, options = {}) {
    this.container = container;
    this.color = options.color || '#4444ff';
    this.particlesPerEmit = options.particlesPerEmit || 5;
    this.particles = [];
    this.container.style.position = 'relative';
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
  }

  createParticle(x, y, id) {
    return {
      id,
      x,
      y,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 2 + 1,
      size: Math.random() * 4 + 2,
      element: null,
      startTime: Date.now(),
    };
  }

  emitParticles(x, y) {
    const newParticles = [];
    for (let i = 0; i < this.particlesPerEmit; i++) {
      const particle = this.createParticle(x, y, Date.now() + i);
      newParticles.push(particle);
      this.particles.push(particle);
      this.createParticleElement(particle);
    }

    setTimeout(() => {
      newParticles.forEach(p => {
        if (p.element) {
          p.element.remove();
        }
        this.particles = this.particles.filter(particle => particle.id !== p.id);
      });
    }, 1000);
  }

  createParticleElement(particle) {
    const element = document.createElement('div');
    element.className = 'particle';
    element.style.position = 'absolute';
    element.style.left = particle.x + 'px';
    element.style.top = particle.y + 'px';
    element.style.width = particle.size + 'px';
    element.style.height = particle.size + 'px';
    element.style.backgroundColor = this.color;
    element.style.borderRadius = '50%';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '9999';
    element.style.transform = 'scale(1)';
    element.style.opacity = '0.8';
    this.container.appendChild(element);
    particle.element = element;
    this.animateParticle(particle);
  }

  animateParticle(particle) {
    const animate = () => {
      const elapsed = Date.now() - particle.startTime;
      const progress = elapsed / 1000;
      if (progress < 1) {
        const distance = 100 * particle.speed * progress;
        const x = particle.x + Math.cos(particle.angle) * distance;
        const y = particle.y + Math.sin(particle.angle) * distance;
        const scale = 1 - progress;
        const opacity = 0.8 * (1 - progress);
        particle.element.style.transform = `scale(${scale})`;
        particle.element.style.opacity = opacity;
        particle.element.style.left = x + 'px';
        particle.element.style.top = y + 'px';
        requestAnimationFrame(animate);
      } else {
        if (particle.element) {
          particle.element.remove();
        }
      }
    };
    requestAnimationFrame(animate);
  }

  handleMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.emitParticles(x, y);
  }
}

// Usage
function initParticleEffect() {
  const container = document.querySelector('.particle-container') || document.body;
  console.log('Initializing particle effect on', container);
  new ParticleEffect(container, { color: '#4444ff', particlesPerEmit: 5 });
}