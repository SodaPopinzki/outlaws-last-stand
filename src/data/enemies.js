/**
 * Enemy Definitions - Outlaw's Last Stand
 *
 * 12 enemy types across 4 tiers with unique behaviors
 */

// ========== ENEMY TIERS ==========

export const ENEMY_TIERS = {
  COMMON: 'common',         // Waves 1-10
  UNCOMMON: 'uncommon',     // Waves 5-20
  RARE: 'rare',             // Waves 10-30
  ELITE: 'elite',           // Waves 15+
};

// ========== ENEMY BEHAVIORS ==========

export const ENEMY_BEHAVIORS = {
  CHASE: 'chase',           // Move directly toward player
  LUNGE: 'lunge',          // Wait, then lunge at player
  RANGED: 'ranged',        // Stop and shoot from distance
  CHARGE: 'charge',        // Charge in straight lines
  SPAWN: 'spawn',          // Spawns minions
  PHASE: 'phase',          // Phases through projectiles
};

// ========== DEATH EFFECTS ==========

export const DEATH_EFFECTS = {
  NONE: null,
  EXPLODE: 'explode',
  SPAWN_MINIONS: 'spawnMinions',
};

// ========== ENEMY DEFINITIONS ==========

export const ENEMIES = {
  // ========== TIER 1: COMMON (Waves 1-10) ==========

  BANDIT: {
    id: 'bandit',
    name: 'Bandit',
    tier: ENEMY_TIERS.COMMON,

    baseHp: 30,
    baseSpeed: 80,          // Medium speed
    baseDamage: 10,
    size: 12,               // Radius for collision
    color: '#8B4513',       // Saddle brown

    xpValue: 5,
    spawnWeight: 100,       // High spawn chance

    behavior: ENEMY_BEHAVIORS.CHASE,
    deathEffect: DEATH_EFFECTS.NONE,
    waveRequirement: 1,

    // Scaling per wave
    scaling: {
      hp: 1.1,              // +10% HP per wave
      speed: 1.02,          // +2% speed per wave
      damage: 1.08,         // +8% damage per wave
    },
  },

  RUSTLER: {
    id: 'rustler',
    name: 'Rustler',
    tier: ENEMY_TIERS.COMMON,

    baseHp: 15,             // Weak
    baseSpeed: 130,         // Fast
    baseDamage: 8,
    size: 10,
    color: '#A0522D',       // Sienna

    xpValue: 4,
    spawnWeight: 80,

    behavior: ENEMY_BEHAVIORS.CHASE,
    deathEffect: DEATH_EFFECTS.NONE,
    waveRequirement: 1,

    // Special property
    groupSize: 3,           // Spawns in groups of 3
    groupSpacing: 20,

    scaling: {
      hp: 1.08,
      speed: 1.03,
      damage: 1.07,
    },
  },

  COYOTE: {
    id: 'coyote',
    name: 'Coyote',
    tier: ENEMY_TIERS.COMMON,

    baseHp: 20,
    baseSpeed: 100,
    baseDamage: 12,
    size: 10,
    color: '#CD853F',       // Peru (tan)

    xpValue: 6,
    spawnWeight: 60,

    behavior: ENEMY_BEHAVIORS.LUNGE,
    deathEffect: DEATH_EFFECTS.NONE,
    waveRequirement: 2,

    // Lunge behavior properties
    lungeDistance: 150,     // Detection range
    lungeSpeed: 300,        // Lunge speed multiplier
    lungeCooldown: 2.0,     // Seconds between lunges
    lungeWindup: 0.3,       // Windup time before lunge

    scaling: {
      hp: 1.09,
      speed: 1.025,
      damage: 1.1,
    },
  },

  // ========== TIER 2: UNCOMMON (Waves 5-20) ==========

  DESPERADO: {
    id: 'desperado',
    name: 'Desperado',
    tier: ENEMY_TIERS.UNCOMMON,

    baseHp: 60,             // 2x bandit HP
    baseSpeed: 75,
    baseDamage: 18,
    size: 14,
    color: '#8B0000',       // Dark red

    xpValue: 12,
    spawnWeight: 50,

    behavior: ENEMY_BEHAVIORS.CHASE,
    deathEffect: DEATH_EFFECTS.NONE,
    waveRequirement: 5,

    scaling: {
      hp: 1.12,
      speed: 1.02,
      damage: 1.1,
    },
  },

  DYNAMITER: {
    id: 'dynamiter',
    name: 'Dynamiter',
    tier: ENEMY_TIERS.UNCOMMON,

    baseHp: 35,
    baseSpeed: 70,
    baseDamage: 15,
    size: 12,
    color: '#DC143C',       // Crimson

    xpValue: 15,
    spawnWeight: 40,

    behavior: ENEMY_BEHAVIORS.CHASE,
    deathEffect: DEATH_EFFECTS.EXPLODE,
    waveRequirement: 6,

    // Explosion properties
    explosionRadius: 100,
    explosionDamage: 50,    // Damages player AND nearby enemies
    explosionColor: '#FF8C00',

    scaling: {
      hp: 1.1,
      speed: 1.015,
      damage: 1.09,
    },
  },

  GUNMAN: {
    id: 'gunman',
    name: 'Gunman',
    tier: ENEMY_TIERS.UNCOMMON,

    baseHp: 40,
    baseSpeed: 60,
    baseDamage: 20,
    size: 12,
    color: '#696969',       // Dim gray

    xpValue: 18,
    spawnWeight: 35,

    behavior: ENEMY_BEHAVIORS.RANGED,
    deathEffect: DEATH_EFFECTS.NONE,
    waveRequirement: 7,

    // Ranged behavior properties
    attackRange: 250,       // Stops and shoots from this range
    projectileSpeed: 400,
    fireRate: 1.5,          // Seconds between shots
    projectileColor: '#FFD700',
    projectileSize: 4,

    scaling: {
      hp: 1.11,
      speed: 1.01,
      damage: 1.12,
    },
  },

  // ========== TIER 3: RARE (Waves 10-30) ==========

  SHERIFF: {
    id: 'sheriff',
    name: 'Sheriff',
    tier: ENEMY_TIERS.RARE,

    baseHp: 150,            // Very tanky
    baseSpeed: 50,          // Slow
    baseDamage: 30,
    size: 16,
    color: '#FFD700',       // Gold (badge)

    xpValue: 30,
    spawnWeight: 20,

    behavior: ENEMY_BEHAVIORS.CHASE,
    deathEffect: DEATH_EFFECTS.NONE,
    waveRequirement: 10,

    // Special property
    armor: 0.2,             // 20% damage reduction

    scaling: {
      hp: 1.15,
      speed: 1.01,
      damage: 1.12,
    },
  },

  BOUNTY_HUNTER: {
    id: 'bounty_hunter',
    name: 'Bounty Hunter',
    tier: ENEMY_TIERS.RARE,

    baseHp: 80,
    baseSpeed: 120,         // Fast and aggressive
    baseDamage: 25,
    size: 13,
    color: '#2F4F4F',       // Dark slate gray

    xpValue: 35,
    spawnWeight: 25,

    behavior: ENEMY_BEHAVIORS.CHASE,
    deathEffect: DEATH_EFFECTS.NONE,
    waveRequirement: 12,

    // Special properties
    aggressionMultiplier: 1.5,  // Faster when close to player
    detectionRange: 400,        // Tracks from farther away

    scaling: {
      hp: 1.13,
      speed: 1.025,
      damage: 1.11,
    },
  },

  WAR_HORSE: {
    id: 'war_horse',
    name: 'War Horse',
    tier: ENEMY_TIERS.RARE,

    baseHp: 100,
    baseSpeed: 150,         // Fast charge
    baseDamage: 35,
    size: 18,               // Large
    color: '#8B4513',       // Brown horse

    xpValue: 40,
    spawnWeight: 15,

    behavior: ENEMY_BEHAVIORS.CHARGE,
    deathEffect: DEATH_EFFECTS.NONE,
    waveRequirement: 15,

    // Charge behavior properties
    chargeDistance: 300,
    chargeCooldown: 3.0,
    chargeWindup: 0.5,
    chargeKnockback: 50,    // Knocks player back

    scaling: {
      hp: 1.14,
      speed: 1.02,
      damage: 1.13,
    },
  },

  // ========== TIER 4: ELITE (Waves 15+) ==========

  GANG_LEADER: {
    id: 'gang_leader',
    name: 'Gang Leader',
    tier: ENEMY_TIERS.ELITE,

    baseHp: 120,
    baseSpeed: 85,
    baseDamage: 28,
    size: 15,
    color: '#4B0082',       // Indigo (boss-like)

    xpValue: 60,
    spawnWeight: 10,

    behavior: ENEMY_BEHAVIORS.SPAWN,
    deathEffect: DEATH_EFFECTS.SPAWN_MINIONS,
    waveRequirement: 15,

    // Spawn minions on death
    minionType: 'bandit',
    minionCount: 3,         // Spawns 2-3 minions
    minionCountVariance: 1,

    scaling: {
      hp: 1.16,
      speed: 1.02,
      damage: 1.12,
    },
  },

  EXECUTIONER: {
    id: 'executioner',
    name: 'Executioner',
    tier: ENEMY_TIERS.ELITE,

    baseHp: 300,            // Massive HP
    baseSpeed: 40,          // Very slow
    baseDamage: 999,        // One-shot if reaches player
    size: 20,               // Very large
    color: '#000000',       // Black

    xpValue: 100,
    spawnWeight: 5,

    behavior: ENEMY_BEHAVIORS.CHASE,
    deathEffect: DEATH_EFFECTS.NONE,
    waveRequirement: 20,

    // Special properties
    armor: 0.3,             // 30% damage reduction
    intimidation: true,     // Visual indicator (skull icon)

    scaling: {
      hp: 1.18,
      speed: 1.005,         // Barely gets faster
      damage: 1.0,          // Always one-shot
    },
  },

  GHOST_RIDER: {
    id: 'ghost_rider',
    name: 'Ghost Rider',
    tier: ENEMY_TIERS.ELITE,

    baseHp: 90,
    baseSpeed: 100,
    baseDamage: 32,
    size: 14,
    color: '#E6E6FA',       // Lavender (ghostly)

    xpValue: 80,
    spawnWeight: 8,

    behavior: ENEMY_BEHAVIORS.PHASE,
    deathEffect: DEATH_EFFECTS.NONE,
    waveRequirement: 18,

    // Phase behavior properties
    phaseInterval: 3.0,     // Phases every 3 seconds
    phaseDuration: 1.5,     // Invulnerable for 1.5 seconds
    phaseAlpha: 0.3,        // 30% opacity when phasing

    scaling: {
      hp: 1.15,
      speed: 1.025,
      damage: 1.14,
    },
  },
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get enemy by ID
 */
export function getEnemyById(enemyId) {
  const upperKey = enemyId.toUpperCase();
  return ENEMIES[upperKey] || null;
}

/**
 * Get all enemies of a specific tier
 */
export function getEnemiesByTier(tier) {
  return Object.values(ENEMIES).filter(enemy => enemy.tier === tier);
}

/**
 * Get enemies available for a specific wave
 */
export function getEnemiesForWave(waveNumber) {
  return Object.values(ENEMIES).filter(
    enemy => enemy.waveRequirement <= waveNumber
  );
}

/**
 * Calculate enemy stats at specific wave
 */
export function getEnemyStatsAtWave(enemy, waveNumber) {
  const wavesProgressed = Math.max(0, waveNumber - enemy.waveRequirement);

  return {
    ...enemy,
    hp: Math.floor(enemy.baseHp * Math.pow(enemy.scaling.hp, wavesProgressed)),
    speed: enemy.baseSpeed * Math.pow(enemy.scaling.speed, wavesProgressed),
    damage: Math.floor(enemy.baseDamage * Math.pow(enemy.scaling.damage, wavesProgressed)),
    wave: waveNumber,
  };
}

/**
 * Calculate total enemy count for wave
 */
export function getEnemyCountForWave(waveNumber) {
  // Base count increases with wave, caps at 50
  const baseCount = Math.min(10 + waveNumber * 2, 50);

  // Add some randomness (±20%)
  const variance = Math.floor(baseCount * 0.2);
  const randomOffset = Math.floor(Math.random() * (variance * 2 + 1)) - variance;

  return Math.max(5, baseCount + randomOffset);
}

/**
 * Select random enemy weighted by spawn weight
 */
export function selectRandomEnemy(waveNumber) {
  const availableEnemies = getEnemiesForWave(waveNumber);

  // Calculate total weight
  const totalWeight = availableEnemies.reduce(
    (sum, enemy) => sum + enemy.spawnWeight,
    0
  );

  // Random selection weighted by spawn weight
  let random = Math.random() * totalWeight;

  for (const enemy of availableEnemies) {
    random -= enemy.spawnWeight;
    if (random <= 0) {
      return enemy;
    }
  }

  // Fallback to first available enemy
  return availableEnemies[0] || ENEMIES.BANDIT;
}

/**
 * Generate enemy spawn composition for wave
 */
export function generateWaveComposition(waveNumber, enemyCount) {
  const composition = [];

  // Elite enemies (15% of wave for eligible waves)
  if (waveNumber >= 15) {
    const eliteCount = Math.floor(enemyCount * 0.15);
    const eliteEnemies = getEnemiesByTier(ENEMY_TIERS.ELITE).filter(
      e => e.waveRequirement <= waveNumber
    );

    for (let i = 0; i < eliteCount; i++) {
      const enemy = eliteEnemies[Math.floor(Math.random() * eliteEnemies.length)];
      if (enemy) composition.push(enemy);
    }
  }

  // Rare enemies (25% of wave for eligible waves)
  if (waveNumber >= 10) {
    const rareCount = Math.floor(enemyCount * 0.25);
    const rareEnemies = getEnemiesByTier(ENEMY_TIERS.RARE).filter(
      e => e.waveRequirement <= waveNumber
    );

    for (let i = 0; i < rareCount; i++) {
      const enemy = rareEnemies[Math.floor(Math.random() * rareEnemies.length)];
      if (enemy) composition.push(enemy);
    }
  }

  // Uncommon enemies (35% of wave for eligible waves)
  if (waveNumber >= 5) {
    const uncommonCount = Math.floor(enemyCount * 0.35);
    const uncommonEnemies = getEnemiesByTier(ENEMY_TIERS.UNCOMMON).filter(
      e => e.waveRequirement <= waveNumber
    );

    for (let i = 0; i < uncommonCount; i++) {
      const enemy = uncommonEnemies[Math.floor(Math.random() * uncommonEnemies.length)];
      if (enemy) composition.push(enemy);
    }
  }

  // Fill remaining with common enemies
  const remainingCount = enemyCount - composition.length;
  const commonEnemies = getEnemiesByTier(ENEMY_TIERS.COMMON).filter(
    e => e.waveRequirement <= waveNumber
  );

  for (let i = 0; i < remainingCount; i++) {
    const enemy = selectRandomEnemy(waveNumber);
    composition.push(enemy);
  }

  return composition;
}

/**
 * Create enemy instance with position
 */
export function createEnemyInstance(enemy, waveNumber, x, y) {
  const stats = getEnemyStatsAtWave(enemy, waveNumber);

  return {
    id: `${enemy.id}_${Date.now()}_${Math.random()}`,
    type: enemy.id,
    x,
    y,
    hp: stats.hp,
    maxHp: stats.hp,
    speed: stats.speed,
    damage: stats.damage,
    size: enemy.size,
    color: enemy.color,
    behavior: enemy.behavior,
    deathEffect: enemy.deathEffect,

    // Behavior state
    state: 'idle',
    stateTimer: 0,
    targetX: x,
    targetY: y,

    // Combat properties
    armor: enemy.armor || 0,
    xpValue: enemy.xpValue,

    // Visual properties
    alpha: 1.0,
    rotation: 0,

    // Special properties (copied from enemy definition)
    ...(enemy.lungeDistance && { lungeDistance: enemy.lungeDistance }),
    ...(enemy.lungeSpeed && { lungeSpeed: enemy.lungeSpeed }),
    ...(enemy.lungeCooldown && { lungeCooldown: enemy.lungeCooldown }),
    ...(enemy.lungeWindup && { lungeWindup: enemy.lungeWindup }),
    ...(enemy.attackRange && { attackRange: enemy.attackRange }),
    ...(enemy.projectileSpeed && { projectileSpeed: enemy.projectileSpeed }),
    ...(enemy.fireRate && { fireRate: enemy.fireRate }),
    ...(enemy.chargeDistance && { chargeDistance: enemy.chargeDistance }),
    ...(enemy.chargeCooldown && { chargeCooldown: enemy.chargeCooldown }),
    ...(enemy.phaseInterval && { phaseInterval: enemy.phaseInterval }),
    ...(enemy.phaseDuration && { phaseDuration: enemy.phaseDuration }),
    ...(enemy.explosionRadius && { explosionRadius: enemy.explosionRadius }),
    ...(enemy.explosionDamage && { explosionDamage: enemy.explosionDamage }),
    ...(enemy.minionType && { minionType: enemy.minionType }),
    ...(enemy.minionCount && { minionCount: enemy.minionCount }),
  };
}

/**
 * Get enemy tier color for UI
 */
export function getEnemyTierColor(tier) {
  switch (tier) {
    case ENEMY_TIERS.COMMON:
      return '#FFFFFF';
    case ENEMY_TIERS.UNCOMMON:
      return '#00FF00';
    case ENEMY_TIERS.RARE:
      return '#0096FF';
    case ENEMY_TIERS.ELITE:
      return '#9400D3';
    default:
      return '#FFFFFF';
  }
}

/**
 * Get enemy display info for UI
 */
export function getEnemyDisplayInfo(enemy, waveNumber = 1) {
  const stats = getEnemyStatsAtWave(enemy, waveNumber);

  return {
    id: enemy.id,
    name: enemy.name,
    tier: enemy.tier,
    tierColor: getEnemyTierColor(enemy.tier),

    stats: {
      hp: stats.hp,
      speed: Math.floor(stats.speed),
      damage: stats.damage,
    },

    behavior: enemy.behavior,
    deathEffect: enemy.deathEffect,
    waveRequirement: enemy.waveRequirement,
    xpValue: enemy.xpValue,

    specialAbilities: getSpecialAbilities(enemy),
  };
}

/**
 * Get special abilities for display
 */
function getSpecialAbilities(enemy) {
  const abilities = [];

  if (enemy.behavior === ENEMY_BEHAVIORS.LUNGE) {
    abilities.push('Lunges at player');
  }
  if (enemy.behavior === ENEMY_BEHAVIORS.RANGED) {
    abilities.push('Shoots from range');
  }
  if (enemy.behavior === ENEMY_BEHAVIORS.CHARGE) {
    abilities.push('Charges in straight lines');
  }
  if (enemy.behavior === ENEMY_BEHAVIORS.PHASE) {
    abilities.push('Phases through projectiles');
  }
  if (enemy.deathEffect === DEATH_EFFECTS.EXPLODE) {
    abilities.push(`Explodes on death (${enemy.explosionRadius} radius)`);
  }
  if (enemy.deathEffect === DEATH_EFFECTS.SPAWN_MINIONS) {
    abilities.push(`Spawns ${enemy.minionCount} minions on death`);
  }
  if (enemy.armor > 0) {
    abilities.push(`${Math.floor(enemy.armor * 100)}% damage reduction`);
  }
  if (enemy.groupSize) {
    abilities.push(`Spawns in groups of ${enemy.groupSize}`);
  }
  if (enemy.intimidation) {
    abilities.push('One-shot threat');
  }

  return abilities;
}

/**
 * Get all enemy types
 */
export function getAllEnemies() {
  return Object.values(ENEMIES);
}

/**
 * Get enemy bestiary progress
 */
export function getEnemyBestiaryProgress() {
  // This would be tracked in localStorage
  // For now, just return structure
  return {
    total: Object.keys(ENEMIES).length,
    encountered: 0,
    killed: {},
  };
}

export default ENEMIES;
