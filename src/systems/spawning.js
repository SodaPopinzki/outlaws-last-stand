import { generateId } from '../utils/random';
import { randomEdgePosition } from '../utils/random';
import { selectRandomEnemy, createEnemyInstance } from '../data/enemies';

/**
 * Create a new enemy entity
 */
export function spawnEnemy(wave, canvasWidth, canvasHeight, playerX = 400, playerY = 300) {
  const enemyType = selectRandomEnemy(wave);

  // Keep trying until we find a position far from player
  let position;
  let attempts = 0;
  const minDistanceFromPlayer = 400; // Never spawn within 400px of player

  do {
    position = randomEdgePosition(canvasWidth, canvasHeight);
    const dx = position.x - playerX;
    const dy = position.y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= minDistanceFromPlayer) {
      break;
    }
    attempts++;
  } while (attempts < 10);

  return createEnemyInstance(enemyType, wave, position.x, position.y);
}

/**
 * Spawn a wave of enemies
 */
export function spawnWave(wave, count, canvasWidth, canvasHeight, playerX = 400, playerY = 300) {
  const enemies = [];
  for (let i = 0; i < count; i++) {
    enemies.push(spawnEnemy(wave, canvasWidth, canvasHeight, playerX, playerY));
  }
  return enemies;
}

/**
 * Create a projectile
 */
export function createProjectile(
  x,
  y,
  angle,
  weapon,
  isEnemyProjectile = false
) {
  const vx = Math.cos(angle) * weapon.projectileSpeed;
  const vy = Math.sin(angle) * weapon.projectileSpeed;

  return {
    id: generateId(),
    x,
    y,
    vx,
    vy,
    size: weapon.projectileSize,
    damage: weapon.damage,
    piercing: weapon.piercing,
    range: weapon.range,
    distanceTraveled: 0,
    color: weapon.color,
    isEnemyProjectile,
  };
}

/**
 * Fire weapon and create projectiles
 */
export function fireWeapon(x, y, angle, weapon) {
  const projectiles = [];
  const { projectileCount, spread } = weapon;

  if (projectileCount === 1) {
    projectiles.push(createProjectile(x, y, angle, weapon));
  } else {
    // Multi-projectile weapons (shotgun, dual pistols)
    const spreadAngle = spread / (projectileCount - 1);
    const startAngle = angle - spread / 2;

    for (let i = 0; i < projectileCount; i++) {
      const projAngle = startAngle + spreadAngle * i;
      projectiles.push(createProjectile(x, y, projAngle, weapon));
    }
  }

  return projectiles;
}
