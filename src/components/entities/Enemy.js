import { angle, normalize } from '../../utils/math';

/**
 * Render enemy on canvas
 */
export function renderEnemy(ctx, enemy) {
  ctx.save();

  // Draw enemy circle
  ctx.fillStyle = enemy.color || '#8B4513';
  ctx.beginPath();
  ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
  ctx.fill();

  // Draw enemy outline
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw health bar
  const barWidth = enemy.size * 2;
  const barHeight = 4;
  const barX = enemy.x - barWidth / 2;
  const barY = enemy.y - enemy.size - 10;
  const healthPercent = enemy.health / enemy.maxHealth;

  // Background
  ctx.fillStyle = '#333333';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Health
  ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
  ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

  ctx.restore();
}

/**
 * Update enemy AI and movement
 */
export function updateEnemy(enemy, targetX, targetY, deltaTime) {
  // Calculate direction to target
  const dx = targetX - enemy.x;
  const dy = targetY - enemy.y;
  const { x: dirX, y: dirY } = normalize(dx, dy);

  // Move towards target
  const newX = enemy.x + dirX * enemy.speed;
  const newY = enemy.y + dirY * enemy.speed;

  return {
    ...enemy,
    x: newX,
    y: newY,
    vx: dirX * enemy.speed,
    vy: dirY * enemy.speed,
  };
}

/**
 * Damage enemy
 */
export function damageEnemy(enemy, damage) {
  const newHealth = Math.max(0, enemy.health - damage);
  return {
    ...enemy,
    health: newHealth,
  };
}

/**
 * Check if enemy is dead
 */
export function isEnemyDead(enemy) {
  return enemy.health <= 0;
}

/**
 * Get angle from enemy to target
 */
export function getEnemyAimAngle(enemy, targetX, targetY) {
  return angle(enemy.x, enemy.y, targetX, targetY);
}
