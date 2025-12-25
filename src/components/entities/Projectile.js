// Projectile entity rendering and logic

/**
 * Render projectile on canvas
 */
export function renderProjectile(ctx, projectile) {
  ctx.save();

  // Draw projectile
  ctx.fillStyle = projectile.color || '#FFD700';
  ctx.beginPath();
  ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
  ctx.fill();

  // Add glow effect
  ctx.shadowBlur = 10;
  ctx.shadowColor = projectile.color || '#FFD700';
  ctx.fill();

  // Draw outline for enemy projectiles
  if (projectile.isEnemyProjectile) {
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Update projectile position
 */
export function updateProjectile(projectile, deltaTime) {
  const newX = projectile.x + projectile.vx * deltaTime;
  const newY = projectile.y + projectile.vy * deltaTime;

  const distance = Math.sqrt(
    Math.pow(projectile.vx * deltaTime, 2) +
    Math.pow(projectile.vy * deltaTime, 2)
  );

  return {
    ...projectile,
    x: newX,
    y: newY,
    distanceTraveled: projectile.distanceTraveled + distance,
  };
}

/**
 * Check if projectile has exceeded its range
 */
export function isProjectileExpired(projectile) {
  return projectile.distanceTraveled >= projectile.range;
}
