import { generateId } from '../utils/random';
import { randomEdgePosition } from '../utils/random';
import { getEnemyForWave } from '../data/enemies';

/**
 * Create a new enemy entity
 */
export function spawnEnemy(wave, canvasWidth, canvasHeight) {
  const enemyType = getEnemyForWave(wave);
  const position = randomEdgePosition(canvasWidth, canvasHeight);

  return {
    id: generateId(),
    ...enemyType,
    x: position.x,
    y: position.y,
    vx: 0,
    vy: 0,
    targetX: canvasWidth / 2,
    targetY: canvasHeight / 2,
    lastFireTime: 0,
  };
}

/**
 * Spawn a wave of enemies
 */
export function spawnWave(wave, count, canvasWidth, canvasHeight) {
  const enemies = [];
  for (let i = 0; i < count; i++) {
    enemies.push(spawnEnemy(wave, canvasWidth, canvasHeight));
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
