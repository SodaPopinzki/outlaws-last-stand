import { angle, normalize } from '../../utils/math';

/**
 * Render enemy with distinct design based on type
 */
export function renderEnemy(ctx, enemy) {
  ctx.save();

  const x = enemy.x;
  const y = enemy.y;
  const size = enemy.size || 14;
  const type = enemy.type || 'BANDIT';

  // Damaged flash effect
  if (enemy.justHit) {
    ctx.globalAlpha = 0.7;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FF0000';
  }

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x, y + size, size * 0.7, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw enemy based on type
  switch(type.toUpperCase()) {
    case 'BANDIT':
      renderBandit(ctx, x, y, size);
      break;
    case 'RUSTLER':
      renderRustler(ctx, x, y, size);
      break;
    case 'DESPERADO':
      renderDesperado(ctx, x, y, size);
      break;
    case 'SHERIFF':
      renderSheriff(ctx, x, y, size);
      break;
    case 'GUNSLINGER':
      renderGunslinger(ctx, x, y, size);
      break;
    case 'OUTLAW':
      renderOutlaw(ctx, x, y, size);
      break;
    default:
      // Default bandit
      renderBandit(ctx, x, y, size);
  }

  // Health bar
  const healthPercent = enemy.health / enemy.maxHealth;
  if (healthPercent < 1.0) {
    const barWidth = size * 2;
    const barHeight = 4;
    const barX = x - barWidth / 2;
    const barY = y - size - 8;

    // Background
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health
    const healthColor = healthPercent > 0.6 ? '#00FF00' :
                       healthPercent > 0.3 ? '#FFFF00' : '#FF0000';
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }

  ctx.restore();
}

/**
 * BANDIT - Basic enemy (brown body, red bandana, small hat)
 */
function renderBandit(ctx, x, y, size) {
  // Body
  ctx.fillStyle = '#8B4513'; // Saddle brown
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Red bandana over face
  ctx.fillStyle = '#DC143C';
  ctx.fillRect(x - size * 0.5, y - 2, size, 4);

  // Eyes above bandana
  ctx.fillStyle = '#000000';
  ctx.fillRect(x - 4, y - 6, 2, 2);
  ctx.fillRect(x + 2, y - 6, 2, 2);

  // Small hat
  ctx.fillStyle = '#654321';
  ctx.fillRect(x - 6, y - size * 0.8, 12, 3);
  ctx.fillRect(x - 4, y - size * 0.9, 8, 4);
}

/**
 * RUSTLER - Fast enemy (darker brown, rope coil)
 */
function renderRustler(ctx, x, y, size) {
  // Body (darker)
  ctx.fillStyle = '#654321';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Rope coil on side
  ctx.strokeStyle = '#D2B48C';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + size * 0.6, y, 4, 0, Math.PI * 2);
  ctx.stroke();

  // Face
  ctx.fillStyle = '#FFDBAC';
  ctx.beginPath();
  ctx.arc(x, y - 2, 5, 0, Math.PI * 2);
  ctx.fill();

  // Bandana
  ctx.fillStyle = '#FF8C00';
  ctx.fillRect(x - 4, y + 1, 8, 3);
}

/**
 * DESPERADO - Tough enemy (black coat, two guns, larger hat)
 */
function renderDesperado(ctx, x, y, size) {
  // Black coat
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.8, size, 0, 0, Math.PI * 2);
  ctx.fill();

  // Two guns
  ctx.fillStyle = '#C0C0C0';
  // Left gun
  ctx.fillRect(x - size * 0.9, y + 2, 5, 2);
  // Right gun
  ctx.fillRect(x + size * 0.4, y + 2, 5, 2);

  // Face
  ctx.fillStyle = '#FFDBAC';
  ctx.beginPath();
  ctx.arc(x, y - 4, 6, 0, Math.PI * 2);
  ctx.fill();

  // Large hat
  ctx.fillStyle = '#000000';
  ctx.fillRect(x - 10, y - size - 2, 20, 3);
  ctx.fillRect(x - 6, y - size - 6, 12, 5);

  // Mustache
  ctx.fillStyle = '#000000';
  ctx.fillRect(x - 6, y - 1, 5, 2);
  ctx.fillRect(x + 1, y - 1, 5, 2);
}

/**
 * SHERIFF - Tank enemy (star badge, blue uniform, big hat)
 */
function renderSheriff(ctx, x, y, size) {
  // Blue uniform
  ctx.fillStyle = '#4169E1';
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.9, size * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Star badge
  drawStar(ctx, x, y + 4, 6, '#FFD700');

  // Face
  ctx.fillStyle = '#FFDBAC';
  ctx.beginPath();
  ctx.arc(x, y - 6, 7, 0, Math.PI * 2);
  ctx.fill();

  // Big hat
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(x - 12, y - size - 4, 24, 4);
  ctx.fillRect(x - 8, y - size - 10, 16, 7);
}

/**
 * GUNSLINGER - Medium enemy
 */
function renderGunslinger(ctx, x, y, size) {
  // Gray duster coat
  ctx.fillStyle = '#696969';
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.75, size * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();

  // Single gun (quick draw)
  ctx.fillStyle = '#2F4F4F';
  ctx.fillRect(x + size * 0.5, y, 6, 3);

  // Face
  ctx.fillStyle = '#FFDBAC';
  ctx.beginPath();
  ctx.arc(x, y - 3, 5, 0, Math.PI * 2);
  ctx.fill();

  // Black hat
  ctx.fillStyle = '#000000';
  ctx.fillRect(x - 8, y - size * 0.7, 16, 2);
  ctx.fillRect(x - 5, y - size * 0.85, 10, 5);
}

/**
 * OUTLAW - Aggressive enemy
 */
function renderOutlaw(ctx, x, y, size) {
  // Dark red vest
  ctx.fillStyle = '#8B0000';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Belt/holster
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y + 2, size * 0.6, 0, Math.PI);
  ctx.stroke();

  // Face (angry)
  ctx.fillStyle = '#FFDBAC';
  ctx.beginPath();
  ctx.arc(x, y - 3, 5, 0, Math.PI * 2);
  ctx.fill();

  // Hat
  ctx.fillStyle = '#654321';
  ctx.fillRect(x - 7, y - size * 0.75, 14, 3);
  ctx.fillRect(x - 5, y - size * 0.85, 10, 4);
}

/**
 * Helper: Draw a star
 */
function drawStar(ctx, cx, cy, radius, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? radius : radius / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
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

  // Enemy speed should be slower than player (around 1.5-2.5 px/frame)
  const speed = (enemy.speed || 2) * 0.5; // Reduce enemy speed

  // Move towards target
  const newX = enemy.x + dirX * speed;
  const newY = enemy.y + dirY * speed;

  return {
    ...enemy,
    x: newX,
    y: newY,
    vx: dirX * speed,
    vy: dirY * speed,
    justHit: false, // Clear hit flash
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
    justHit: true, // Trigger flash effect
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
