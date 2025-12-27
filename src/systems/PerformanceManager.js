/**
 * Performance Manager System
 *
 * Optimizes game performance for smooth 60fps:
 * - Object pooling for all major entity types
 * - Spatial partitioning for efficient collision detection
 * - Render culling and batching
 * - Dynamic LOD based on FPS
 * - Enemy AI culling for off-screen entities
 *
 * Usage:
 * const perfManager = new PerformanceManager(canvasWidth, canvasHeight);
 * const projectile = perfManager.getProjectile();
 * perfManager.returnProjectile(projectile);
 * perfManager.update(dt, fps);
 */

/**
 * Generic Object Pool
 * Pre-allocates objects and reuses them to avoid GC pressure
 */
class ObjectPool {
  constructor(factory, initialSize = 100) {
    this.factory = factory; // Function that creates new objects
    this.available = [];
    this.inUse = new Set();

    // Pre-allocate initial objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  /**
   * Get an object from the pool
   * @returns {Object} Pooled object
   */
  get() {
    let obj;
    if (this.available.length > 0) {
      obj = this.available.pop();
    } else {
      // Pool exhausted, create new object
      obj = this.factory();
    }
    this.inUse.add(obj);
    return obj;
  }

  /**
   * Return an object to the pool
   * @param {Object} obj - Object to return
   */
  return(obj) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.available.push(obj);
      // Reset object state if it has a reset method
      if (obj.reset) {
        obj.reset();
      }
    }
  }

  /**
   * Return multiple objects at once
   * @param {Array} objects - Array of objects to return
   */
  returnMany(objects) {
    objects.forEach((obj) => this.return(obj));
  }

  /**
   * Get pool statistics
   * @returns {Object} Pool stats
   */
  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    };
  }
}

/**
 * Spatial Hash Grid
 * Divides world into grid cells for efficient spatial queries
 */
class SpatialHash {
  constructor(cellSize = 100) {
    this.cellSize = cellSize;
    this.grid = new Map(); // Map<string, Set<entity>>
  }

  /**
   * Get grid cell key for coordinates
   * @private
   */
  _getCellKey(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Insert entity into grid
   * @param {Object} entity - Entity with x, y, width, height
   */
  insert(entity) {
    if (!entity || entity.x === undefined || entity.y === undefined) return;

    // Calculate all cells the entity occupies
    const minX = Math.floor(entity.x / this.cellSize);
    const minY = Math.floor(entity.y / this.cellSize);
    const maxX = Math.floor((entity.x + (entity.width || 0)) / this.cellSize);
    const maxY = Math.floor((entity.y + (entity.height || 0)) / this.cellSize);

    // Insert into all occupied cells
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const key = `${x},${y}`;
        if (!this.grid.has(key)) {
          this.grid.set(key, new Set());
        }
        this.grid.get(key).add(entity);
      }
    }
  }

  /**
   * Query entities near a point
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} radius - Search radius (default: cell size)
   * @returns {Set} Set of nearby entities
   */
  queryRadius(x, y, radius = this.cellSize) {
    const entities = new Set();
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerCellX = Math.floor(x / this.cellSize);
    const centerCellY = Math.floor(y / this.cellSize);

    // Check surrounding cells
    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        const key = `${centerCellX + dx},${centerCellY + dy}`;
        const cell = this.grid.get(key);
        if (cell) {
          cell.forEach((entity) => entities.add(entity));
        }
      }
    }

    return entities;
  }

  /**
   * Query entities in a rectangular region
   * @param {number} x - Top-left X
   * @param {number} y - Top-left Y
   * @param {number} width - Region width
   * @param {number} height - Region height
   * @returns {Set} Set of entities in region
   */
  queryRegion(x, y, width, height) {
    const entities = new Set();
    const minCellX = Math.floor(x / this.cellSize);
    const minCellY = Math.floor(y / this.cellSize);
    const maxCellX = Math.floor((x + width) / this.cellSize);
    const maxCellY = Math.floor((y + height) / this.cellSize);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = `${cx},${cy}`;
        const cell = this.grid.get(key);
        if (cell) {
          cell.forEach((entity) => entities.add(entity));
        }
      }
    }

    return entities;
  }

  /**
   * Clear the entire grid
   */
  clear() {
    this.grid.clear();
  }

  /**
   * Get grid statistics
   * @returns {Object} Grid stats
   */
  getStats() {
    let totalEntities = 0;
    let maxCellSize = 0;
    this.grid.forEach((cell) => {
      totalEntities += cell.size;
      maxCellSize = Math.max(maxCellSize, cell.size);
    });
    return {
      cellCount: this.grid.size,
      totalEntities,
      maxCellSize,
      avgCellSize: this.grid.size > 0 ? totalEntities / this.grid.size : 0,
    };
  }
}

/**
 * Performance Manager
 * Main class that orchestrates all performance optimizations
 */
export class PerformanceManager {
  constructor(canvasWidth = 1920, canvasHeight = 1080) {
    // Canvas dimensions
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Object pools
    this.projectilePool = new ObjectPool(() => this._createProjectile(), 500);
    this.particlePool = new ObjectPool(() => this._createParticle(), 1000);
    this.damageNumberPool = new ObjectPool(() => this._createDamageNumber(), 100);
    this.enemyPool = new ObjectPool(() => this._createEnemy(), 200);

    // Spatial partitioning
    this.spatialHash = new SpatialHash(100); // 100px cells (tunable)

    // Performance tracking
    this.fpsHistory = [];
    this.fpsHistorySize = 60; // Track last 60 frames
    this.averageFPS = 60;
    this.lodLevel = 0; // 0 = full quality, 1 = reduced, 2 = minimal

    // Render optimization
    this.renderBuffer = 200; // Extra pixels outside camera to render
    this.cullDistance = 2000; // Max distance from player before despawn

    // Settings
    this.settings = {
      enableSpatialPartitioning: true,
      enableObjectPooling: true,
      enableRenderCulling: true,
      enableLOD: true,
      enableEnemyCulling: true,
    };

    // Stats
    this.stats = {
      pooledProjectiles: 0,
      pooledParticles: 0,
      pooledDamageNumbers: 0,
      pooledEnemies: 0,
      spatialHashCells: 0,
      entitiesRendered: 0,
      entitiesCulled: 0,
      currentLOD: 0,
    };
  }

  /**
   * Factory methods for pooled objects
   * These create blank objects that will be initialized when retrieved from pool
   */

  _createProjectile() {
    return {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      damage: 0,
      width: 5,
      height: 5,
      lifetime: 0,
      maxLifetime: 5,
      owner: null,
      reset() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.damage = 0;
        this.lifetime = 0;
        this.owner = null;
      },
    };
  }

  _createParticle() {
    return {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      size: 3,
      color: '#ffffff',
      alpha: 1,
      reset() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.life = 0;
        this.maxLife = 1;
        this.alpha = 1;
      },
    };
  }

  _createDamageNumber() {
    return {
      active: false,
      x: 0,
      y: 0,
      value: 0,
      life: 0,
      maxLife: 1,
      color: '#ffffff',
      reset() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.value = 0;
        this.life = 0;
      },
    };
  }

  _createEnemy() {
    return {
      active: false,
      x: 0,
      y: 0,
      hp: 100,
      maxHp: 100,
      speed: 50,
      width: 20,
      height: 20,
      type: 'basic',
      reset() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.hp = 100;
        this.maxHp = 100;
        this.type = 'basic';
      },
    };
  }

  /**
   * Get projectile from pool
   * @param {Object} config - Initial configuration
   * @returns {Object} Projectile object
   */
  getProjectile(config = {}) {
    if (!this.settings.enableObjectPooling) {
      return { ...this._createProjectile(), ...config, active: true };
    }

    const projectile = this.projectilePool.get();
    Object.assign(projectile, config);
    projectile.active = true;
    return projectile;
  }

  /**
   * Return projectile to pool
   * @param {Object} projectile - Projectile to return
   */
  returnProjectile(projectile) {
    if (this.settings.enableObjectPooling) {
      this.projectilePool.return(projectile);
    }
  }

  /**
   * Get particle from pool
   * @param {Object} config - Initial configuration
   * @returns {Object} Particle object
   */
  getParticle(config = {}) {
    if (!this.settings.enableObjectPooling) {
      return { ...this._createParticle(), ...config, active: true };
    }

    // Apply LOD: reduce particle creation at high counts
    if (this.lodLevel >= 1 && Math.random() < 0.5) {
      return null; // Skip 50% of particles at LOD 1
    }
    if (this.lodLevel >= 2 && Math.random() < 0.75) {
      return null; // Skip 75% of particles at LOD 2
    }

    const particle = this.particlePool.get();
    Object.assign(particle, config);
    particle.active = true;
    return particle;
  }

  /**
   * Return particle to pool
   * @param {Object} particle - Particle to return
   */
  returnParticle(particle) {
    if (this.settings.enableObjectPooling) {
      this.particlePool.return(particle);
    }
  }

  /**
   * Get damage number from pool
   * @param {Object} config - Initial configuration
   * @returns {Object} Damage number object
   */
  getDamageNumber(config = {}) {
    if (!this.settings.enableObjectPooling) {
      return { ...this._createDamageNumber(), ...config, active: true };
    }

    const damageNumber = this.damageNumberPool.get();
    Object.assign(damageNumber, config);
    damageNumber.active = true;
    return damageNumber;
  }

  /**
   * Return damage number to pool
   * @param {Object} damageNumber - Damage number to return
   */
  returnDamageNumber(damageNumber) {
    if (this.settings.enableObjectPooling) {
      this.damageNumberPool.return(damageNumber);
    }
  }

  /**
   * Get enemy from pool
   * @param {Object} config - Initial configuration
   * @returns {Object} Enemy object
   */
  getEnemy(config = {}) {
    if (!this.settings.enableObjectPooling) {
      return { ...this._createEnemy(), ...config, active: true };
    }

    const enemy = this.enemyPool.get();
    Object.assign(enemy, config);
    enemy.active = true;
    return enemy;
  }

  /**
   * Return enemy to pool
   * @param {Object} enemy - Enemy to return
   */
  returnEnemy(enemy) {
    if (this.settings.enableObjectPooling) {
      this.enemyPool.return(enemy);
    }
  }

  /**
   * Update spatial hash with current entities
   * @param {Array} entities - All entities to index
   */
  updateSpatialHash(entities) {
    if (!this.settings.enableSpatialPartitioning) return;

    this.spatialHash.clear();
    entities.forEach((entity) => {
      if (entity.active !== false) {
        this.spatialHash.insert(entity);
      }
    });
  }

  /**
   * Get nearby entities for collision detection
   * @param {Object} entity - Entity to query around
   * @param {number} radius - Search radius
   * @returns {Set} Set of nearby entities
   */
  getNearbyEntities(entity, radius = 100) {
    if (!this.settings.enableSpatialPartitioning) {
      return new Set(); // Fallback to brute force in game logic
    }

    return this.spatialHash.queryRadius(entity.x, entity.y, radius);
  }

  /**
   * Check if entity is within camera bounds (with buffer)
   * @param {Object} entity - Entity to check
   * @param {Object} camera - Camera position {x, y}
   * @returns {boolean} True if entity should be rendered
   */
  isInCameraBounds(entity, camera) {
    if (!this.settings.enableRenderCulling) return true;

    const buffer = this.renderBuffer;
    const entityX = entity.x - camera.x;
    const entityY = entity.y - camera.y;
    const entityWidth = entity.width || 20;
    const entityHeight = entity.height || 20;

    return (
      entityX + entityWidth > -buffer &&
      entityX < this.canvasWidth + buffer &&
      entityY + entityHeight > -buffer &&
      entityY < this.canvasHeight + buffer
    );
  }

  /**
   * Filter entities for rendering (culling)
   * @param {Array} entities - All entities
   * @param {Object} camera - Camera position
   * @returns {Array} Entities within camera bounds
   */
  cullForRendering(entities, camera) {
    if (!this.settings.enableRenderCulling) {
      this.stats.entitiesRendered = entities.length;
      this.stats.entitiesCulled = 0;
      return entities;
    }

    const visible = entities.filter((entity) => this.isInCameraBounds(entity, camera));
    this.stats.entitiesRendered = visible.length;
    this.stats.entitiesCulled = entities.length - visible.length;
    return visible;
  }

  /**
   * Check if enemy should be culled (too far from player)
   * @param {Object} enemy - Enemy to check
   * @param {Object} player - Player position
   * @returns {boolean} True if enemy should be removed
   */
  shouldCullEnemy(enemy, player) {
    if (!this.settings.enableEnemyCulling) return false;

    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance > this.cullDistance;
  }

  /**
   * Determine if enemy AI should be updated (on-screen check)
   * @param {Object} enemy - Enemy to check
   * @param {Object} camera - Camera position
   * @returns {boolean} True if AI should update
   */
  shouldUpdateEnemyAI(enemy, camera) {
    if (!this.settings.enableEnemyCulling) return true;

    // Only update AI for on-screen or near-screen enemies
    const buffer = this.renderBuffer * 2; // Larger buffer for AI
    const entityX = enemy.x - camera.x;
    const entityY = enemy.y - camera.y;

    return (
      entityX > -buffer &&
      entityX < this.canvasWidth + buffer &&
      entityY > -buffer &&
      entityY < this.canvasHeight + buffer
    );
  }

  /**
   * Update FPS tracking and LOD
   * @param {number} dt - Delta time
   * @param {number} fps - Current FPS
   */
  update(dt, fps) {
    // Track FPS history
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.fpsHistorySize) {
      this.fpsHistory.shift();
    }

    // Calculate average FPS
    this.averageFPS =
      this.fpsHistory.reduce((sum, f) => sum + f, 0) / this.fpsHistory.length;

    // Update LOD based on FPS
    if (this.settings.enableLOD) {
      this._updateLOD();
    }

    // Update stats
    this._updateStats();
  }

  /**
   * Update LOD level based on average FPS
   * @private
   */
  _updateLOD() {
    const prevLOD = this.lodLevel;

    if (this.averageFPS >= 50) {
      this.lodLevel = 0; // Full quality
    } else if (this.averageFPS >= 35) {
      this.lodLevel = 1; // Reduced quality
    } else if (this.averageFPS >= 25) {
      this.lodLevel = 2; // Minimal quality
    } else {
      this.lodLevel = 3; // Ultra low (emergency)
    }

    // Log LOD changes
    if (prevLOD !== this.lodLevel) {
      console.log(`[Performance] LOD changed: ${prevLOD} -> ${this.lodLevel} (FPS: ${this.averageFPS.toFixed(1)})`);
    }

    this.stats.currentLOD = this.lodLevel;
  }

  /**
   * Update performance statistics
   * @private
   */
  _updateStats() {
    this.stats.pooledProjectiles = this.projectilePool.getStats().inUse;
    this.stats.pooledParticles = this.particlePool.getStats().inUse;
    this.stats.pooledDamageNumbers = this.damageNumberPool.getStats().inUse;
    this.stats.pooledEnemies = this.enemyPool.getStats().inUse;
    this.stats.spatialHashCells = this.spatialHash.getStats().cellCount;
  }

  /**
   * Get particle detail level based on LOD
   * @returns {number} Particle detail multiplier (0-1)
   */
  getParticleDetailLevel() {
    switch (this.lodLevel) {
      case 0:
        return 1.0; // 100% particles
      case 1:
        return 0.5; // 50% particles
      case 2:
        return 0.25; // 25% particles
      case 3:
        return 0.1; // 10% particles
      default:
        return 1.0;
    }
  }

  /**
   * Check if visual effect should be rendered based on LOD
   * @param {string} effectType - Type of effect ('shadow', 'glow', 'trail', etc.)
   * @returns {boolean} True if effect should render
   */
  shouldRenderEffect(effectType) {
    if (!this.settings.enableLOD) return true;

    switch (this.lodLevel) {
      case 0:
        return true; // All effects
      case 1:
        return effectType !== 'shadow' && effectType !== 'glow'; // Skip shadows/glows
      case 2:
        return effectType === 'basic'; // Only basic rendering
      case 3:
        return false; // No extra effects
      default:
        return true;
    }
  }

  /**
   * Get current performance statistics
   * @returns {Object} Performance stats
   */
  getStats() {
    return {
      ...this.stats,
      averageFPS: this.averageFPS.toFixed(1),
      pools: {
        projectiles: this.projectilePool.getStats(),
        particles: this.particlePool.getStats(),
        damageNumbers: this.damageNumberPool.getStats(),
        enemies: this.enemyPool.getStats(),
      },
      spatialHash: this.spatialHash.getStats(),
    };
  }

  /**
   * Reset all pools and spatial hash
   */
  reset() {
    this.spatialHash.clear();
    this.fpsHistory = [];
    this.averageFPS = 60;
    this.lodLevel = 0;
  }
}

/**
 * Helper: Batch render similar entities
 * Groups entities by type and renders them together
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} entities - Entities to render
 * @param {Function} renderFunc - Function to render a single entity
 */
export function batchRender(ctx, entities, renderFunc) {
  // Group by type/color for efficient rendering
  const batches = new Map();

  entities.forEach((entity) => {
    const key = entity.color || entity.type || 'default';
    if (!batches.has(key)) {
      batches.set(key, []);
    }
    batches.get(key).push(entity);
  });

  // Render each batch
  batches.forEach((batch, key) => {
    ctx.save();
    // Set common properties once per batch
    if (key !== 'default') {
      ctx.fillStyle = key;
    }
    batch.forEach((entity) => renderFunc(ctx, entity));
    ctx.restore();
  });
}

/**
 * Helper: Create offscreen canvas for static elements
 * Useful for backgrounds, UI elements that don't change
 *
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Function} drawFunc - Function to draw on canvas
 * @returns {HTMLCanvasElement} Offscreen canvas
 */
export function createOffscreenCanvas(width, height, drawFunc) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawFunc(ctx);
  return canvas;
}

export default PerformanceManager;
