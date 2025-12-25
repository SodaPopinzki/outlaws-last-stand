import { circleCollision } from '../utils/math';

/**
 * Check collision between projectile and enemies
 */
export function checkProjectileEnemyCollisions(projectiles, enemies) {
  const hits = [];

  projectiles.forEach((projectile) => {
    enemies.forEach((enemy) => {
      if (
        circleCollision(
          projectile.x,
          projectile.y,
          projectile.size,
          enemy.x,
          enemy.y,
          enemy.size
        )
      ) {
        hits.push({
          projectileId: projectile.id,
          enemyId: enemy.id,
          damage: projectile.damage,
          piercing: projectile.piercing,
        });
      }
    });
  });

  return hits;
}

/**
 * Check collision between player and enemies
 */
export function checkPlayerEnemyCollisions(player, enemies) {
  const hits = [];

  enemies.forEach((enemy) => {
    if (
      circleCollision(
        player.x,
        player.y,
        player.size,
        enemy.x,
        enemy.y,
        enemy.size
      )
    ) {
      hits.push({
        enemyId: enemy.id,
        damage: enemy.damage,
      });
    }
  });

  return hits;
}

/**
 * Check collision between player and enemy projectiles
 */
export function checkPlayerProjectileCollisions(player, projectiles) {
  const hits = [];

  projectiles.forEach((projectile) => {
    if (
      projectile.isEnemyProjectile &&
      circleCollision(
        player.x,
        player.y,
        player.size,
        projectile.x,
        projectile.y,
        projectile.size
      )
    ) {
      hits.push({
        projectileId: projectile.id,
        damage: projectile.damage,
      });
    }
  });

  return hits;
}

/**
 * Check if entity is out of bounds
 */
export function isOutOfBounds(entity, width, height, margin = 100) {
  return (
    entity.x < -margin ||
    entity.x > width + margin ||
    entity.y < -margin ||
    entity.y > height + margin
  );
}
