import { WEAPONS } from '../data/weapons';
import { fireWeapon } from './spawning';
import { angle } from '../utils/math';

/**
 * Find the nearest enemy to the player
 */
function findNearestEnemy(playerX, playerY, enemies) {
  if (!enemies || enemies.length === 0) {
    return null;
  }

  let nearest = null;
  let minDistance = Infinity;

  for (const enemy of enemies) {
    const dx = enemy.x - playerX;
    const dy = enemy.y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = enemy;
    }
  }

  return nearest;
}

/**
 * Weapon manager class
 */
export class WeaponSystem {
  constructor() {
    this.currentWeapon = WEAPONS.SIX_SHOOTER;
    this.fireTimer = 0;
  }

  setWeapon(weaponId) {
    if (WEAPONS[weaponId.toUpperCase()]) {
      this.currentWeapon = WEAPONS[weaponId.toUpperCase()];
    }
  }

  update(deltaTime, playerX, playerY, enemies) {
    // Decrease fire timer
    this.fireTimer -= deltaTime;

    // Auto-fire when timer reaches 0
    if (this.fireTimer <= 0) {
      const nearestEnemy = findNearestEnemy(playerX, playerY, enemies);

      if (nearestEnemy) {
        const fireAngle = angle(playerX, playerY, nearestEnemy.x, nearestEnemy.y);
        const projectiles = fireWeapon(
          playerX,
          playerY,
          fireAngle,
          this.currentWeapon
        );

        // Reset timer to weapon's cooldown
        this.fireTimer = this.currentWeapon.baseCooldown;

        return projectiles;
      }
    }

    return [];
  }

  fire(playerX, playerY, targetX, targetY) {
    // Manual fire (for user clicking)
    const fireAngle = angle(playerX, playerY, targetX, targetY);
    const projectiles = fireWeapon(
      playerX,
      playerY,
      fireAngle,
      this.currentWeapon
    );

    this.fireTimer = this.currentWeapon.baseCooldown;
    return projectiles;
  }

  getCurrentWeapon() {
    return this.currentWeapon;
  }
}
