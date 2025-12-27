// Projectile entity rendering and logic

/**
 * Render projectile with trail effect
 */
export function renderProjectile(ctx, projectile) {
  ctx.save();

  const x = projectile.x;
  const y = projectile.y;
  const size = projectile.size || 4;
  const angle = Math.atan2(projectile.vy, projectile.vx);

  // Motion trail
  const trailLength = 15;
  const trailGradient = ctx.createLinearGradient(
    x - Math.cos(angle) * trailLength,
    y - Math.sin(angle) * trailLength,
    x,
    y
  );

  if (projectile.isEnemyProjectile) {
    // Enemy projectiles - red trail
    trailGradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
    trailGradient.addColorStop(1, 'rgba(255, 69, 0, 0.8)');
  } else {
    // Player projectiles - golden trail
    trailGradient.addColorStop(0, 'rgba(255, 215, 0, 0)');
    trailGradient.addColorStop(1, 'rgba(255, 215, 0, 0.9)');
  }

  // Draw trail
  ctx.strokeStyle = trailGradient;
  ctx.lineWidth = size * 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - Math.cos(angle) * trailLength, y - Math.sin(angle) * trailLength);
  ctx.lineTo(x, y);
  ctx.stroke();

  // Draw projectile body (elongated bullet shape)
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  if (projectile.isEnemyProjectile) {
    // Enemy bullet - red/orange
    ctx.fillStyle = '#FF4500';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#FF0000';
  } else {
    // Player bullet - golden
    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FFA500';
  }

  // Elongated oval (bullet shape)
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 2, size, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bright tip
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(size * 1.5, 0, size * 0.5, size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Glow halo
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = projectile.isEnemyProjectile ? '#FF4500' : '#FFD700';
  ctx.beginPath();
  ctx.arc(x, y, size * 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Update projectile position
 */
export function updateProjectile(projectile, deltaTime) {
  // Projectiles should move at a good visible speed
  const speed = 400; // pixels per second
  const vx = projectile.vx || Math.cos(projectile.angle || 0) * speed;
  const vy = projectile.vy || Math.sin(projectile.angle || 0) * speed;

  const newX = projectile.x + vx * deltaTime;
  const newY = projectile.y + vy * deltaTime;

  const distance = Math.sqrt(
    Math.pow(vx * deltaTime, 2) +
    Math.pow(vy * deltaTime, 2)
  );

  return {
    ...projectile,
    x: newX,
    y: newY,
    vx,
    vy,
    distanceTraveled: (projectile.distanceTraveled || 0) + distance,
  };
}

/**
 * Check if projectile has exceeded its range
 */
export function isProjectileExpired(projectile) {
  const range = projectile.range || 600;
  return (projectile.distanceTraveled || 0) >= range;
}
