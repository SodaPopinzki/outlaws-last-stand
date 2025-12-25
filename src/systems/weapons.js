import { WEAPONS } from '../data/weapons';
import { fireWeapon } from './spawning';
import { angle } from '../utils/math';

/**
 * Weapon manager class
 */
export class WeaponSystem {
  constructor() {
    this.currentWeapon = WEAPONS.REVOLVER;
    this.lastFireTime = 0;
    this.canFire = true;
  }

  setWeapon(weaponId) {
    if (WEAPONS[weaponId.toUpperCase()]) {
      this.currentWeapon = WEAPONS[weaponId.toUpperCase()];
    }
  }

  update(deltaTime) {
    if (!this.canFire) {
      this.lastFireTime += deltaTime;
      if (this.lastFireTime >= this.currentWeapon.fireRate) {
        this.canFire = true;
        this.lastFireTime = 0;
      }
    }
  }

  fire(playerX, playerY, targetX, targetY) {
    if (!this.canFire) {
      return [];
    }

    const fireAngle = angle(playerX, playerY, targetX, targetY);
    const projectiles = fireWeapon(
      playerX,
      playerY,
      fireAngle,
      this.currentWeapon
    );

    this.canFire = false;
    this.lastFireTime = 0;

    return projectiles;
  }

  canFireNow() {
    return this.canFire;
  }

  getCurrentWeapon() {
    return this.currentWeapon;
  }
}
