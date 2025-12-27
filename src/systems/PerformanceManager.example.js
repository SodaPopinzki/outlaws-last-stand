/**
 * Performance Manager Integration Examples
 *
 * This file demonstrates how to integrate the PerformanceManager
 * into your game for optimal performance.
 */

import PerformanceManager, { batchRender, createOffscreenCanvas } from './PerformanceManager';

/**
 * EXAMPLE 1: Initialize Performance Manager
 */
function initializeGame() {
  const canvasWidth = 1920;
  const canvasHeight = 1080;
  const perfManager = new PerformanceManager(canvasWidth, canvasHeight);

  // Optional: Configure settings
  perfManager.settings.enableSpatialPartitioning = true;
  perfManager.settings.enableObjectPooling = true;
  perfManager.settings.enableRenderCulling = true;
  perfManager.settings.enableLOD = true;
  perfManager.settings.enableEnemyCulling = true;

  return perfManager;
}

/**
 * EXAMPLE 2: Object Pooling - Projectiles
 */
function createProjectile(perfManager, x, y, angle, speed) {
  // Get projectile from pool instead of creating new object
  const projectile = perfManager.getProjectile({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    damage: 10,
    width: 5,
    height: 5,
    lifetime: 0,
    maxLifetime: 3,
    owner: 'player',
  });

  return projectile;
}

function updateProjectiles(perfManager, projectiles, dt) {
  const toRemove = [];

  projectiles.forEach((projectile) => {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.lifetime += dt;

    // Check if projectile expired
    if (projectile.lifetime >= projectile.maxLifetime) {
      toRemove.push(projectile);
    }
  });

  // Return dead projectiles to pool
  toRemove.forEach((projectile) => {
    const index = projectiles.indexOf(projectile);
    if (index > -1) {
      projectiles.splice(index, 1);
      perfManager.returnProjectile(projectile); // Return to pool!
    }
  });
}

/**
 * EXAMPLE 3: Object Pooling - Particles
 */
function createExplosion(perfManager, x, y, count = 20) {
  const particles = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 200 + 100;

    // Get particle from pool
    const particle = perfManager.getParticle({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 1,
      size: Math.random() * 5 + 2,
      color: ['#ff6600', '#ff9900', '#ffcc00'][Math.floor(Math.random() * 3)],
      alpha: 1,
    });

    // Particle might be null if LOD is reducing particle count
    if (particle) {
      particles.push(particle);
    }
  }

  return particles;
}

function updateParticles(perfManager, particles, dt) {
  const toRemove = [];

  particles.forEach((particle) => {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 300 * dt; // Gravity
    particle.life += dt;
    particle.alpha = 1 - particle.life / particle.maxLife;

    if (particle.life >= particle.maxLife) {
      toRemove.push(particle);
    }
  });

  // Return dead particles to pool
  toRemove.forEach((particle) => {
    const index = particles.indexOf(particle);
    if (index > -1) {
      particles.splice(index, 1);
      perfManager.returnParticle(particle); // Return to pool!
    }
  });
}

/**
 * EXAMPLE 4: Spatial Partitioning for Collision Detection
 */
function checkCollisions(perfManager, projectiles, enemies) {
  // Update spatial hash with all enemies
  perfManager.updateSpatialHash(enemies);

  projectiles.forEach((projectile) => {
    // Get only nearby enemies (much faster than checking all)
    const nearbyEnemies = perfManager.getNearbyEntities(projectile, 100);

    nearbyEnemies.forEach((enemy) => {
      // Check actual collision
      if (checkCollision(projectile, enemy)) {
        enemy.hp -= projectile.damage;
        projectile.active = false;
      }
    });
  });
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * EXAMPLE 5: Render Culling
 */
function renderEntities(perfManager, ctx, entities, camera) {
  // Only render entities within camera bounds
  const visibleEntities = perfManager.cullForRendering(entities, camera);

  visibleEntities.forEach((entity) => {
    const screenX = entity.x - camera.x;
    const screenY = entity.y - camera.y;

    ctx.fillStyle = entity.color || '#ffffff';
    ctx.fillRect(screenX, screenY, entity.width, entity.height);
  });

  // Check stats
  const stats = perfManager.getStats();
  console.log(
    `Rendered: ${stats.entitiesRendered}, Culled: ${stats.entitiesCulled}`
  );
}

/**
 * EXAMPLE 6: Enemy Culling
 */
function updateEnemies(perfManager, enemies, player, camera, dt) {
  const toRemove = [];

  enemies.forEach((enemy) => {
    // Check if enemy should be despawned (too far from player)
    if (perfManager.shouldCullEnemy(enemy, player)) {
      toRemove.push(enemy);
      return;
    }

    // Always update position
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    enemy.x += (dx / distance) * enemy.speed * dt;
    enemy.y += (dy / distance) * enemy.speed * dt;

    // Only update AI if on-screen or near-screen
    if (perfManager.shouldUpdateEnemyAI(enemy, camera)) {
      updateEnemyAI(enemy, player, dt);
    }
  });

  // Remove culled enemies and return to pool
  toRemove.forEach((enemy) => {
    const index = enemies.indexOf(enemy);
    if (index > -1) {
      enemies.splice(index, 1);
      perfManager.returnEnemy(enemy);
    }
  });
}

function updateEnemyAI(enemy, player, dt) {
  // Complex AI logic only runs for on-screen enemies
  // Example: pathfinding, attack patterns, etc.
}

/**
 * EXAMPLE 7: LOD-Based Rendering
 */
function renderWithLOD(perfManager, ctx, entities, camera) {
  const lodLevel = perfManager.stats.currentLOD;

  entities.forEach((entity) => {
    const screenX = entity.x - camera.x;
    const screenY = entity.y - camera.y;

    // Basic shape
    ctx.fillStyle = entity.color || '#ffffff';
    ctx.fillRect(screenX, screenY, entity.width, entity.height);

    // Conditionally render extra details based on LOD
    if (perfManager.shouldRenderEffect('shadow')) {
      // Shadow (LOD 0 only)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(screenX + 2, screenY + entity.height, entity.width, 3);
    }

    if (perfManager.shouldRenderEffect('glow')) {
      // Glow effect (LOD 0-1)
      ctx.shadowColor = entity.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(screenX, screenY, entity.width, entity.height);
      ctx.shadowBlur = 0;
    }
  });
}

/**
 * EXAMPLE 8: Batch Rendering
 */
function renderProjectilesBatched(ctx, projectiles, camera) {
  batchRender(ctx, projectiles, (ctx, projectile) => {
    const screenX = projectile.x - camera.x;
    const screenY = projectile.y - camera.y;
    ctx.fillRect(screenX, screenY, projectile.width, projectile.height);
  });
}

/**
 * EXAMPLE 9: Offscreen Canvas for Static Elements
 */
function createBackgroundCanvas(width, height) {
  return createOffscreenCanvas(width, height, (ctx) => {
    // Draw static background once
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#3d3d3d';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  });
}

function renderGame(ctx, backgroundCanvas, camera) {
  // Draw pre-rendered background
  ctx.drawImage(backgroundCanvas, -camera.x, -camera.y);

  // Draw dynamic elements
  // ...
}

/**
 * EXAMPLE 10: Main Game Loop Integration
 */
function gameLoop(perfManager, gameState, ctx, dt, fps) {
  // Update performance manager with current FPS
  perfManager.update(dt, fps);

  // Update spatial hash for collision detection
  perfManager.updateSpatialHash([
    ...gameState.enemies,
    ...gameState.projectiles,
  ]);

  // Update game logic
  updateProjectiles(perfManager, gameState.projectiles, dt);
  updateParticles(perfManager, gameState.particles, dt);
  updateEnemies(perfManager, gameState.enemies, gameState.player, gameState.camera, dt);

  // Check collisions using spatial partitioning
  checkCollisions(perfManager, gameState.projectiles, gameState.enemies);

  // Render with culling
  const visibleEnemies = perfManager.cullForRendering(gameState.enemies, gameState.camera);
  const visibleProjectiles = perfManager.cullForRendering(
    gameState.projectiles,
    gameState.camera
  );

  // Render entities
  renderEntities(perfManager, ctx, visibleEnemies, gameState.camera);
  renderProjectilesBatched(ctx, visibleProjectiles, gameState.camera);

  // Render particles with LOD
  if (perfManager.shouldRenderEffect('particles')) {
    renderParticles(perfManager, ctx, gameState.particles, gameState.camera);
  }

  // Display performance stats (debug)
  displayStats(ctx, perfManager);
}

function renderParticles(perfManager, ctx, particles, camera) {
  const detailLevel = perfManager.getParticleDetailLevel();

  particles.forEach((particle, index) => {
    // Skip particles based on detail level
    if (Math.random() > detailLevel) return;

    const screenX = particle.x - camera.x;
    const screenY = particle.y - camera.y;

    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = particle.color;
    ctx.fillRect(screenX, screenY, particle.size, particle.size);
  });

  ctx.globalAlpha = 1;
}

function displayStats(ctx, perfManager) {
  const stats = perfManager.getStats();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(10, 10, 300, 200);

  ctx.fillStyle = '#ffffff';
  ctx.font = '14px monospace';
  let y = 30;

  ctx.fillText(`FPS: ${stats.averageFPS}`, 20, y);
  y += 20;
  ctx.fillText(`LOD Level: ${stats.currentLOD}`, 20, y);
  y += 20;
  ctx.fillText(`Projectiles (pooled): ${stats.pooledProjectiles}`, 20, y);
  y += 20;
  ctx.fillText(`Particles (pooled): ${stats.pooledParticles}`, 20, y);
  y += 20;
  ctx.fillText(`Enemies (pooled): ${stats.pooledEnemies}`, 20, y);
  y += 20;
  ctx.fillText(`Spatial Hash Cells: ${stats.spatialHashCells}`, 20, y);
  y += 20;
  ctx.fillText(`Rendered: ${stats.entitiesRendered}`, 20, y);
  y += 20;
  ctx.fillText(`Culled: ${stats.entitiesCulled}`, 20, y);
}

/**
 * EXAMPLE 11: React Integration
 */
function GameWithPerformance() {
  const [perfManager] = useState(() => new PerformanceManager(1920, 1080));
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = 0;

    function animate(currentTime) {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update FPS counter
      frameCount++;
      fpsTime += dt;
      if (fpsTime >= 1) {
        setFps(frameCount);
        frameCount = 0;
        fpsTime = 0;
      }

      // Update performance manager
      perfManager.update(dt, fps);

      // Game loop here...

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [perfManager, fps]);

  return (
    <div>
      <canvas ref={canvasRef} />
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        FPS: {fps} | LOD: {perfManager.stats.currentLOD}
      </div>
    </div>
  );
}

export {
  initializeGame,
  createProjectile,
  updateProjectiles,
  createExplosion,
  updateParticles,
  checkCollisions,
  renderEntities,
  updateEnemies,
  renderWithLOD,
  renderProjectilesBatched,
  createBackgroundCanvas,
  gameLoop,
  displayStats,
  GameWithPerformance,
};
