/**
 * Weapon Renderer System - Outlaw's Last Stand
 *
 * Handles all weapon projectile rendering with unique visuals for each type
 */

import { WEAPON_TYPES } from '../data/weapons';

// ========== WEAPON RENDERER CLASS ==========

export class WeaponRenderer {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.time = 0;
    this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
    this.screenFlash = { color: '#FFFFFF', alpha: 0, duration: 0 };
    this.muzzleFlashes = [];
    this.impactParticles = [];
    this.groundEffects = [];
  }

  /**
   * Update renderer time and effects
   */
  update(dt) {
    this.time += dt;

    // Update screen shake
    if (this.screenShake.duration > 0) {
      this.screenShake.duration -= dt;
      const progress = this.screenShake.duration / 0.5; // Max 0.5 second shake
      this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity * progress;
      this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity * progress;
    } else {
      this.screenShake.x = 0;
      this.screenShake.y = 0;
      this.screenShake.intensity = 0;
    }

    // Update screen flash
    if (this.screenFlash.duration > 0) {
      this.screenFlash.duration -= dt;
      this.screenFlash.alpha = Math.max(0, this.screenFlash.duration / 0.2); // 0.2 second fade
    }

    // Update muzzle flashes
    this.muzzleFlashes = this.muzzleFlashes.filter(flash => {
      flash.life -= dt;
      return flash.life > 0;
    });

    // Update impact particles
    this.impactParticles = this.impactParticles.filter(particle => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
      particle.alpha = particle.life / particle.maxLife;
      return particle.life > 0;
    });

    // Update ground effects
    this.groundEffects = this.groundEffects.filter(effect => {
      effect.life -= dt;
      effect.alpha = Math.min(1, effect.life / effect.maxLife);
      return effect.life > 0;
    });
  }

  /**
   * Apply screen shake and flash
   */
  applyScreenEffects() {
    this.ctx.save();
    this.ctx.translate(this.screenShake.x, this.screenShake.y);
  }

  /**
   * Remove screen effects
   */
  removeScreenEffects() {
    this.ctx.restore();

    // Draw screen flash
    if (this.screenFlash.alpha > 0) {
      this.ctx.save();
      this.ctx.fillStyle = this.screenFlash.color;
      this.ctx.globalAlpha = this.screenFlash.alpha * 0.3; // Max 30% opacity
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
  }

  // ========== PROJECTILE RENDERING ==========

  /**
   * Render a projectile based on its weapon type
   */
  renderProjectile(projectile, weapon) {
    if (!weapon) return;

    this.ctx.save();

    switch (weapon.type) {
      case WEAPON_TYPES.BULLET:
        this.renderBullet(projectile, weapon);
        break;
      case WEAPON_TYPES.EXPLOSIVE:
        this.renderExplosive(projectile, weapon);
        break;
      case WEAPON_TYPES.ORBIT:
        this.renderOrbit(projectile, weapon);
        break;
      case WEAPON_TYPES.BOUNCE:
        this.renderBounce(projectile, weapon);
        break;
      case WEAPON_TYPES.CLOUD:
        this.renderCloud(projectile, weapon);
        break;
      case WEAPON_TYPES.GROUND:
        this.renderGroundEffect(projectile, weapon);
        break;
      default:
        this.renderBullet(projectile, weapon);
        break;
    }

    this.ctx.restore();
  }

  /**
   * Render bullet projectile with trail
   */
  renderBullet(projectile, weapon) {
    const { x, y, angle = 0, color, size = 4 } = projectile;

    // Draw trail
    this.ctx.globalAlpha = 0.3;
    this.ctx.strokeStyle = weapon.trailColor || '#FFA500';
    this.ctx.lineWidth = size * 1.5;
    this.ctx.lineCap = 'round';

    this.ctx.beginPath();
    const trailLength = 15;
    const trailX = x - Math.cos(angle) * trailLength;
    const trailY = y - Math.sin(angle) * trailLength;
    this.ctx.moveTo(trailX, trailY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    // Draw bullet body (elongated)
    this.ctx.globalAlpha = 1.0;
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);

    // Gradient bullet
    const gradient = this.ctx.createLinearGradient(-size * 2, 0, size, 0);
    gradient.addColorStop(0, weapon.color || '#FFD700');
    gradient.addColorStop(1, '#FFFFFF');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(-size * 2, -size / 2, size * 3, size);

    // Bright tip
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(size, -size / 3, size / 2, size * 0.66);

    this.ctx.restore();

    // Add glow for special weapons
    if (weapon.rarity === 'legendary' || weapon.isEvolution) {
      this.ctx.globalAlpha = 0.4;
      this.ctx.fillStyle = weapon.color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Render explosive projectile with animated fuse
   */
  renderExplosive(projectile, weapon) {
    const { x, y, life = 0, color } = projectile;

    // Dynamite/bomb body
    this.ctx.fillStyle = weapon.color || '#DC143C';
    this.ctx.fillRect(x - 8, y - 6, 16, 12);

    // Fuse spark (animated)
    const sparkOffset = Math.sin(this.time * 20) * 2;
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(x + 8, y - 6 + sparkOffset, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Fuse line
    this.ctx.strokeStyle = '#8B4513';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 6);
    this.ctx.lineTo(x + 8, y - 10);
    this.ctx.stroke();

    // Smoke trail
    for (let i = 0; i < 3; i++) {
      const offset = i * 5;
      this.ctx.globalAlpha = 0.2 - i * 0.05;
      this.ctx.fillStyle = '#696969';
      this.ctx.beginPath();
      this.ctx.arc(x - offset, y + offset, 4 + i, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render orbiting weapon (lasso, pickaxe)
   */
  renderOrbit(projectile, weapon) {
    const { x, y, orbitAngle = 0, playerX, playerY } = projectile;

    // Draw connecting rope/chain
    if (playerX !== undefined && playerY !== undefined) {
      this.ctx.globalAlpha = 0.6;
      this.ctx.strokeStyle = weapon.color || '#D2691E';
      this.ctx.lineWidth = 3;
      this.ctx.setLineDash([5, 5]);

      this.ctx.beginPath();
      this.ctx.moveTo(playerX, playerY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      this.ctx.setLineDash([]);
      this.ctx.globalAlpha = 1.0;
    }

    // Draw weapon
    if (weapon.id.includes('lasso')) {
      // Draw lasso loop
      this.ctx.strokeStyle = weapon.color;
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 12, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 8, 0, Math.PI * 2);
      this.ctx.stroke();
    } else if (weapon.id.includes('pickaxe') || weapon.id.includes('tomahawk')) {
      // Draw spinning weapon
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(orbitAngle || this.time * 10);

      // Weapon handle
      this.ctx.fillStyle = weapon.color;
      this.ctx.fillRect(-2, -10, 4, 20);

      // Weapon head
      this.ctx.fillStyle = weapon.trailColor || '#C0C0C0';
      this.ctx.fillRect(-8, -10, 16, 6);

      // Motion blur
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillRect(-10, -10, 20, 6);

      this.ctx.restore();
    }
  }

  /**
   * Render bouncing star projectile
   */
  renderBounce(projectile, weapon) {
    const { x, y, bounceCount = 0 } = projectile;

    // Draw sparkle trail
    for (let i = 0; i < 5; i++) {
      const offset = i * 4;
      this.ctx.globalAlpha = 0.3 - i * 0.05;
      this.ctx.fillStyle = weapon.trailColor || '#FFA500';
      this.drawStar(x - offset, y - offset * 0.5, 3 - i * 0.5, 5);
    }

    this.ctx.globalAlpha = 1.0;

    // Draw main star
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(this.time * 5);

    // Glow
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = weapon.color || '#FFD700';
    this.drawStar(0, 0, 12, 5);

    // Main body
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillStyle = weapon.color || '#FFD700';
    this.drawStar(0, 0, 8, 5);

    // Bright center
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Bounce indicator (rings)
    if (bounceCount > 0) {
      this.ctx.globalAlpha = 0.5;
      this.ctx.strokeStyle = weapon.trailColor || '#DC143C';
      this.ctx.lineWidth = 2;
      for (let i = 0; i < bounceCount; i++) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 10 + i * 3, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  /**
   * Render poison cloud
   */
  renderCloud(projectile, weapon) {
    const { x, y, radius = 50, life = 1, maxLife = 1 } = projectile;

    const alpha = Math.min(1, life / maxLife);

    // Animated cloud particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + this.time;
      const offset = Math.sin(this.time * 2 + i) * 5;
      const cloudX = x + Math.cos(angle) * (radius * 0.7 + offset);
      const cloudY = y + Math.sin(angle) * (radius * 0.7 + offset);

      this.ctx.globalAlpha = alpha * (0.3 + Math.sin(this.time * 3 + i) * 0.1);
      this.ctx.fillStyle = weapon.color || '#9ACD32';
      this.ctx.beginPath();
      this.ctx.arc(cloudX, cloudY, 8 + Math.sin(this.time * 2 + i) * 3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Central cloud
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, weapon.color || '#9ACD32');
    gradient.addColorStop(0.5, weapon.trailColor || '#32CD32');
    gradient.addColorStop(1, 'transparent');

    this.ctx.globalAlpha = alpha * 0.4;
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render ground effect (fire pool, etc.)
   */
  renderGroundEffect(projectile, weapon) {
    const { x, y, radius = 60, life = 1, maxLife = 1 } = projectile;

    const alpha = Math.min(1, life / maxLife);

    if (weapon.id.includes('molotov') || weapon.id.includes('hellfire')) {
      // Fire pool
      this.renderFirePool(x, y, radius, alpha);
    } else {
      // Generic ground effect
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, weapon.color || '#FF8C00');
      gradient.addColorStop(0.7, weapon.trailColor || '#FFD700');
      gradient.addColorStop(1, 'transparent');

      this.ctx.globalAlpha = alpha * 0.5;
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.globalAlpha = 1.0;
    }
  }

  /**
   * Render animated fire pool
   */
  renderFirePool(x, y, radius, alpha) {
    // Flames
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const flameRadius = radius * (0.7 + Math.random() * 0.3);
      const flameX = x + Math.cos(angle + this.time) * flameRadius;
      const flameY = y + Math.sin(angle + this.time) * flameRadius;
      const flameHeight = 10 + Math.sin(this.time * 5 + i) * 5;

      // Flame gradient
      const gradient = this.ctx.createLinearGradient(
        flameX, flameY,
        flameX, flameY - flameHeight
      );
      gradient.addColorStop(0, '#FF4500');
      gradient.addColorStop(0.5, '#FFA500');
      gradient.addColorStop(1, '#FFD700');

      this.ctx.globalAlpha = alpha * (0.6 + Math.random() * 0.4);
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.moveTo(flameX - 3, flameY);
      this.ctx.lineTo(flameX, flameY - flameHeight);
      this.ctx.lineTo(flameX + 3, flameY);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Base glow
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, '#FF8C00');
    gradient.addColorStop(0.5, '#FF4500');
    gradient.addColorStop(1, 'transparent');

    this.ctx.globalAlpha = alpha * 0.4;
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.globalAlpha = 1.0;
  }

  // ========== VISUAL EFFECTS ==========

  /**
   * Create muzzle flash effect
   */
  createMuzzleFlash(x, y, angle, weapon) {
    const size = weapon.id.includes('shotgun') ? 20 : 12;

    this.muzzleFlashes.push({
      x,
      y,
      angle,
      size,
      color: weapon.color || '#FFD700',
      life: 0.05, // Very brief flash
    });

    // Screen flash for shotgun
    if (weapon.id.includes('sawed_off')) {
      this.addScreenFlash('#FFA500', 0.15);
    }
  }

  /**
   * Render muzzle flashes
   */
  renderMuzzleFlashes() {
    this.muzzleFlashes.forEach(flash => {
      this.ctx.save();
      this.ctx.translate(flash.x, flash.y);
      this.ctx.rotate(flash.angle);

      // Flash cone
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, flash.size);
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(0.5, flash.color);
      gradient.addColorStop(1, 'transparent');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(flash.size, -flash.size / 2);
      this.ctx.lineTo(flash.size, flash.size / 2);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  /**
   * Create impact particles on hit
   */
  createImpactParticles(x, y, color = '#FFD700', isCritical = false) {
    const count = isCritical ? 20 : 10;
    const speed = isCritical ? 200 : 100;
    const size = isCritical ? 6 : 4;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const velocity = speed * (0.5 + Math.random() * 0.5);

      this.impactParticles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: size * (0.5 + Math.random() * 0.5),
        color: isCritical ? '#FF0000' : color,
        life: 0.5,
        maxLife: 0.5,
        alpha: 1,
      });
    }

    // Critical hit flash
    if (isCritical) {
      this.addScreenFlash('#FF0000', 0.1);
      this.addScreenShake(15, 0.3);
    }
  }

  /**
   * Render impact particles
   */
  renderImpactParticles() {
    this.impactParticles.forEach(particle => {
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Create explosion effect
   */
  createExplosion(x, y, radius, weapon) {
    // Screen shake based on explosion size
    const shakeIntensity = Math.min(30, radius / 5);
    this.addScreenShake(shakeIntensity, 0.5);

    // Flash
    this.addScreenFlash(weapon.color || '#FFA500', 0.2);

    // Explosion particles
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const speed = 100 + Math.random() * 100;

      this.impactParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: i % 2 === 0 ? '#FF8C00' : '#FFD700',
        life: 0.8,
        maxLife: 0.8,
        alpha: 1,
      });
    }

    // Shockwave ring
    this.createShockwave(x, y, radius);
  }

  /**
   * Create shockwave effect
   */
  createShockwave(x, y, maxRadius) {
    const shockwave = {
      x,
      y,
      radius: 0,
      maxRadius,
      life: 0.5,
      maxLife: 0.5,
    };

    const interval = setInterval(() => {
      shockwave.life -= 0.016; // ~60fps
      shockwave.radius = maxRadius * (1 - shockwave.life / shockwave.maxLife);

      if (shockwave.life <= 0) {
        clearInterval(interval);
      }
    }, 16);
  }

  /**
   * Add ground effect (for molotov, etc.)
   */
  addGroundEffect(x, y, radius, duration, type, weapon) {
    this.groundEffects.push({
      x,
      y,
      radius,
      life: duration,
      maxLife: duration,
      type,
      weapon,
      alpha: 1,
    });
  }

  /**
   * Render all ground effects
   */
  renderGroundEffects() {
    this.groundEffects.forEach(effect => {
      if (effect.type === 'fire') {
        this.renderFirePool(effect.x, effect.y, effect.radius, effect.alpha);
      } else if (effect.type === 'poison') {
        const gradient = this.ctx.createRadialGradient(
          effect.x, effect.y, 0,
          effect.x, effect.y, effect.radius
        );
        gradient.addColorStop(0, '#9ACD32');
        gradient.addColorStop(0.5, '#32CD32');
        gradient.addColorStop(1, 'transparent');

        this.ctx.globalAlpha = effect.alpha * 0.5;
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
      }
    });
  }

  /**
   * Create horse charge effect
   */
  createHorseCharge(x, y, angle, speed) {
    // Dust cloud particles
    for (let i = 0; i < 5; i++) {
      const offset = i * -10; // Behind the horse
      const dustX = x + Math.cos(angle + Math.PI) * offset;
      const dustY = y + Math.sin(angle + Math.PI) * offset;

      this.impactParticles.push({
        x: dustX,
        y: dustY,
        vx: (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50,
        size: 6 + Math.random() * 4,
        color: '#D2B48C',
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        alpha: 1,
      });
    }

    // Ground dust kick-up
    this.addScreenShake(5, 0.2);
  }

  // ========== SCREEN EFFECTS ==========

  /**
   * Add screen shake effect
   */
  addScreenShake(intensity, duration) {
    if (intensity > this.screenShake.intensity) {
      this.screenShake.intensity = intensity;
      this.screenShake.duration = duration;
    }
  }

  /**
   * Add screen flash effect
   */
  addScreenFlash(color, duration) {
    this.screenFlash.color = color;
    this.screenFlash.alpha = 1.0;
    this.screenFlash.duration = duration;
  }

  // ========== HELPER FUNCTIONS ==========

  /**
   * Draw a star shape
   */
  drawStar(x, y, radius, points) {
    const step = Math.PI / points;
    this.ctx.beginPath();

    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius / 2;
      const angle = i * step - Math.PI / 2;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;

      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }

    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Clear all effects (for game reset)
   */
  clearEffects() {
    this.muzzleFlashes = [];
    this.impactParticles = [];
    this.groundEffects = [];
    this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
    this.screenFlash = { color: '#FFFFFF', alpha: 0, duration: 0 };
  }

  /**
   * Get current screen shake offset
   */
  getScreenShake() {
    return {
      x: this.screenShake.x,
      y: this.screenShake.y,
    };
  }
}

// ========== HELPER FUNCTIONS ==========

/**
 * Create a new weapon renderer instance
 */
export function createWeaponRenderer(ctx, canvas) {
  return new WeaponRenderer(ctx, canvas);
}

/**
 * Get weapon visual properties
 */
export function getWeaponVisualProperties(weapon) {
  return {
    color: weapon.color || '#FFD700',
    trailColor: weapon.trailColor || '#FFA500',
    glowIntensity: weapon.rarity === 'legendary' ? 0.6 : 0.3,
    particleCount: weapon.rarity === 'legendary' ? 15 : 10,
    hasScreenShake: weapon.type === 'explosive',
    hasMuzzleFlash: weapon.type === 'bullet',
  };
}

export default WeaponRenderer;
