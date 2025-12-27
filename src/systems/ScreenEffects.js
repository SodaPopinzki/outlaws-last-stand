/**
 * Screen Effects System - Full-screen visual effects
 *
 * Features:
 * - Screen shake with decay
 * - Color flash overlays
 * - Vignette (damage indicator)
 * - Slow motion time scaling
 * - Color grading filters
 * - Effect stacking and priority
 */

// ========== SCREEN SHAKE ==========

class ScreenShake {
  constructor() {
    this.offsetX = 0;
    this.offsetY = 0;
    this.intensity = 0;
    this.duration = 0;
    this.elapsed = 0;
    this.frequency = 15; // Shake frequency (Hz)
  }

  /**
   * Trigger screen shake
   */
  shake(intensity, duration) {
    // Add to existing shake (stacks)
    this.intensity = Math.max(this.intensity, intensity);
    this.duration = Math.max(this.duration, duration);
    this.elapsed = 0;
  }

  /**
   * Update shake offset
   */
  update(dt) {
    if (this.elapsed >= this.duration) {
      this.offsetX = 0;
      this.offsetY = 0;
      this.intensity = 0;
      return;
    }

    this.elapsed += dt;

    // Decay intensity over time
    const progress = this.elapsed / this.duration;
    const decayFactor = 1 - progress;
    const currentIntensity = this.intensity * decayFactor;

    // Generate random shake offset with frequency
    const angle = Math.random() * Math.PI * 2;
    this.offsetX = Math.cos(angle) * currentIntensity;
    this.offsetY = Math.sin(angle) * currentIntensity;
  }

  /**
   * Get current camera offset
   */
  getOffset() {
    return { x: this.offsetX, y: this.offsetY };
  }

  /**
   * Check if shake is active
   */
  isActive() {
    return this.intensity > 0 && this.elapsed < this.duration;
  }

  /**
   * Stop shake immediately
   */
  stop() {
    this.intensity = 0;
    this.duration = 0;
    this.elapsed = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }
}

// ========== FLASH OVERLAY ==========

class FlashOverlay {
  constructor() {
    this.color = '#FFFFFF';
    this.alpha = 0;
    this.targetAlpha = 0;
    this.duration = 0;
    this.elapsed = 0;
    this.fadeIn = true; // Start with fade in, then fade out
  }

  /**
   * Trigger flash effect
   */
  flash(color, duration, intensity = 0.7) {
    this.color = color;
    this.targetAlpha = Math.max(0, Math.min(1, intensity));
    this.duration = duration;
    this.elapsed = 0;
    this.alpha = 0;
    this.fadeIn = true;
  }

  /**
   * Update flash alpha
   */
  update(dt) {
    if (this.elapsed >= this.duration) {
      this.alpha = 0;
      return;
    }

    this.elapsed += dt;
    const progress = this.elapsed / this.duration;

    // Quick fade in (20%), long fade out (80%)
    if (progress < 0.2) {
      // Fade in
      this.alpha = (progress / 0.2) * this.targetAlpha;
    } else {
      // Fade out
      const fadeOutProgress = (progress - 0.2) / 0.8;
      this.alpha = this.targetAlpha * (1 - fadeOutProgress);
    }
  }

  /**
   * Render flash overlay
   */
  render(ctx, width, height) {
    if (this.alpha <= 0) return;

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  /**
   * Check if flash is active
   */
  isActive() {
    return this.alpha > 0 && this.elapsed < this.duration;
  }

  /**
   * Stop flash immediately
   */
  stop() {
    this.alpha = 0;
    this.duration = 0;
    this.elapsed = 0;
  }
}

// ========== VIGNETTE EFFECT ==========

class VignetteEffect {
  constructor() {
    this.intensity = 0;
    this.targetIntensity = 0;
    this.duration = 0;
    this.elapsed = 0;
    this.color = '#000000'; // Default dark vignette
    this.persistent = false; // For low HP pulsing
    this.pulseSpeed = 2; // Pulse cycles per second
  }

  /**
   * Trigger vignette effect
   */
  vignette(intensity, duration, color = '#000000', persistent = false) {
    this.targetIntensity = Math.max(0, Math.min(1, intensity));
    this.duration = duration;
    this.elapsed = 0;
    this.color = color;
    this.persistent = persistent;

    // Instant start for persistent vignettes
    if (persistent) {
      this.intensity = this.targetIntensity;
    }
  }

  /**
   * Update vignette intensity
   */
  update(dt) {
    if (!this.persistent && this.elapsed >= this.duration) {
      this.intensity = 0;
      return;
    }

    this.elapsed += dt;

    if (this.persistent) {
      // Pulse effect for persistent vignette (like low HP)
      const pulsePhase = Math.sin(this.elapsed * this.pulseSpeed * Math.PI * 2);
      const pulseFactor = 0.5 + (pulsePhase * 0.5); // 0 to 1
      this.intensity = this.targetIntensity * pulseFactor;
    } else {
      // Fade in quickly, fade out slowly
      const progress = this.elapsed / this.duration;

      if (progress < 0.1) {
        // Fade in (10% of duration)
        this.intensity = (progress / 0.1) * this.targetIntensity;
      } else {
        // Fade out (90% of duration)
        const fadeOutProgress = (progress - 0.1) / 0.9;
        this.intensity = this.targetIntensity * (1 - fadeOutProgress);
      }
    }
  }

  /**
   * Render vignette overlay
   */
  render(ctx, width, height) {
    if (this.intensity <= 0) return;

    ctx.save();

    // Create radial gradient from center
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(width, height) * 0.8;

    const gradient = ctx.createRadialGradient(
      centerX, centerY, radius * 0.3,
      centerX, centerY, radius
    );

    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, this.color);

    ctx.globalAlpha = this.intensity;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  /**
   * Check if vignette is active
   */
  isActive() {
    return this.intensity > 0;
  }

  /**
   * Stop vignette immediately
   */
  stop() {
    this.intensity = 0;
    this.duration = 0;
    this.elapsed = 0;
    this.persistent = false;
  }
}

// ========== SLOW MOTION ==========

class SlowMotion {
  constructor() {
    this.factor = 1.0; // 1.0 = normal speed
    this.targetFactor = 1.0;
    this.duration = 0;
    this.elapsed = 0;
    this.transitionDuration = 0.1; // Quick transition in/out
  }

  /**
   * Trigger slow motion
   * @param {number} factor - Time scale (0.5 = half speed, 0.1 = very slow)
   * @param {number} duration - Duration in seconds
   */
  slowMotion(factor, duration) {
    this.targetFactor = Math.max(0.01, Math.min(1.0, factor));
    this.duration = duration;
    this.elapsed = 0;
  }

  /**
   * Update time scale
   */
  update(dt) {
    if (this.elapsed >= this.duration) {
      // Transition back to normal speed
      this.targetFactor = 1.0;
    }

    this.elapsed += dt;

    // Smoothly transition to target factor
    const transitionSpeed = 1 / this.transitionDuration;
    if (this.factor < this.targetFactor) {
      this.factor = Math.min(this.targetFactor, this.factor + dt * transitionSpeed);
    } else if (this.factor > this.targetFactor) {
      this.factor = Math.max(this.targetFactor, this.factor - dt * transitionSpeed);
    }
  }

  /**
   * Get current time scale factor
   */
  getFactor() {
    return this.factor;
  }

  /**
   * Check if slow motion is active
   */
  isActive() {
    return this.factor < 1.0;
  }

  /**
   * Stop slow motion immediately
   */
  stop() {
    this.factor = 1.0;
    this.targetFactor = 1.0;
    this.duration = 0;
    this.elapsed = 0;
  }
}

// ========== COLOR GRADING ==========

const COLOR_GRADE_PRESETS = {
  normal: {
    brightness: 1.0,
    contrast: 1.0,
    saturation: 1.0,
    hue: 0,
    sepia: 0,
    tint: null,
  },
  sepia: {
    brightness: 1.1,
    contrast: 1.2,
    saturation: 0.6,
    hue: 20,
    sepia: 0.4,
    tint: 'rgba(112, 66, 20, 0.15)',
  },
  blood: {
    brightness: 0.9,
    contrast: 1.3,
    saturation: 1.2,
    hue: -10,
    sepia: 0,
    tint: 'rgba(139, 0, 0, 0.15)',
  },
  poison: {
    brightness: 0.95,
    contrast: 1.1,
    saturation: 1.4,
    hue: 100,
    sepia: 0,
    tint: 'rgba(0, 255, 0, 0.1)',
  },
  noir: {
    brightness: 0.85,
    contrast: 1.5,
    saturation: 0,
    hue: 0,
    sepia: 0,
    tint: null,
  },
  highNoon: {
    brightness: 1.2,
    contrast: 1.3,
    saturation: 1.3,
    hue: 10,
    sepia: 0.1,
    tint: 'rgba(255, 255, 200, 0.1)',
  },
};

class ColorGrading {
  constructor() {
    this.currentPreset = 'normal';
    this.settings = { ...COLOR_GRADE_PRESETS.normal };
    this.transitionDuration = 0.5;
    this.isTransitioning = false;
    this.transitionElapsed = 0;
    this.fromSettings = null;
    this.toSettings = null;
  }

  /**
   * Set color grade preset
   */
  setColorGrade(preset) {
    if (!COLOR_GRADE_PRESETS[preset]) {
      console.warn(`Unknown color grade preset: ${preset}`);
      return;
    }

    if (preset === this.currentPreset) return;

    // Start transition
    this.fromSettings = { ...this.settings };
    this.toSettings = { ...COLOR_GRADE_PRESETS[preset] };
    this.currentPreset = preset;
    this.isTransitioning = true;
    this.transitionElapsed = 0;
  }

  /**
   * Update color grade transition
   */
  update(dt) {
    if (!this.isTransitioning) return;

    this.transitionElapsed += dt;
    const progress = Math.min(1, this.transitionElapsed / this.transitionDuration);

    // Interpolate settings
    this.settings = {
      brightness: this.lerp(this.fromSettings.brightness, this.toSettings.brightness, progress),
      contrast: this.lerp(this.fromSettings.contrast, this.toSettings.contrast, progress),
      saturation: this.lerp(this.fromSettings.saturation, this.toSettings.saturation, progress),
      hue: this.lerp(this.fromSettings.hue, this.toSettings.hue, progress),
      sepia: this.lerp(this.fromSettings.sepia, this.toSettings.sepia, progress),
      tint: this.toSettings.tint, // Tint doesn't interpolate
    };

    if (progress >= 1) {
      this.isTransitioning = false;
      this.settings = { ...this.toSettings };
    }
  }

  /**
   * Apply color grading to canvas
   */
  apply(ctx, width, height) {
    if (this.currentPreset === 'normal' && !this.isTransitioning) return;

    const { brightness, contrast, saturation, hue, sepia, tint } = this.settings;

    // Build filter string
    const filters = [];

    if (brightness !== 1.0) {
      filters.push(`brightness(${brightness})`);
    }
    if (contrast !== 1.0) {
      filters.push(`contrast(${contrast})`);
    }
    if (saturation !== 1.0) {
      filters.push(`saturate(${saturation})`);
    }
    if (hue !== 0) {
      filters.push(`hue-rotate(${hue}deg)`);
    }
    if (sepia > 0) {
      filters.push(`sepia(${sepia})`);
    }

    if (filters.length > 0) {
      ctx.filter = filters.join(' ');
    }

    // Apply tint overlay if present
    if (tint) {
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }

  /**
   * Reset filters after rendering
   */
  reset(ctx) {
    ctx.filter = 'none';
  }

  /**
   * Linear interpolation helper
   */
  lerp(start, end, t) {
    return start + (end - start) * t;
  }

  /**
   * Get current preset name
   */
  getCurrentPreset() {
    return this.currentPreset;
  }
}

// ========== MAIN SCREEN EFFECTS CLASS ==========

export class ScreenEffects {
  constructor() {
    this.shake = new ScreenShake();
    this.flash = new FlashOverlay();
    this.vignette = new VignetteEffect();
    this.slowMo = new SlowMotion();
    this.colorGrade = new ColorGrading();
  }

  // ========== Screen Shake ==========

  /**
   * Trigger screen shake
   * @param {number} intensity - Shake intensity (pixels)
   * @param {number} duration - Duration in seconds
   */
  triggerShake(intensity, duration) {
    this.shake.shake(intensity, duration);
  }

  /**
   * Get camera shake offset
   */
  getShakeOffset() {
    return this.shake.getOffset();
  }

  // ========== Flash Overlay ==========

  /**
   * Trigger flash effect
   * @param {string} color - Flash color (hex or rgba)
   * @param {number} duration - Duration in seconds
   * @param {number} intensity - Alpha intensity (0-1)
   */
  triggerFlash(color, duration, intensity = 0.7) {
    this.flash.flash(color, duration, intensity);
  }

  // ========== Vignette ==========

  /**
   * Trigger vignette effect
   * @param {number} intensity - Vignette intensity (0-1)
   * @param {number} duration - Duration in seconds
   * @param {string} color - Vignette color
   * @param {boolean} persistent - Keep effect active (for pulsing)
   */
  triggerVignette(intensity, duration, color = '#000000', persistent = false) {
    this.vignette.vignette(intensity, duration, color, persistent);
  }

  /**
   * Stop vignette effect
   */
  stopVignette() {
    this.vignette.stop();
  }

  // ========== Slow Motion ==========

  /**
   * Trigger slow motion
   * @param {number} factor - Time scale (0.1 = very slow, 1.0 = normal)
   * @param {number} duration - Duration in seconds
   */
  triggerSlowMotion(factor, duration) {
    this.slowMo.slowMotion(factor, duration);
  }

  /**
   * Get current time scale factor
   */
  getTimeScale() {
    return this.slowMo.getFactor();
  }

  // ========== Color Grading ==========

  /**
   * Set color grade preset
   * @param {string} preset - 'normal', 'sepia', 'blood', 'poison', 'noir', 'highNoon'
   */
  setColorGrade(preset) {
    this.colorGrade.setColorGrade(preset);
  }

  /**
   * Get current color grade preset
   */
  getColorGrade() {
    return this.colorGrade.getCurrentPreset();
  }

  // ========== Update & Render ==========

  /**
   * Update all effects (call in game loop)
   */
  update(dt) {
    // Apply time scale to all time-based effects
    const scaledDt = dt * this.slowMo.getFactor();

    this.shake.update(scaledDt);
    this.flash.update(scaledDt);
    this.vignette.update(scaledDt);
    this.slowMo.update(dt); // Slow-mo uses real dt
    this.colorGrade.update(scaledDt);
  }

  /**
   * Render all visual effects
   */
  render(ctx, width, height) {
    // Color grading is applied to the whole scene
    // Call this before rendering game objects
    this.colorGrade.apply(ctx, width, height);
  }

  /**
   * Render overlay effects (call after game objects)
   */
  renderOverlays(ctx, width, height) {
    // Reset color grading
    this.colorGrade.reset(ctx);

    // Render overlays in order
    this.vignette.render(ctx, width, height);
    this.flash.render(ctx, width, height);
  }

  /**
   * Stop all effects immediately
   */
  stopAll() {
    this.shake.stop();
    this.flash.stop();
    this.vignette.stop();
    this.slowMo.stop();
  }

  /**
   * Get all active effects (for debugging)
   */
  getActiveEffects() {
    return {
      shake: this.shake.isActive(),
      flash: this.flash.isActive(),
      vignette: this.vignette.isActive(),
      slowMotion: this.slowMo.isActive(),
      colorGrade: this.colorGrade.getCurrentPreset() !== 'normal',
    };
  }
}

// ========== PRESET EFFECT COMBINATIONS ==========

/**
 * Preset effect combinations for common game events
 */
export const SCREEN_EFFECT_PRESETS = {
  // Player damaged
  PLAYER_HIT: (effects) => {
    effects.triggerVignette(0.6, 0.3, '#8B0000', false);
    effects.triggerFlash('#FF0000', 0.15, 0.3);
    effects.triggerShake(3, 0.1);
  },

  // Explosion nearby
  EXPLOSION: (effects, distance = 100) => {
    const intensity = Math.max(0, 1 - distance / 300);
    effects.triggerShake(15 * intensity, 0.4);
    effects.triggerFlash('#FFA500', 0.2, 0.4 * intensity);
  },

  // Boss spawned
  BOSS_SPAWN: (effects) => {
    effects.triggerSlowMotion(0.3, 1.5);
    effects.triggerFlash('#8B0000', 1.0, 0.5);
    effects.triggerShake(8, 0.6);
    effects.setColorGrade('blood');
  },

  // Boss defeated
  BOSS_DEATH: (effects) => {
    effects.triggerSlowMotion(0.2, 2.0);
    effects.triggerFlash('#FFFFFF', 1.5, 0.8);
    effects.triggerShake(20, 1.0);
    setTimeout(() => effects.setColorGrade('normal'), 2000);
  },

  // Player leveled up
  LEVEL_UP: (effects) => {
    effects.triggerFlash('#FFD700', 0.5, 0.5);
    effects.triggerShake(5, 0.3);
  },

  // Critical hit
  CRITICAL_HIT: (effects) => {
    effects.triggerShake(4, 0.15);
    effects.triggerFlash('#FFFF00', 0.1, 0.3);
  },

  // Low HP warning
  LOW_HP_START: (effects) => {
    effects.triggerVignette(0.5, 999, '#8B0000', true); // Persistent pulse
  },

  // HP recovered
  LOW_HP_END: (effects) => {
    effects.stopVignette();
  },

  // Death screen
  DEATH: (effects) => {
    effects.triggerFlash('#000000', 2.0, 0.9);
    effects.setColorGrade('noir');
    effects.triggerSlowMotion(0.1, 1.0);
  },

  // Victory
  VICTORY: (effects) => {
    effects.triggerSlowMotion(0.4, 3.0);
    effects.triggerFlash('#FFD700', 2.0, 0.4);
    effects.setColorGrade('highNoon');
  },

  // Poisoned
  POISONED: (effects) => {
    effects.setColorGrade('poison');
    effects.triggerVignette(0.3, 999, '#00FF00', true);
  },

  // Poison ended
  POISON_END: (effects) => {
    effects.setColorGrade('normal');
    effects.stopVignette();
  },
};

// ========== HELPER FUNCTIONS ==========

/**
 * Create screen effects instance
 */
export function createScreenEffects() {
  return new ScreenEffects();
}

/**
 * Calculate explosion shake based on distance
 */
export function calculateExplosionIntensity(playerX, playerY, explosionX, explosionY, maxDistance = 300) {
  const dx = playerX - explosionX;
  const dy = playerY - explosionY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return Math.max(0, 1 - distance / maxDistance);
}

/**
 * Trigger explosion effect with distance falloff
 */
export function triggerExplosionEffect(effects, playerX, playerY, explosionX, explosionY) {
  const intensity = calculateExplosionIntensity(playerX, playerY, explosionX, explosionY);

  if (intensity > 0) {
    effects.triggerShake(15 * intensity, 0.4);
    effects.triggerFlash('#FFA500', 0.2, 0.4 * intensity);
  }
}

// Export all
export default ScreenEffects;
