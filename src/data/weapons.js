// Weapon definitions for Outlaw's Last Stand

// Weapon types
export const WEAPON_TYPES = {
  PROJECTILE: 'projectile',     // Standard bullets
  EXPLOSIVE: 'explosive',        // Area damage
  MELEE: 'melee',               // Close range
  SPECIAL: 'special',           // Unique mechanics
  POISON: 'poison',             // Damage over time
};

// All weapon definitions
export const WEAPONS = {
  // ========== CHARACTER STARTING WEAPONS ==========

  SIX_SHOOTER: {
    id: 'six_shooter',
    name: 'Six-Shooter',
    description: 'Classic revolver. Reliable and balanced.',
    type: WEAPON_TYPES.PROJECTILE,

    damage: 25,
    fireRate: 0.4,              // 2.5 shots/sec
    projectileSpeed: 800,
    projectileSize: 4,
    piercing: false,
    spread: 0,
    projectileCount: 1,
    range: 600,
    knockback: 5,

    color: '#FFD700',           // Gold
    trailColor: '#FFA500',

    rarity: 'common',
    level: 1,
    maxLevel: 8,
  },

  SAWED_OFF: {
    id: 'sawed_off',
    name: 'Sawed-Off Shotgun',
    description: 'Devastating close-range spread weapon.',
    type: WEAPON_TYPES.PROJECTILE,

    damage: 18,
    fireRate: 0.7,              // 1.43 shots/sec
    projectileSpeed: 650,
    projectileSize: 3,
    piercing: false,
    spread: 0.4,                // Wide spread
    projectileCount: 6,
    range: 350,
    knockback: 15,

    color: '#FF6347',           // Tomato red
    trailColor: '#FF4500',

    rarity: 'common',
    level: 1,
    maxLevel: 8,
  },

  DEPUTY_STAR: {
    id: 'deputy_star',
    name: 'Deputy Star',
    description: 'Throws a spinning star badge that returns.',
    type: WEAPON_TYPES.SPECIAL,

    damage: 30,
    fireRate: 0.5,
    projectileSpeed: 600,
    projectileSize: 8,
    piercing: true,
    spread: 0,
    projectileCount: 1,
    range: 450,
    knockback: 8,

    // Special properties
    returns: true,              // Boomerang effect
    spinSpeed: 360,             // Degrees per second

    color: '#C0C0C0',           // Silver
    trailColor: '#FFD700',

    rarity: 'uncommon',
    level: 1,
    maxLevel: 8,
  },

  DYNAMITE: {
    id: 'dynamite',
    name: 'Dynamite',
    description: 'Explosive with area damage and knockback.',
    type: WEAPON_TYPES.EXPLOSIVE,

    damage: 50,
    fireRate: 1.2,              // Slow
    projectileSpeed: 400,
    projectileSize: 6,
    piercing: false,
    spread: 0.15,
    projectileCount: 1,
    range: 300,
    knockback: 25,

    // Explosive properties
    explosionRadius: 80,
    explosionDamage: 40,
    fuseTime: 0.8,              // Seconds before explosion

    color: '#8B0000',           // Dark red
    trailColor: '#FF4500',

    rarity: 'uncommon',
    level: 1,
    maxLevel: 8,
  },

  SNAKE_OIL: {
    id: 'snake_oil',
    name: 'Snake Oil',
    description: 'Poison vials that create toxic puddles.',
    type: WEAPON_TYPES.POISON,

    damage: 15,                 // Initial hit
    fireRate: 0.6,
    projectileSpeed: 500,
    projectileSize: 5,
    piercing: false,
    spread: 0.2,
    projectileCount: 3,
    range: 400,
    knockback: 3,

    // Poison properties
    poisonDamage: 10,           // Damage per second
    poisonDuration: 3,          // Seconds
    puddleRadius: 40,
    puddleLifetime: 5,

    color: '#228B22',           // Forest green
    trailColor: '#32CD32',

    rarity: 'uncommon',
    level: 1,
    maxLevel: 8,
  },

  HORSE_CHARGE: {
    id: 'horse_charge',
    name: 'Horse Charge',
    description: 'Charge forward trampling enemies.',
    type: WEAPON_TYPES.MELEE,

    damage: 60,
    fireRate: 3.0,              // Long cooldown
    projectileSpeed: 0,         // Not a projectile
    projectileSize: 0,
    piercing: true,             // Goes through enemies
    spread: 0,
    projectileCount: 0,
    range: 200,                 // Charge distance
    knockback: 30,

    // Charge properties
    chargeDuration: 0.5,
    chargeSpeed: 600,
    invulnerable: true,         // Player invulnerable during charge

    color: '#8B4513',           // Saddle brown
    trailColor: '#FFD700',

    rarity: 'rare',
    level: 1,
    maxLevel: 8,
  },

  GATLING_GUN: {
    id: 'gatling_gun',
    name: 'Gatling Gun',
    description: 'Rapid-fire machine gun with spinup time.',
    type: WEAPON_TYPES.PROJECTILE,

    damage: 12,
    fireRate: 0.08,             // 12.5 shots/sec when spun up
    projectileSpeed: 900,
    projectileSize: 3,
    piercing: false,
    spread: 0.25,               // Inaccurate
    projectileCount: 1,
    range: 550,
    knockback: 2,

    // Gatling properties
    spinupTime: 0.5,            // Seconds to reach max fire rate
    currentSpin: 0,             // Current spin level (0-1)

    color: '#C0C0C0',           // Silver
    trailColor: '#FFA500',

    rarity: 'rare',
    level: 1,
    maxLevel: 8,
  },

  LASSO: {
    id: 'lasso',
    name: 'Lasso',
    description: 'Rope that pulls and slows enemies.',
    type: WEAPON_TYPES.SPECIAL,

    damage: 20,
    fireRate: 0.8,
    projectileSpeed: 700,
    projectileSize: 6,
    piercing: false,
    spread: 0,
    projectileCount: 1,
    range: 500,
    knockback: 0,               // Negative knockback (pulls)

    // Lasso properties
    pullStrength: -50,          // Pulls enemies toward player
    slowAmount: 0.5,            // 50% slow
    slowDuration: 2,
    rootDuration: 0.5,          // Brief stun on hit

    color: '#8B4513',           // Saddle brown
    trailColor: '#D2691E',

    rarity: 'rare',
    level: 1,
    maxLevel: 8,
  },

  // ========== ADDITIONAL UNLOCKABLE WEAPONS ==========

  REVOLVER: {
    id: 'revolver',
    name: 'Revolver',
    description: 'Standard issue sidearm.',
    type: WEAPON_TYPES.PROJECTILE,

    damage: 25,
    fireRate: 0.4,
    projectileSpeed: 800,
    projectileSize: 4,
    piercing: false,
    spread: 0,
    projectileCount: 1,
    range: 600,
    knockback: 5,

    color: '#FFD700',
    trailColor: '#FFA500',

    rarity: 'common',
    level: 1,
    maxLevel: 8,
  },

  RIFLE: {
    id: 'rifle',
    name: 'Rifle',
    description: 'Long-range precision weapon.',
    type: WEAPON_TYPES.PROJECTILE,

    damage: 45,
    fireRate: 0.6,
    projectileSpeed: 1200,
    projectileSize: 3,
    piercing: true,
    spread: 0,
    projectileCount: 1,
    range: 900,
    knockback: 10,

    color: '#87CEEB',
    trailColor: '#4682B4',

    rarity: 'uncommon',
    level: 1,
    maxLevel: 8,
  },

  DUAL_PISTOLS: {
    id: 'dual_pistols',
    name: 'Dual Pistols',
    description: 'Two guns, twice the fun.',
    type: WEAPON_TYPES.PROJECTILE,

    damage: 20,
    fireRate: 0.25,
    projectileSpeed: 750,
    projectileSize: 4,
    piercing: false,
    spread: 0.1,
    projectileCount: 2,
    range: 600,
    knockback: 5,

    color: '#FFA500',
    trailColor: '#FF8C00',

    rarity: 'uncommon',
    level: 1,
    maxLevel: 8,
  },

  WINCHESTER: {
    id: 'winchester',
    name: 'Winchester Rifle',
    description: 'Lever-action rifle with good fire rate.',
    type: WEAPON_TYPES.PROJECTILE,

    damage: 35,
    fireRate: 0.35,
    projectileSpeed: 1000,
    projectileSize: 3,
    piercing: true,
    spread: 0,
    projectileCount: 1,
    range: 800,
    knockback: 8,

    color: '#CD853F',
    trailColor: '#DAA520',

    rarity: 'uncommon',
    level: 1,
    maxLevel: 8,
  },

  TOMAHAWK: {
    id: 'tomahawk',
    name: 'Tomahawk',
    description: 'Spinning axe that pierces enemies.',
    type: WEAPON_TYPES.SPECIAL,

    damage: 40,
    fireRate: 0.55,
    projectileSpeed: 600,
    projectileSize: 7,
    piercing: true,
    spread: 0,
    projectileCount: 1,
    range: 500,
    knockback: 12,

    spinSpeed: 720,

    color: '#8B4513',
    trailColor: '#A0522D',

    rarity: 'rare',
    level: 1,
    maxLevel: 8,
  },

  MOLOTOV: {
    id: 'molotov',
    name: 'Molotov Cocktail',
    description: 'Fire bomb that creates burning ground.',
    type: WEAPON_TYPES.EXPLOSIVE,

    damage: 30,
    fireRate: 1.0,
    projectileSpeed: 450,
    projectileSize: 5,
    piercing: false,
    spread: 0.1,
    projectileCount: 1,
    range: 350,
    knockback: 5,

    explosionRadius: 70,
    explosionDamage: 25,
    burnDamage: 8,
    burnDuration: 4,
    fireRadius: 60,
    fireLifetime: 6,

    color: '#FF4500',
    trailColor: '#FF6347',

    rarity: 'rare',
    level: 1,
    maxLevel: 8,
  },

  CROSSBOW: {
    id: 'crossbow',
    name: 'Crossbow',
    description: 'Silent and deadly bolts.',
    type: WEAPON_TYPES.PROJECTILE,

    damage: 55,
    fireRate: 0.9,
    projectileSpeed: 1100,
    projectileSize: 4,
    piercing: true,
    spread: 0,
    projectileCount: 1,
    range: 850,
    knockback: 15,

    critChance: 0.15,

    color: '#696969',
    trailColor: '#A9A9A9',

    rarity: 'rare',
    level: 1,
    maxLevel: 8,
  },

  PEACEMAKER: {
    id: 'peacemaker',
    name: 'Peacemaker',
    description: 'Legendary revolver with high damage.',
    type: WEAPON_TYPES.PROJECTILE,

    damage: 65,
    fireRate: 0.5,
    projectileSpeed: 950,
    projectileSize: 5,
    piercing: true,
    spread: 0,
    projectileCount: 1,
    range: 700,
    knockback: 20,

    critChance: 0.2,

    color: '#FFD700',
    trailColor: '#FFA500',

    rarity: 'legendary',
    level: 1,
    maxLevel: 8,
  },
};

// Default weapon
export const DEFAULT_WEAPON = WEAPONS.SIX_SHOOTER;

// Get weapon by ID
export function getWeaponById(id) {
  const weaponKey = Object.keys(WEAPONS).find(
    (key) => WEAPONS[key].id === id
  );
  return weaponKey ? WEAPONS[weaponKey] : DEFAULT_WEAPON;
}

// Get all weapons as array
export function getAllWeapons() {
  return Object.values(WEAPONS);
}

// Get weapons by rarity
export function getWeaponsByRarity(rarity) {
  return getAllWeapons().filter((weapon) => weapon.rarity === rarity);
}

// Get weapons by type
export function getWeaponsByType(type) {
  return getAllWeapons().filter((weapon) => weapon.type === type);
}

// Calculate weapon DPS (damage per second)
export function calculateDPS(weapon) {
  const shotsPerSecond = 1 / weapon.fireRate;
  const damagePerShot = weapon.damage * weapon.projectileCount;
  return damagePerShot * shotsPerSecond;
}

// Apply level scaling to weapon
export function scaleWeapon(weapon, level) {
  const levelMultiplier = 1 + (level - 1) * 0.2; // 20% per level

  return {
    ...weapon,
    level,
    damage: Math.floor(weapon.damage * levelMultiplier),
    // Special weapons may have additional scaling
    explosionDamage: weapon.explosionDamage
      ? Math.floor(weapon.explosionDamage * levelMultiplier)
      : undefined,
    poisonDamage: weapon.poisonDamage
      ? Math.floor(weapon.poisonDamage * levelMultiplier)
      : undefined,
  };
}

// Check if weapon can be upgraded
export function canUpgradeWeapon(weapon) {
  return weapon.level < weapon.maxLevel;
}

// Get upgrade cost
export function getUpgradeCost(weapon) {
  return Math.floor(100 * Math.pow(1.5, weapon.level - 1));
}

// Get weapon info for display
export function getWeaponDisplayInfo(weapon) {
  const dps = calculateDPS(weapon);

  return {
    name: weapon.name,
    description: weapon.description,
    type: weapon.type,
    rarity: weapon.rarity,
    level: weapon.level,
    stats: {
      damage: weapon.damage,
      fireRate: `${(1 / weapon.fireRate).toFixed(1)}/sec`,
      dps: Math.floor(dps),
      range: weapon.range,
      projectiles: weapon.projectileCount,
    },
    special: getSpecialProperties(weapon),
  };
}

// Get special properties for display
function getSpecialProperties(weapon) {
  const special = [];

  if (weapon.piercing) special.push('Piercing');
  if (weapon.returns) special.push('Returns');
  if (weapon.explosionRadius) special.push(`Explosion: ${weapon.explosionRadius}px`);
  if (weapon.poisonDamage) special.push(`Poison: ${weapon.poisonDamage}/sec`);
  if (weapon.critChance) special.push(`Crit: ${weapon.critChance * 100}%`);
  if (weapon.slowAmount) special.push(`Slow: ${weapon.slowAmount * 100}%`);

  return special;
}
