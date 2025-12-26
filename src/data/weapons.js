/**
 * Weapons System - Outlaw's Last Stand
 *
 * 15 weapons organized by category with level scaling and evolution paths
 */

// ========== WEAPON CATEGORIES ==========

export const WEAPON_CATEGORIES = {
  FIREARMS: 'firearms',
  EXPLOSIVES: 'explosives',
  MELEE_THROWN: 'melee_thrown',
  SPECIAL: 'special',
};

// ========== WEAPON TYPES ==========

export const WEAPON_TYPES = {
  BULLET: 'bullet',           // Standard projectile
  EXPLOSIVE: 'explosive',     // AOE damage
  ORBIT: 'orbit',            // Circles player
  GROUND: 'ground',          // Ground effect (fire pool, etc.)
  BOUNCE: 'bounce',          // Bounces between targets
  CHARGE: 'charge',          // Charge-up attack
  CLOUD: 'cloud',            // Poison/gas cloud
  DEBUFF: 'debuff',          // Status effect
};

// ========== WEAPON DEFINITIONS ==========

export const WEAPONS = {
  // ========== FIREARMS (5) ==========

  SIX_SHOOTER: {
    id: 'six_shooter',
    name: 'Six-Shooter',
    icon: '🔫',
    description: 'Fast revolver with reliable damage. The gunslinger\'s best friend.',
    category: WEAPON_CATEGORIES.FIREARMS,
    type: WEAPON_TYPES.BULLET,

    baseCooldown: 0.4,          // 2.5 shots/sec
    baseDamage: 25,
    baseProjectileCount: 1,
    baseProjectileSpeed: 800,
    range: 600,
    pierce: 0,
    spread: 0,

    scaling: {
      cooldown: 0.92,           // -8% per level
      damage: 1.2,              // +20% per level
      count: 0.5,               // +1 every 2 levels
      pierce: 0.33,             // +1 every 3 levels
    },

    maxLevel: 8,
    evolution: null,            // Base weapon

    color: '#FFD700',           // Gold
    trailColor: '#FFA500',      // Orange
  },

  SAWED_OFF: {
    id: 'sawed_off',
    name: 'Sawed-Off Shotgun',
    icon: '💥',
    description: 'Spread shot devastation at close range. When subtlety won\'t cut it.',
    category: WEAPON_CATEGORIES.FIREARMS,
    type: WEAPON_TYPES.BULLET,

    baseCooldown: 0.8,          // 1.25 shots/sec
    baseDamage: 18,
    baseProjectileCount: 6,
    baseProjectileSpeed: 650,
    range: 350,
    pierce: 0,
    spread: 0.4,                // Wide spread angle

    scaling: {
      cooldown: 0.92,
      damage: 1.15,             // +15% per level
      count: 0.25,              // +1 every 4 levels
      pierce: 0,                // No pierce
    },

    maxLevel: 8,
    evolution: {
      requires: 'bowie_knife',
      result: 'twin_barrels',   // Evolved weapon
    },

    color: '#FF6347',           // Tomato red
    trailColor: '#FF4500',      // Orange red
  },

  GATLING_GUN: {
    id: 'gatling_gun',
    name: 'Gatling Gun',
    icon: '⚙️',
    description: 'Rapid fire suppression. Accuracy through volume.',
    category: WEAPON_CATEGORIES.FIREARMS,
    type: WEAPON_TYPES.BULLET,

    baseCooldown: 0.15,         // 6.67 shots/sec
    baseDamage: 12,
    baseProjectileCount: 1,
    baseProjectileSpeed: 900,
    range: 500,
    pierce: 0,
    spread: 0.1,                // Slight spread

    scaling: {
      cooldown: 0.95,           // -5% per level
      damage: 1.18,             // +18% per level
      count: 0.25,              // +1 every 4 levels
      pierce: 0.5,              // +1 every 2 levels
    },

    maxLevel: 8,
    evolution: {
      requires: 'derringer',
      result: 'double_gatling',
    },

    color: '#708090',           // Slate gray
    trailColor: '#FFD700',
  },

  RIFLE: {
    id: 'rifle',
    name: 'Rifle',
    icon: '🎯',
    description: 'Long range precision. High damage, slow fire rate.',
    category: WEAPON_CATEGORIES.FIREARMS,
    type: WEAPON_TYPES.BULLET,

    baseCooldown: 1.2,          // 0.83 shots/sec
    baseDamage: 60,
    baseProjectileCount: 1,
    baseProjectileSpeed: 1200,
    range: 800,
    pierce: 1,
    spread: 0,

    scaling: {
      cooldown: 0.90,           // -10% per level
      damage: 1.25,             // +25% per level
      count: 0,                 // Single shot always
      pierce: 0.5,              // +1 every 2 levels
    },

    maxLevel: 8,
    evolution: {
      requires: 'wanted_poster',
      result: 'sharpshooter',
    },

    color: '#8B4513',           // Saddle brown
    trailColor: '#FFD700',
  },

  DERRINGER: {
    id: 'derringer',
    name: 'Derringer',
    icon: '🔫',
    description: 'Very fast, weak damage. Fires 2-shot burst.',
    category: WEAPON_CATEGORIES.FIREARMS,
    type: WEAPON_TYPES.BULLET,

    baseCooldown: 0.3,          // 3.33 shots/sec
    baseDamage: 15,
    baseProjectileCount: 2,     // 2-shot burst
    baseProjectileSpeed: 700,
    range: 400,
    pierce: 0,
    spread: 0.05,               // Tight burst spread

    scaling: {
      cooldown: 0.93,           // -7% per level
      damage: 1.22,             // +22% per level
      count: 0.5,               // +1 every 2 levels (burst size)
      pierce: 0.25,             // +1 every 4 levels
    },

    maxLevel: 8,
    evolution: null,

    color: '#C0C0C0',           // Silver
    trailColor: '#FFA500',
  },

  // ========== EXPLOSIVES (3) ==========

  DYNAMITE: {
    id: 'dynamite',
    name: 'Dynamite',
    icon: '🧨',
    description: 'Thrown explosive with massive AOE. Keep your distance.',
    category: WEAPON_CATEGORIES.EXPLOSIVES,
    type: WEAPON_TYPES.EXPLOSIVE,

    baseCooldown: 1.5,          // 0.67 shots/sec
    baseDamage: 80,
    baseProjectileCount: 1,
    baseProjectileSpeed: 400,
    range: 450,
    pierce: 999,                // Hits all in AOE
    spread: 0,

    // Explosive properties
    explosionRadius: 120,
    fuseTime: 0.8,              // Seconds before explosion

    scaling: {
      cooldown: 0.92,
      damage: 1.3,              // +30% per level
      count: 0.33,              // +1 every 3 levels
      pierce: 0,                // Already infinite
    },

    maxLevel: 8,
    evolution: {
      requires: 'powder_keg',
      result: 'mega_dynamite',
    },

    color: '#DC143C',           // Crimson
    trailColor: '#FF4500',
  },

  MOLOTOV_WHISKEY: {
    id: 'molotov_whiskey',
    name: 'Molotov Whiskey',
    icon: '🍾',
    description: 'Creates burning fire pool. Enemies take damage over time.',
    category: WEAPON_CATEGORIES.EXPLOSIVES,
    type: WEAPON_TYPES.GROUND,

    baseCooldown: 2.0,          // 0.5 shots/sec
    baseDamage: 20,             // Damage per tick
    baseProjectileCount: 1,
    baseProjectileSpeed: 350,
    range: 400,
    pierce: 999,                // Hits all in pool

    // Ground effect properties
    poolRadius: 100,
    poolDuration: 5.0,          // Seconds
    tickRate: 0.5,              // Damage every 0.5 seconds

    scaling: {
      cooldown: 0.90,
      damage: 1.25,             // +25% per level
      count: 0.5,               // +1 every 2 levels
      pierce: 0,
    },

    maxLevel: 8,
    evolution: {
      requires: 'snake_oil',
      result: 'hellfire_whiskey',
    },

    color: '#FF8C00',           // Dark orange
    trailColor: '#FFD700',
  },

  POWDER_KEG: {
    id: 'powder_keg',
    name: 'Powder Keg',
    icon: '🛢️',
    description: 'Rolling barrel that explodes on impact. Massive damage.',
    category: WEAPON_CATEGORIES.EXPLOSIVES,
    type: WEAPON_TYPES.EXPLOSIVE,

    baseCooldown: 3.0,          // 0.33 shots/sec
    baseDamage: 150,
    baseProjectileCount: 1,
    baseProjectileSpeed: 300,
    range: 600,
    pierce: 999,

    // Explosive properties
    explosionRadius: 180,       // Huge radius
    rollSpeed: 300,             // Rolls along ground

    scaling: {
      cooldown: 0.88,           // -12% per level
      damage: 1.35,             // +35% per level
      count: 0.25,              // +1 every 4 levels
      pierce: 0,
    },

    maxLevel: 8,
    evolution: null,

    color: '#8B4513',           // Brown
    trailColor: '#DC143C',
  },

  // ========== MELEE/THROWN (4) ==========

  BOWIE_KNIFE: {
    id: 'bowie_knife',
    name: 'Bowie Knife',
    icon: '🔪',
    description: 'Fast throwing knife that pierces enemies.',
    category: WEAPON_CATEGORIES.MELEE_THROWN,
    type: WEAPON_TYPES.BULLET,

    baseCooldown: 0.35,         // 2.86 shots/sec
    baseDamage: 28,
    baseProjectileCount: 1,
    baseProjectileSpeed: 900,
    range: 500,
    pierce: 2,
    spread: 0,

    scaling: {
      cooldown: 0.93,
      damage: 1.22,             // +22% per level
      count: 0.33,              // +1 every 3 levels
      pierce: 0.5,              // +1 every 2 levels
    },

    maxLevel: 8,
    evolution: null,

    color: '#C0C0C0',           // Silver
    trailColor: '#FFFFFF',
  },

  TOMAHAWK: {
    id: 'tomahawk',
    name: 'Tomahawk',
    icon: '🪓',
    description: 'Returns to player like a boomerang. High damage.',
    category: WEAPON_CATEGORIES.MELEE_THROWN,
    type: WEAPON_TYPES.BULLET,

    baseCooldown: 0.8,          // 1.25 shots/sec
    baseDamage: 45,
    baseProjectileCount: 1,
    baseProjectileSpeed: 700,
    range: 400,
    pierce: 3,
    spread: 0,

    // Boomerang properties
    returns: true,
    returnSpeed: 800,

    scaling: {
      cooldown: 0.90,
      damage: 1.28,             // +28% per level
      count: 0.5,               // +1 every 2 levels
      pierce: 0.5,              // +1 every 2 levels
    },

    maxLevel: 8,
    evolution: {
      requires: 'bowie_knife',
      result: 'dual_tomahawks',
    },

    color: '#8B4513',           // Brown handle
    trailColor: '#C0C0C0',      // Silver blade
  },

  LASSO: {
    id: 'lasso',
    name: 'Lasso',
    icon: '🪢',
    description: 'Orbits around player, slowing and damaging enemies.',
    category: WEAPON_CATEGORIES.MELEE_THROWN,
    type: WEAPON_TYPES.ORBIT,

    baseCooldown: 0,            // Always active
    baseDamage: 15,             // Damage per hit
    baseProjectileCount: 1,
    baseProjectileSpeed: 0,     // Orbit speed controlled separately
    range: 0,                   // Orbit radius instead
    pierce: 999,                // Hits all it touches

    // Orbit properties
    orbitRadius: 80,
    orbitSpeed: 180,            // Degrees per second
    slowAmount: 0.5,            // 50% slow
    slowDuration: 1.0,          // Seconds

    scaling: {
      cooldown: 1.0,            // No cooldown reduction
      damage: 1.2,              // +20% per level
      count: 0.5,               // +1 lasso every 2 levels
      pierce: 0,
    },

    maxLevel: 8,
    evolution: null,

    color: '#D2691E',           // Chocolate
    trailColor: '#FFD700',
  },

  PICKAXE: {
    id: 'pickaxe',
    name: 'Pickaxe',
    icon: '⛏️',
    description: 'Short range spinning attack around player.',
    category: WEAPON_CATEGORIES.MELEE_THROWN,
    type: WEAPON_TYPES.ORBIT,

    baseCooldown: 1.0,          // 1 attack/sec
    baseDamage: 35,
    baseProjectileCount: 4,     // 4-way spin
    baseProjectileSpeed: 0,
    range: 0,
    pierce: 999,

    // Spin properties
    spinRadius: 60,
    spinDuration: 0.4,          // Seconds
    spinSpeed: 720,             // Degrees per second

    scaling: {
      cooldown: 0.92,
      damage: 1.25,             // +25% per level
      count: 0.5,               // +1 every 2 levels (more hits)
      pierce: 0,
    },

    maxLevel: 8,
    evolution: {
      requires: 'lasso',
      result: 'golden_pickaxe',
    },

    color: '#696969',           // Dim gray
    trailColor: '#FFD700',
  },

  // ========== SPECIAL (3) ==========

  SNAKE_OIL: {
    id: 'snake_oil',
    name: 'Snake Oil',
    icon: '🧪',
    description: 'Creates poison cloud AOE. Damages enemies over time.',
    category: WEAPON_CATEGORIES.SPECIAL,
    type: WEAPON_TYPES.CLOUD,

    baseCooldown: 2.5,          // 0.4 shots/sec
    baseDamage: 25,             // Damage per tick
    baseProjectileCount: 1,
    baseProjectileSpeed: 300,
    range: 350,
    pierce: 999,                // Hits all in cloud

    // Cloud properties
    cloudRadius: 100,
    cloudDuration: 4.0,         // Seconds
    tickRate: 0.5,              // Damage every 0.5 seconds
    isPoisonDamage: true,       // For passive interactions

    scaling: {
      cooldown: 0.90,
      damage: 1.25,             // +25% per level
      count: 0.33,              // +1 every 3 levels
      pierce: 0,
    },

    maxLevel: 8,
    evolution: null,

    color: '#9ACD32',           // Yellow green
    trailColor: '#32CD32',      // Lime green
  },

  DEPUTY_STAR: {
    id: 'deputy_star',
    name: 'Deputy Star',
    icon: '⭐',
    description: 'Bounces between targets, chaining damage.',
    category: WEAPON_CATEGORIES.SPECIAL,
    type: WEAPON_TYPES.BOUNCE,

    baseCooldown: 0.6,          // 1.67 shots/sec
    baseDamage: 30,
    baseProjectileCount: 1,
    baseProjectileSpeed: 800,
    range: 600,
    pierce: 0,                  // Uses bounces instead

    // Bounce properties
    maxBounces: 3,
    bounceRange: 200,           // Range to find next target
    damageReduction: 0.8,       // 20% less per bounce

    scaling: {
      cooldown: 0.92,
      damage: 1.2,              // +20% per level
      count: 0.5,               // +1 every 2 levels
      pierce: 0.5,              // +1 bounce every 2 levels
    },

    maxLevel: 8,
    evolution: {
      requires: 'rifle',
      result: 'marshal_star',
    },

    color: '#FFD700',           // Gold
    trailColor: '#FFA500',
  },

  WANTED_POSTER: {
    id: 'wanted_poster',
    name: 'Wanted Poster',
    icon: '📜',
    description: 'Marks enemies for bonus damage from all sources.',
    category: WEAPON_CATEGORIES.SPECIAL,
    type: WEAPON_TYPES.DEBUFF,

    baseCooldown: 3.0,          // 0.33 shots/sec
    baseDamage: 0,              // No direct damage
    baseProjectileCount: 1,
    baseProjectileSpeed: 600,
    range: 500,
    pierce: 0,

    // Debuff properties
    markDuration: 8.0,          // Seconds
    damageBonusPercent: 0.25,   // +25% damage
    maxMarkedEnemies: 5,

    scaling: {
      cooldown: 0.90,
      damage: 0,                // No damage scaling
      count: 0.33,              // +1 every 3 levels (more targets)
      pierce: 0,
    },

    maxLevel: 8,
    evolution: null,

    color: '#DEB887',           // Burlywood (parchment)
    trailColor: '#8B4513',
  },
};

// ========== EVOLVED WEAPONS ==========

export const EVOLVED_WEAPONS = {
  TWIN_BARRELS: {
    id: 'twin_barrels',
    name: 'Twin Barrels',
    icon: '💥💥',
    description: 'Dual shotguns with devastating spread.',
    category: WEAPON_CATEGORIES.FIREARMS,
    type: WEAPON_TYPES.BULLET,
    baseCooldown: 0.6,
    baseDamage: 22,
    baseProjectileCount: 12,    // Double the shots
    baseProjectileSpeed: 700,
    range: 400,
    pierce: 1,
    spread: 0.5,
    scaling: { cooldown: 0.92, damage: 1.18, count: 0.25, pierce: 0.5 },
    maxLevel: 8,
    isEvolution: true,
    color: '#FF6347',
    trailColor: '#FFD700',
  },

  DOUBLE_GATLING: {
    id: 'double_gatling',
    name: 'Double Gatling',
    icon: '⚙️⚙️',
    description: 'Twin gatling guns. Unstoppable firepower.',
    category: WEAPON_CATEGORIES.FIREARMS,
    type: WEAPON_TYPES.BULLET,
    baseCooldown: 0.1,
    baseDamage: 15,
    baseProjectileCount: 2,
    baseProjectileSpeed: 950,
    range: 550,
    pierce: 1,
    spread: 0.15,
    scaling: { cooldown: 0.95, damage: 1.2, count: 0.33, pierce: 0.5 },
    maxLevel: 8,
    isEvolution: true,
    color: '#708090',
    trailColor: '#FFD700',
  },

  SHARPSHOOTER: {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    icon: '🎯',
    description: 'Enhanced rifle with auto-targeting marked enemies.',
    category: WEAPON_CATEGORIES.FIREARMS,
    type: WEAPON_TYPES.BULLET,
    baseCooldown: 1.0,
    baseDamage: 80,
    baseProjectileCount: 1,
    baseProjectileSpeed: 1400,
    range: 1000,
    pierce: 3,
    autoTarget: true,           // Auto-targets marked enemies
    scaling: { cooldown: 0.88, damage: 1.3, count: 0.5, pierce: 0.5 },
    maxLevel: 8,
    isEvolution: true,
    color: '#8B4513',
    trailColor: '#DC143C',
  },

  MEGA_DYNAMITE: {
    id: 'mega_dynamite',
    name: 'Mega Dynamite',
    icon: '🧨💥',
    description: 'Massive explosion radius. Stand way back.',
    category: WEAPON_CATEGORIES.EXPLOSIVES,
    type: WEAPON_TYPES.EXPLOSIVE,
    baseCooldown: 1.2,
    baseDamage: 120,
    baseProjectileCount: 1,
    baseProjectileSpeed: 450,
    range: 500,
    pierce: 999,
    explosionRadius: 200,       // Huge AOE
    fuseTime: 0.6,
    scaling: { cooldown: 0.90, damage: 1.35, count: 0.5, pierce: 0 },
    maxLevel: 8,
    isEvolution: true,
    color: '#DC143C',
    trailColor: '#FFD700',
  },

  HELLFIRE_WHISKEY: {
    id: 'hellfire_whiskey',
    name: 'Hellfire Whiskey',
    icon: '🔥',
    description: 'Burning pool with poison damage. Deadly combination.',
    category: WEAPON_CATEGORIES.EXPLOSIVES,
    type: WEAPON_TYPES.GROUND,
    baseCooldown: 1.5,
    baseDamage: 30,
    baseProjectileCount: 2,
    baseProjectileSpeed: 400,
    range: 450,
    pierce: 999,
    poolRadius: 130,
    poolDuration: 7.0,
    tickRate: 0.4,
    isPoisonDamage: true,
    scaling: { cooldown: 0.88, damage: 1.3, count: 0.5, pierce: 0 },
    maxLevel: 8,
    isEvolution: true,
    color: '#FF8C00',
    trailColor: '#9ACD32',
  },

  DUAL_TOMAHAWKS: {
    id: 'dual_tomahawks',
    name: 'Dual Tomahawks',
    icon: '🪓🪓',
    description: 'Two tomahawks spiraling outward and returning.',
    category: WEAPON_CATEGORIES.MELEE_THROWN,
    type: WEAPON_TYPES.BULLET,
    baseCooldown: 0.6,
    baseDamage: 55,
    baseProjectileCount: 2,
    baseProjectileSpeed: 750,
    range: 450,
    pierce: 4,
    returns: true,
    returnSpeed: 850,
    scaling: { cooldown: 0.88, damage: 1.3, count: 0.5, pierce: 0.5 },
    maxLevel: 8,
    isEvolution: true,
    color: '#8B4513',
    trailColor: '#FFD700',
  },

  GOLDEN_PICKAXE: {
    id: 'golden_pickaxe',
    name: 'Golden Pickaxe',
    icon: '⛏️✨',
    description: 'Larger radius spin with gold nugget drops.',
    category: WEAPON_CATEGORIES.MELEE_THROWN,
    type: WEAPON_TYPES.ORBIT,
    baseCooldown: 0.8,
    baseDamage: 45,
    baseProjectileCount: 6,
    baseProjectileSpeed: 0,
    range: 0,
    pierce: 999,
    spinRadius: 90,
    spinDuration: 0.5,
    spinSpeed: 900,
    goldDropChance: 0.15,       // 15% chance for gold nugget
    scaling: { cooldown: 0.90, damage: 1.28, count: 0.5, pierce: 0 },
    maxLevel: 8,
    isEvolution: true,
    color: '#FFD700',
    trailColor: '#FFA500',
  },

  MARSHAL_STAR: {
    id: 'marshal_star',
    name: 'Marshal Star',
    icon: '⭐🎯',
    description: 'Bounces more times with piercing damage.',
    category: WEAPON_CATEGORIES.SPECIAL,
    type: WEAPON_TYPES.BOUNCE,
    baseCooldown: 0.5,
    baseDamage: 40,
    baseProjectileCount: 2,
    baseProjectileSpeed: 900,
    range: 700,
    pierce: 1,
    maxBounces: 5,
    bounceRange: 250,
    damageReduction: 0.9,       // Only 10% reduction per bounce
    scaling: { cooldown: 0.90, damage: 1.25, count: 0.5, pierce: 0.33 },
    maxLevel: 8,
    isEvolution: true,
    color: '#FFD700',
    trailColor: '#DC143C',
  },
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get weapon by ID from both regular and evolved weapons
 */
export function getWeaponById(weaponId) {
  const upperKey = weaponId.toUpperCase();
  return WEAPONS[upperKey] || EVOLVED_WEAPONS[upperKey] || null;
}

/**
 * Get all weapons in a category
 */
export function getWeaponsByCategory(category) {
  const allWeapons = { ...WEAPONS, ...EVOLVED_WEAPONS };
  return Object.values(allWeapons).filter(w => w.category === category);
}

/**
 * Calculate weapon stats at a specific level
 */
export function getWeaponStatsAtLevel(weapon, level) {
  if (level < 1 || level > weapon.maxLevel) {
    console.warn(`Level ${level} out of range for ${weapon.name}`);
    level = Math.max(1, Math.min(level, weapon.maxLevel));
  }

  const levelsGained = level - 1;

  return {
    ...weapon,
    level,
    cooldown: weapon.baseCooldown * Math.pow(weapon.scaling.cooldown, levelsGained),
    damage: Math.floor(weapon.baseDamage * Math.pow(weapon.scaling.damage, levelsGained)),
    projectileCount: weapon.baseProjectileCount + Math.floor(levelsGained * weapon.scaling.count),
    pierce: weapon.pierce + Math.floor(levelsGained * weapon.scaling.pierce),
  };
}

/**
 * Calculate DPS for a weapon at specific level
 */
export function calculateWeaponDPS(weapon, level = 1) {
  const stats = getWeaponStatsAtLevel(weapon, level);
  const shotsPerSecond = 1 / stats.cooldown;
  return Math.floor(stats.damage * stats.projectileCount * shotsPerSecond);
}

/**
 * Check if evolution is available
 */
export function canEvolveWeapon(weapon, playerWeapons) {
  if (!weapon.evolution) return false;

  const hasRequiredWeapon = playerWeapons.some(
    w => w.id === weapon.evolution.requires
  );

  return hasRequiredWeapon && weapon.level >= weapon.maxLevel;
}

/**
 * Evolve a weapon
 */
export function evolveWeapon(weapon) {
  if (!weapon.evolution) return null;

  const evolvedId = weapon.evolution.result;
  const evolved = getWeaponById(evolvedId);

  if (!evolved) {
    console.error(`Evolution ${evolvedId} not found for ${weapon.name}`);
    return null;
  }

  return {
    ...evolved,
    level: 1, // Start evolved weapon at level 1
  };
}

/**
 * Get weapon display info for UI
 */
export function getWeaponDisplayInfo(weapon, level = 1) {
  const stats = getWeaponStatsAtLevel(weapon, level);
  const dps = calculateWeaponDPS(weapon, level);

  return {
    id: weapon.id,
    name: weapon.name,
    icon: weapon.icon,
    description: weapon.description,
    category: weapon.category,
    type: weapon.type,
    level: stats.level,
    maxLevel: weapon.maxLevel,
    dps,
    stats: {
      damage: stats.damage,
      cooldown: stats.cooldown.toFixed(2),
      projectileCount: stats.projectileCount,
      pierce: stats.pierce,
      range: weapon.range,
    },
    canEvolve: weapon.evolution !== null,
    isEvolved: weapon.isEvolution || false,
  };
}

/**
 * Get all base (non-evolved) weapons
 */
export function getBaseWeapons() {
  return Object.values(WEAPONS);
}

/**
 * Get all evolved weapons
 */
export function getEvolvedWeapons() {
  return Object.values(EVOLVED_WEAPONS);
}

/**
 * Get random weapons for level-up choices
 */
export function getRandomWeaponChoices(playerWeapons, count = 3) {
  const availableWeapons = getBaseWeapons().filter(
    weapon => !playerWeapons.some(pw => pw.id === weapon.id)
  );

  // Shuffle and take first N
  const shuffled = availableWeapons.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Default starting weapon (Six-Shooter)
 */
export const DEFAULT_WEAPON = getWeaponStatsAtLevel(WEAPONS.SIX_SHOOTER, 1);

// Export all weapons for easy access
export const ALL_WEAPONS = {
  ...WEAPONS,
  ...EVOLVED_WEAPONS,
};
