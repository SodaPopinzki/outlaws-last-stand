/**
 * Particle System - Robust particle effects for all game visuals
 *
 * Features:
 * - Object pooling for performance
 * - Particle emitters with burst and stream modes
 * - Preset effects for common game events
 * - LOD (Level of Detail) at high particle counts
 * - Max particle limit to prevent performance issues
 */

import { generateId } from '../utils/random';

// ========== PARTICLE CLASS ==========

/**
 * Individual particle
 */
export class Particle {
  constructor(config = {}) {
    this.id = generateId();

    // Position
    this.x = config.x || 0;
    this.y = config.y || 0;

    // Velocity
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;

    // Life
    this.life = config.life || 1.0;
    this.maxLife = config.maxLife || 1.0;

    // Size
    this.size = config.size || 4;
    this.sizeDecay = config.sizeDecay || 0; // Size reduction per second

    // Appearance
    this.color = config.color || '#FFFFFF';
    this.alpha = config.alpha !== undefined ? config.alpha : 1.0;
    this.shape = config.shape || 'circle'; // 'circle', 'square', 'star', 'line'

    // Physics
    this.gravity = config.gravity !== undefined ? config.gravity : 0;
    this.friction = config.friction !== undefined ? config.friction : 0.98;

    // Rotation (for non-circle shapes)
    this.rotation = config.rotation || 0;
    this.rotationSpeed = config.rotationSpeed || 0;

    // Custom data
    this.data = config.data || {};
  }

  /**
   * Update particle physics and lifetime
   */
  update(dt) {
    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Apply gravity
    this.vy += this.gravity * dt;

    // Apply friction
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Update rotation
    this.rotation += this.rotationSpeed * dt;

    // Decay size
    this.size = Math.max(0, this.size - this.sizeDecay * dt);

    // Decay life
    this.life -= dt;

    // Update alpha based on life
    this.alpha = Math.max(0, this.life / this.maxLife);

    return this.life > 0 && this.size > 0;
  }

  /**
   * Reset particle for object pooling
   */
  reset(config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.life = config.life || 1.0;
    this.maxLife = config.maxLife || 1.0;
    this.size = config.size || 4;
    this.sizeDecay = config.sizeDecay || 0;
    this.color = config.color || '#FFFFFF';
    this.alpha = config.alpha !== undefined ? config.alpha : 1.0;
    this.shape = config.shape || 'circle';
    this.gravity = config.gravity !== undefined ? config.gravity : 0;
    this.friction = config.friction !== undefined ? config.friction : 0.98;
    this.rotation = config.rotation || 0;
    this.rotationSpeed = config.rotationSpeed || 0;
    this.data = config.data || {};
  }

  /**
   * Render particle to canvas
   */
  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;

    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    switch (this.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'square':
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        break;

      case 'star':
        this.renderStar(ctx, this.size, 5);
        break;

      case 'line':
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
        break;
    }

    ctx.restore();
  }

  /**
   * Render star shape
   */
  renderStar(ctx, radius, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius / 2;
      const angle = (Math.PI / points) * i;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
  }
}

// ========== PARTICLE EMITTER CLASS ==========

/**
 * Manages particle emission with burst and stream modes
 */
export class ParticleEmitter {
  constructor(particleSystem) {
    this.id = generateId();
    this.particleSystem = particleSystem;

    this.x = 0;
    this.y = 0;
    this.active = false;

    // Stream mode
    this.isStreaming = false;
    this.streamDuration = 0;
    this.streamElapsed = 0;
    this.streamRate = 10; // Particles per second
    this.streamAccumulator = 0;
    this.streamConfig = null;
  }

  /**
   * Set emitter position
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Single burst of particles
   */
  emit(config) {
    const count = config.count || 10;
    const particles = [];

    for (let i = 0; i < count; i++) {
      const particleConfig = {
        x: this.x + (config.offsetX || 0) + (Math.random() - 0.5) * (config.spread || 0),
        y: this.y + (config.offsetY || 0) + (Math.random() - 0.5) * (config.spread || 0),
        vx: config.vx || (Math.random() - 0.5) * (config.velocitySpread || 100),
        vy: config.vy || (Math.random() - 0.5) * (config.velocitySpread || 100),
        life: config.life || 1.0,
        maxLife: config.life || 1.0,
        size: config.size || 4,
        sizeDecay: config.sizeDecay || 0,
        color: Array.isArray(config.color)
          ? config.color[Math.floor(Math.random() * config.color.length)]
          : config.color || '#FFFFFF',
        alpha: config.alpha !== undefined ? config.alpha : 1.0,
        shape: config.shape || 'circle',
        gravity: config.gravity !== undefined ? config.gravity : 0,
        friction: config.friction !== undefined ? config.friction : 0.98,
        rotation: config.rotation || Math.random() * Math.PI * 2,
        rotationSpeed: config.rotationSpeed || (Math.random() - 0.5) * 2,
        data: config.data || {},
      };

      const particle = this.particleSystem.createParticle(particleConfig);
      if (particle) {
        particles.push(particle);
      }
    }

    return particles;
  }

  /**
   * Start continuous particle emission
   */
  stream(config, duration) {
    this.isStreaming = true;
    this.streamDuration = duration;
    this.streamElapsed = 0;
    this.streamRate = config.rate || 10;
    this.streamAccumulator = 0;
    this.streamConfig = config;
    this.active = true;
  }

  /**
   * Stop streaming
   */
  stop() {
    this.isStreaming = false;
    this.active = false;
  }

  /**
   * Update emitter (for streaming mode)
   */
  update(dt) {
    if (!this.isStreaming) return;

    this.streamElapsed += dt;

    // Check if duration exceeded
    if (this.streamElapsed >= this.streamDuration) {
      this.stop();
      return;
    }

    // Accumulate particles to emit
    this.streamAccumulator += this.streamRate * dt;

    // Emit accumulated particles
    while (this.streamAccumulator >= 1) {
      this.emit({ ...this.streamConfig, count: 1 });
      this.streamAccumulator -= 1;
    }
  }
}

// ========== PARTICLE SYSTEM CLASS ==========

/**
 * Main particle system with object pooling and LOD
 */
export class ParticleSystem {
  constructor(maxParticles = 1000) {
    this.maxParticles = maxParticles;
    this.particles = [];
    this.particlePool = [];
    this.emitters = [];

    // LOD settings
    this.lodThreshold = 500; // Start reducing particles above this count
    this.lodReductionFactor = 0.5; // Reduce to 50% when at max

    // Performance tracking
    this.particleCount = 0;
  }

  /**
   * Create or reuse particle from pool
   */
  createParticle(config) {
    // Check particle limit
    if (this.particles.length >= this.maxParticles) {
      return null;
    }

    // Apply LOD
    if (this.particles.length > this.lodThreshold) {
      const skipChance = (this.particles.length - this.lodThreshold) /
                        (this.maxParticles - this.lodThreshold);
      if (Math.random() < skipChance * this.lodReductionFactor) {
        return null;
      }
    }

    let particle;

    // Reuse from pool
    if (this.particlePool.length > 0) {
      particle = this.particlePool.pop();
      particle.reset(config);
    } else {
      particle = new Particle(config);
    }

    this.particles.push(particle);
    this.particleCount = this.particles.length;

    return particle;
  }

  /**
   * Create new emitter
   */
  createEmitter(x = 0, y = 0) {
    const emitter = new ParticleEmitter(this);
    emitter.setPosition(x, y);
    this.emitters.push(emitter);
    return emitter;
  }

  /**
   * Remove emitter
   */
  removeEmitter(emitter) {
    const index = this.emitters.indexOf(emitter);
    if (index !== -1) {
      this.emitters.splice(index, 1);
    }
  }

  /**
   * Update all particles and emitters
   */
  update(dt) {
    // Update emitters
    for (let i = this.emitters.length - 1; i >= 0; i--) {
      const emitter = this.emitters[i];
      emitter.update(dt);

      // Remove inactive emitters
      if (!emitter.active && !emitter.isStreaming) {
        this.emitters.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      const alive = particle.update(dt);

      if (!alive) {
        // Return to pool
        this.particles.splice(i, 1);
        this.particlePool.push(particle);
      }
    }

    this.particleCount = this.particles.length;
  }

  /**
   * Render all particles
   */
  render(ctx) {
    for (const particle of this.particles) {
      particle.render(ctx);
    }
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particlePool.push(...this.particles);
    this.particles = [];
    this.emitters = [];
    this.particleCount = 0;
  }

  /**
   * Get particle count
   */
  getParticleCount() {
    return this.particleCount;
  }

  /**
   * Emit preset effect
   */
  emitPreset(presetName, x, y, options = {}) {
    const config = PRESET_EFFECTS[presetName];
    if (!config) {
      console.warn(`Unknown preset effect: ${presetName}`);
      return [];
    }

    const emitter = this.createEmitter(x, y);
    const particles = emitter.emit({ ...config, ...options });

    // Remove emitter if not streaming
    if (!emitter.isStreaming) {
      this.removeEmitter(emitter);
    }

    return particles;
  }
}

// ========== PRESET PARTICLE EFFECTS ==========

export const PRESET_EFFECTS = {
  // Dust cloud - brown/tan particles, slow fall
  DUST_CLOUD: {
    count: 15,
    spread: 20,
    velocitySpread: 50,
    vx: 0,
    vy: -20,
    life: 0.8,
    size: 3,
    sizeDecay: 2,
    color: ['#8B7355', '#A0826D', '#B8956A', '#C4A57B'],
    shape: 'circle',
    gravity: 30,
    friction: 0.95,
  },

  // Muzzle flash - yellow/orange, fast fade
  MUZZLE_FLASH: {
    count: 8,
    spread: 15,
    velocitySpread: 150,
    life: 0.2,
    size: 4,
    sizeDecay: 15,
    color: ['#FFA500', '#FFD700', '#FFFF00', '#FF8C00'],
    shape: 'star',
    gravity: 0,
    friction: 0.9,
    rotationSpeed: 10,
  },

  // Blood splatter - red particles, gravity affected
  BLOOD_SPLATTER: {
    count: 20,
    spread: 10,
    velocitySpread: 200,
    life: 0.6,
    size: 3,
    sizeDecay: 3,
    color: ['#8B0000', '#DC143C', '#B22222', '#A52A2A'],
    shape: 'circle',
    gravity: 300,
    friction: 0.96,
  },

  // Explosion - orange/yellow expanding ring + debris
  EXPLOSION: {
    count: 40,
    spread: 5,
    velocitySpread: 300,
    life: 0.8,
    size: 6,
    sizeDecay: 5,
    color: ['#FF4500', '#FF6347', '#FFA500', '#FFD700', '#FFFF00'],
    shape: 'circle',
    gravity: 100,
    friction: 0.92,
  },

  // Fire - orange/red rising particles
  FIRE: {
    count: 12,
    spread: 15,
    velocitySpread: 40,
    vx: 0,
    vy: -100,
    life: 0.6,
    size: 5,
    sizeDecay: 6,
    color: ['#FF4500', '#FF6347', '#FFA500', '#FFD700'],
    shape: 'circle',
    gravity: -50, // Negative gravity = rise
    friction: 0.98,
  },

  // Poison - green bubbling particles
  POISON: {
    count: 10,
    spread: 20,
    velocitySpread: 60,
    vx: 0,
    vy: -30,
    life: 1.0,
    size: 4,
    sizeDecay: 2,
    color: ['#00FF00', '#32CD32', '#7FFF00', '#ADFF2F'],
    shape: 'circle',
    gravity: -20, // Rise slowly
    friction: 0.97,
  },

  // XP collect - golden sparkles toward player
  XP_COLLECT: {
    count: 8,
    spread: 5,
    velocitySpread: 80,
    life: 0.4,
    size: 3,
    sizeDecay: 5,
    color: ['#FFD700', '#FFA500', '#FFFF00'],
    shape: 'star',
    gravity: 0,
    friction: 0.95,
    rotationSpeed: 8,
  },

  // Level up - golden shower from top
  LEVEL_UP: {
    count: 50,
    spread: 100,
    velocitySpread: 150,
    vx: 0,
    vy: 50,
    life: 1.5,
    size: 5,
    sizeDecay: 2,
    color: ['#FFD700', '#FFA500', '#FFFF00', '#F0E68C'],
    shape: 'star',
    gravity: 200,
    friction: 0.98,
    rotationSpeed: 5,
  },

  // Boss death - massive explosion + screen flash
  BOSS_DEATH: {
    count: 100,
    spread: 50,
    velocitySpread: 400,
    life: 1.2,
    size: 8,
    sizeDecay: 4,
    color: ['#FF0000', '#FF4500', '#FF6347', '#FFA500', '#FFD700', '#FFFF00'],
    shape: 'circle',
    gravity: 150,
    friction: 0.94,
  },

  // Footstep dust - small puff under player when moving
  FOOTSTEP_DUST: {
    count: 5,
    spread: 15,
    velocitySpread: 30,
    vx: 0,
    vy: -10,
    life: 0.4,
    size: 2,
    sizeDecay: 3,
    color: ['#8B7355', '#A0826D', '#B8956A'],
    shape: 'circle',
    gravity: 20,
    friction: 0.96,
  },

  // Smoke trail
  SMOKE_TRAIL: {
    count: 5,
    spread: 8,
    velocitySpread: 40,
    vx: 0,
    vy: -30,
    life: 0.8,
    size: 4,
    sizeDecay: 2,
    color: ['#696969', '#808080', '#A9A9A9', '#C0C0C0'],
    shape: 'circle',
    gravity: -30,
    friction: 0.96,
  },

  // Healing particles
  HEALING: {
    count: 15,
    spread: 20,
    velocitySpread: 60,
    vx: 0,
    vy: -50,
    life: 1.0,
    size: 4,
    sizeDecay: 2,
    color: ['#00FF00', '#32CD32', '#98FB98', '#90EE90'],
    shape: 'star',
    gravity: -40,
    friction: 0.97,
    rotationSpeed: 4,
  },

  // Coin pickup
  COIN_PICKUP: {
    count: 10,
    spread: 10,
    velocitySpread: 100,
    life: 0.5,
    size: 4,
    sizeDecay: 6,
    color: ['#FFD700', '#FFA500', '#DAA520'],
    shape: 'square',
    gravity: -50,
    friction: 0.95,
    rotationSpeed: 10,
  },

  // Screen shake particles
  IMPACT: {
    count: 20,
    spread: 30,
    velocitySpread: 250,
    life: 0.4,
    size: 3,
    sizeDecay: 5,
    color: ['#FFFFFF', '#F0F0F0', '#E0E0E0'],
    shape: 'line',
    gravity: 0,
    friction: 0.9,
  },

  // Critical hit
  CRITICAL_HIT: {
    count: 25,
    spread: 15,
    velocitySpread: 180,
    life: 0.6,
    size: 5,
    sizeDecay: 6,
    color: ['#FF0000', '#FF4500', '#FFD700', '#FFFF00'],
    shape: 'star',
    gravity: -20,
    friction: 0.93,
    rotationSpeed: 12,
  },
};

// ========== HELPER FUNCTIONS ==========

/**
 * Create a particle system instance
 */
export function createParticleSystem(maxParticles = 1000) {
  return new ParticleSystem(maxParticles);
}

/**
 * Emit directional burst (e.g., from weapon fire)
 */
export function emitDirectionalBurst(particleSystem, x, y, angle, config = {}) {
  const emitter = particleSystem.createEmitter(x, y);

  const burstConfig = {
    count: config.count || 10,
    spread: config.spread || 20,
    ...config,
  };

  // Override velocity to be directional
  const baseSpeed = config.speed || 100;
  const particles = [];

  for (let i = 0; i < burstConfig.count; i++) {
    const spreadAngle = angle + (Math.random() - 0.5) * (config.angleSpread || 0.5);
    const speed = baseSpeed + (Math.random() - 0.5) * (config.speedVariation || 50);

    const particleConfig = {
      ...burstConfig,
      vx: Math.cos(spreadAngle) * speed,
      vy: Math.sin(spreadAngle) * speed,
    };

    const particle = emitter.emit({ ...particleConfig, count: 1 })[0];
    if (particle) particles.push(particle);
  }

  particleSystem.removeEmitter(emitter);
  return particles;
}

/**
 * Emit particles in a ring pattern
 */
export function emitRing(particleSystem, x, y, radius, config = {}) {
  const emitter = particleSystem.createEmitter(x, y);
  const count = config.count || 20;
  const particles = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = config.speed || 100;

    const particleConfig = {
      ...config,
      offsetX: Math.cos(angle) * radius,
      offsetY: Math.sin(angle) * radius,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    };

    const particle = emitter.emit({ ...particleConfig, count: 1 })[0];
    if (particle) particles.push(particle);
  }

  particleSystem.removeEmitter(emitter);
  return particles;
}

/**
 * Emit particles along a line
 */
export function emitLine(particleSystem, x1, y1, x2, y2, config = {}) {
  const emitter = particleSystem.createEmitter(x1, y1);
  const count = config.count || 10;
  const particles = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;

    const particleConfig = {
      ...config,
      x,
      y,
    };

    const particle = emitter.emit({ ...particleConfig, count: 1 })[0];
    if (particle) particles.push(particle);
  }

  particleSystem.removeEmitter(emitter);
  return particles;
}

// Export all
export default ParticleSystem;
