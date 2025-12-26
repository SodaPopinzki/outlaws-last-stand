/**
 * Weapon Evolution System - Outlaw's Last Stand
 *
 * Handles weapon combinations that create powerful evolved forms
 * when two weapons both reach max level (8)
 */

import { generateId } from '../utils/random';

// ========== EVOLUTION DEFINITIONS ==========

export const EVOLUTIONS = {
  PEACEMAKER: {
    id: 'peacemaker',
    name: 'Peacemaker',
    icon: '🔫💥',
    description: 'Legendary revolver with explosive rounds. Combines rapid fire with devastating power.',

    requires: ['six_shooter', 'rifle'],
    requiresLevel: 8,

    // Base stats (better than either component)
    baseCooldown: 0.3,
    baseDamage: 75,
    baseProjectileCount: 1,
    baseProjectileSpeed: 1000,
    range: 700,
    pierce: 2,
    spread: 0,

    // Special properties
    explosiveRounds: true,
    explosionRadius: 60,
    explosionDamage: 30,

    scaling: {
      cooldown: 0.90,
      damage: 1.25,
      count: 0.5,
      pierce: 0.33,
    },

    maxLevel: 8,
    category: 'firearms',
    type: 'bullet',
    color: '#FFD700',
    trailColor: '#DC143C',
    rarity: 'legendary',
  },

  HELLFIRE: {
    id: 'hellfire',
    name: 'Hellfire',
    icon: '🔥💀',
    description: 'Apocalyptic explosion that creates permanent burning ground. The end of days.',

    requires: ['dynamite', 'molotov_whiskey'],
    requiresLevel: 8,

    baseCooldown: 2.0,
    baseDamage: 120,
    baseProjectileCount: 1,
    baseProjectileSpeed: 450,
    range: 500,
    pierce: 999,
    spread: 0,

    // Special properties
    explosionRadius: 200,
    fuseTime: 0.5,
    burnDuration: 999,          // Permanent fire
    burnDamage: 15,
    burnTickRate: 0.5,
    burnRadius: 120,

    scaling: {
      cooldown: 0.88,
      damage: 1.35,
      count: 0.33,
      pierce: 0,
    },

    maxLevel: 8,
    category: 'explosives',
    type: 'explosive',
    color: '#FF4500',
    trailColor: '#FFD700',
    rarity: 'legendary',
  },

  DEATH_SPIN: {
    id: 'death_spin',
    name: 'Death Spin',
    icon: '🪓🌀',
    description: 'Multiple tomahawks orbit rapidly, shredding all nearby enemies.',

    requires: ['lasso', 'tomahawk'],
    requiresLevel: 8,

    baseCooldown: 0,            // Always active
    baseDamage: 50,
    baseProjectileCount: 3,     // 3 tomahawks
    baseProjectileSpeed: 0,
    range: 0,
    pierce: 999,

    // Orbit properties
    orbitRadius: 100,
    orbitSpeed: 360,            // Fast spin
    slowAmount: 0.3,            // 30% slow on hit
    slowDuration: 1.5,

    scaling: {
      cooldown: 1.0,            // No cooldown
      damage: 1.3,
      count: 0.33,              // +1 tomahawk every 3 levels
      pierce: 0,
    },

    maxLevel: 8,
    category: 'melee_thrown',
    type: 'orbit',
    color: '#8B4513',
    trailColor: '#DC143C',
    rarity: 'legendary',
  },

  CURSE_OF_THE_WEST: {
    id: 'curse_of_the_west',
    name: 'Curse of the West',
    icon: '☠️📜',
    description: 'Cursed poison that spreads between marked enemies like a plague.',

    requires: ['snake_oil', 'wanted_poster'],
    requiresLevel: 8,

    baseCooldown: 2.0,
    baseDamage: 40,             // Damage per tick
    baseProjectileCount: 1,
    baseProjectileSpeed: 400,
    range: 600,
    pierce: 0,

    // Special properties
    cloudRadius: 120,
    cloudDuration: 6.0,
    tickRate: 0.4,
    isPoisonDamage: true,
    chainRange: 150,            // Spreads to nearby marked enemies
    maxChains: 5,
    damageBonus: 0.4,           // +40% damage to marked enemies

    scaling: {
      cooldown: 0.88,
      damage: 1.3,
      count: 0.5,
      pierce: 0,
    },

    maxLevel: 8,
    category: 'special',
    type: 'cloud',
    color: '#9ACD32',
    trailColor: '#8B008B',
    rarity: 'legendary',
  },

  LEAD_STORM: {
    id: 'lead_storm',
    name: 'Lead Storm',
    icon: '⚙️⭐',
    description: 'Rapid-fire bouncing projectiles. Enemies have nowhere to hide.',

    requires: ['gatling_gun', 'deputy_star'],
    requiresLevel: 8,

    baseCooldown: 0.12,         // Very fast
    baseDamage: 20,
    baseProjectileCount: 1,
    baseProjectileSpeed: 950,
    range: 600,
    pierce: 0,

    // Bounce properties
    maxBounces: 4,
    bounceRange: 200,
    damageReduction: 0.85,      // Only 15% reduction per bounce

    scaling: {
      cooldown: 0.94,
      damage: 1.22,
      count: 0.33,
      pierce: 0.25,               // +1 bounce every 4 levels
    },

    maxLevel: 8,
    category: 'firearms',
    type: 'bounce',
    color: '#708090',
    trailColor: '#FFD700',
    rarity: 'legendary',
  },

  WHIRLWIND: {
    id: 'whirlwind',
    name: 'Whirlwind',
    icon: '🌪️🔪',
    description: 'Constant spinning blades in 360 degrees. Step into the storm.',

    requires: ['bowie_knife', 'pickaxe'],
    requiresLevel: 8,

    baseCooldown: 0,            // Constant damage
    baseDamage: 25,             // Damage per hit
    baseProjectileCount: 8,     // 8 blades
    baseProjectileSpeed: 0,
    range: 0,
    pierce: 999,

    // Spin properties
    spinRadius: 80,
    spinSpeed: 900,             // Very fast spin
    hitRate: 0.2,               // Damage every 0.2 seconds
    bleedChance: 0.3,           // 30% chance to apply bleed
    bleedDamage: 10,
    bleedDuration: 3.0,

    scaling: {
      cooldown: 1.0,
      damage: 1.25,
      count: 0.5,                 // +1 blade every 2 levels
      pierce: 0,
    },

    maxLevel: 8,
    category: 'melee_thrown',
    type: 'orbit',
    color: '#C0C0C0',
    trailColor: '#DC143C',
    rarity: 'legendary',
  },

  BOOMSTICK: {
    id: 'boomstick',
    name: 'Boomstick',
    icon: '💥💣',
    description: 'Modified shotgun that fires mini-explosives. Groovy.',

    requires: ['sawed_off', 'powder_keg'],
    requiresLevel: 8,

    baseCooldown: 1.0,
    baseDamage: 60,             // Per explosive
    baseProjectileCount: 4,     // 4 mini-explosives
    baseProjectileSpeed: 700,
    range: 400,
    pierce: 999,
    spread: 0.3,

    // Explosive properties
    explosionRadius: 80,
    explosionDelay: 0.1,        // Small delay on impact
    knockback: 25,              // Heavy knockback

    scaling: {
      cooldown: 0.90,
      damage: 1.28,
      count: 0.5,                 // +1 explosive every 2 levels
      pierce: 0,
    },

    maxLevel: 8,
    category: 'firearms',
    type: 'explosive',
    color: '#FF6347',
    trailColor: '#FFA500',
    rarity: 'legendary',
  },
};

// ========== EVOLUTION TRACKING ==========

const STORAGE_KEY = 'outlaws_evolutions_unlocked';

/**
 * Get all unlocked evolutions from localStorage
 */
export function getUnlockedEvolutions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading evolutions:', error);
    return [];
  }
}

/**
 * Save evolution unlock to localStorage
 */
export function unlockEvolution(evolutionId) {
  try {
    const unlocked = getUnlockedEvolutions();
    if (!unlocked.includes(evolutionId)) {
      unlocked.push(evolutionId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));

      // Track unlock time
      const statsKey = `outlaws_evolution_${evolutionId}_unlocked`;
      localStorage.setItem(statsKey, new Date().toISOString());
    }
  } catch (error) {
    console.error('Error unlocking evolution:', error);
  }
}

/**
 * Check if evolution is unlocked
 */
export function isEvolutionUnlocked(evolutionId) {
  const unlocked = getUnlockedEvolutions();
  return unlocked.includes(evolutionId);
}

/**
 * Get evolution stats (unlock time, etc.)
 */
export function getEvolutionStats(evolutionId) {
  try {
    const statsKey = `outlaws_evolution_${evolutionId}_unlocked`;
    const unlockedAt = localStorage.getItem(statsKey);

    return {
      unlocked: isEvolutionUnlocked(evolutionId),
      unlockedAt: unlockedAt || null,
    };
  } catch (error) {
    console.error('Error getting evolution stats:', error);
    return { unlocked: false, unlockedAt: null };
  }
}

/**
 * Reset all evolution progress
 */
export function resetEvolutionProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    Object.keys(EVOLUTIONS).forEach(key => {
      const evolutionId = EVOLUTIONS[key].id;
      localStorage.removeItem(`outlaws_evolution_${evolutionId}_unlocked`);
    });
  } catch (error) {
    console.error('Error resetting evolutions:', error);
  }
}

// ========== EVOLUTION CHECKING ==========

/**
 * Check if player has the required weapons at max level
 */
export function checkEvolutionEligibility(playerWeapons, evolutionId) {
  const evolution = Object.values(EVOLUTIONS).find(e => e.id === evolutionId);
  if (!evolution) return false;

  const requiredWeapons = evolution.requires;
  const requiredLevel = evolution.requiresLevel;

  // Check if player has both weapons at required level
  const hasAllWeapons = requiredWeapons.every(weaponId => {
    const weapon = playerWeapons.find(w => w.id === weaponId);
    return weapon && weapon.level >= requiredLevel;
  });

  return hasAllWeapons;
}

/**
 * Get all available evolutions for player's current weapons
 */
export function getAvailableEvolutions(playerWeapons) {
  const available = [];

  Object.values(EVOLUTIONS).forEach(evolution => {
    if (checkEvolutionEligibility(playerWeapons, evolution.id)) {
      available.push(evolution);
    }
  });

  return available;
}

/**
 * Check which weapons can be evolved
 */
export function getEvolvableWeaponPairs(playerWeapons) {
  const pairs = [];

  Object.values(EVOLUTIONS).forEach(evolution => {
    const weapon1 = playerWeapons.find(w => w.id === evolution.requires[0]);
    const weapon2 = playerWeapons.find(w => w.id === evolution.requires[1]);

    if (weapon1 && weapon2) {
      const canEvolve = weapon1.level >= evolution.requiresLevel &&
                       weapon2.level >= evolution.requiresLevel;

      pairs.push({
        evolution: evolution,
        weapon1: weapon1,
        weapon2: weapon2,
        canEvolve: canEvolve,
        progress: Math.min(weapon1.level, weapon2.level) / evolution.requiresLevel,
      });
    }
  });

  return pairs;
}

// ========== EVOLUTION PROCESS ==========

/**
 * Evolve weapons into their combined form
 * Returns the new weapon array with evolved weapon
 */
export function evolveWeapons(playerWeapons, evolutionId) {
  const evolution = Object.values(EVOLUTIONS).find(e => e.id === evolutionId);
  if (!evolution) {
    console.error(`Evolution ${evolutionId} not found`);
    return playerWeapons;
  }

  // Check eligibility
  if (!checkEvolutionEligibility(playerWeapons, evolutionId)) {
    console.error(`Not eligible for evolution ${evolutionId}`);
    return playerWeapons;
  }

  // Remove the two component weapons
  const newWeapons = playerWeapons.filter(
    w => !evolution.requires.includes(w.id)
  );

  // Add the evolved weapon at level 1
  const evolvedWeapon = {
    ...evolution,
    level: 1,
    id: evolution.id,
  };

  newWeapons.push(evolvedWeapon);

  // Track the evolution
  unlockEvolution(evolutionId);

  return newWeapons;
}

/**
 * Get evolution card data for UI
 */
export function getEvolutionCardData(evolution, weapon1, weapon2) {
  return {
    id: evolution.id,
    name: evolution.name,
    icon: evolution.icon,
    description: evolution.description,
    rarity: 'legendary',
    type: 'evolution',

    components: [
      {
        id: weapon1.id,
        name: weapon1.name,
        level: weapon1.level,
        maxLevel: weapon1.maxLevel,
      },
      {
        id: weapon2.id,
        name: weapon2.name,
        level: weapon2.level,
        maxLevel: weapon2.maxLevel,
      },
    ],

    stats: {
      damage: evolution.baseDamage,
      cooldown: evolution.baseCooldown.toFixed(2),
      projectileCount: evolution.baseProjectileCount,
      range: evolution.range,
    },

    specialProperties: getSpecialProperties(evolution),
  };
}

/**
 * Get special properties for display
 */
function getSpecialProperties(evolution) {
  const properties = [];

  if (evolution.explosiveRounds) {
    properties.push(`Explosive Rounds (${evolution.explosionRadius} radius)`);
  }
  if (evolution.burnDuration === 999) {
    properties.push('Permanent Fire');
  }
  if (evolution.orbitRadius) {
    properties.push(`Orbits Player (${evolution.orbitRadius} radius)`);
  }
  if (evolution.chainRange) {
    properties.push(`Chains to ${evolution.maxChains} enemies`);
  }
  if (evolution.maxBounces) {
    properties.push(`${evolution.maxBounces} bounces`);
  }
  if (evolution.bleedChance) {
    properties.push(`${Math.floor(evolution.bleedChance * 100)}% Bleed Chance`);
  }
  if (evolution.knockback) {
    properties.push(`Heavy Knockback (${evolution.knockback})`);
  }

  return properties;
}

// ========== HELPER FUNCTIONS ==========

/**
 * Get evolution by ID
 */
export function getEvolutionById(evolutionId) {
  return Object.values(EVOLUTIONS).find(e => e.id === evolutionId) || null;
}

/**
 * Get all evolutions
 */
export function getAllEvolutions() {
  return Object.values(EVOLUTIONS);
}

/**
 * Calculate DPS for evolved weapon
 */
export function calculateEvolutionDPS(evolution, level = 1) {
  const levelsGained = level - 1;

  const damage = Math.floor(
    evolution.baseDamage * Math.pow(evolution.scaling.damage, levelsGained)
  );
  const cooldown = evolution.baseCooldown * Math.pow(
    evolution.scaling.cooldown,
    levelsGained
  );
  const count = evolution.baseProjectileCount + Math.floor(
    levelsGained * evolution.scaling.count
  );

  if (cooldown === 0) {
    // For constant damage weapons (orbit)
    return Math.floor(damage * count / (evolution.hitRate || 0.2));
  }

  const shotsPerSecond = 1 / cooldown;
  return Math.floor(damage * count * shotsPerSecond);
}

/**
 * Get evolution display info for UI
 */
export function getEvolutionDisplayInfo(evolutionId) {
  const evolution = getEvolutionById(evolutionId);
  if (!evolution) return null;

  const stats = getEvolutionStats(evolutionId);

  return {
    id: evolution.id,
    name: evolution.name,
    icon: evolution.icon,
    description: evolution.description,
    category: evolution.category,
    type: evolution.type,
    rarity: evolution.rarity,

    requires: evolution.requires,
    requiresLevel: evolution.requiresLevel,

    dps: calculateEvolutionDPS(evolution, 1),

    stats: {
      damage: evolution.baseDamage,
      cooldown: evolution.baseCooldown.toFixed(2),
      projectileCount: evolution.baseProjectileCount,
      range: evolution.range,
    },

    specialProperties: getSpecialProperties(evolution),

    unlocked: stats.unlocked,
    unlockedAt: stats.unlockedAt,
  };
}

/**
 * Get next evolution hint for a weapon
 */
export function getEvolutionHint(weaponId) {
  const hints = [];

  Object.values(EVOLUTIONS).forEach(evolution => {
    if (evolution.requires.includes(weaponId)) {
      const otherWeapon = evolution.requires.find(id => id !== weaponId);
      hints.push({
        evolution: evolution.name,
        evolutionId: evolution.id,
        needsWeapon: otherWeapon,
        needsLevel: evolution.requiresLevel,
      });
    }
  });

  return hints;
}

/**
 * Create evolution notification data
 */
export function createEvolutionNotification(evolution) {
  return {
    id: generateId(),
    type: 'evolution_available',
    title: 'EVOLUTION AVAILABLE!',
    message: `${evolution.name} can now be created!`,
    icon: evolution.icon,
    evolutionId: evolution.id,
    rarity: 'legendary',
    timestamp: Date.now(),
    duration: 5000, // Show for 5 seconds
  };
}

/**
 * Get evolution achievement progress
 */
export function getEvolutionAchievementProgress() {
  const unlocked = getUnlockedEvolutions();
  const total = Object.keys(EVOLUTIONS).length;

  return {
    unlocked: unlocked.length,
    total: total,
    percentage: (unlocked.length / total) * 100,
    remaining: total - unlocked.length,
    evolutions: unlocked,
  };
}

// Export all evolutions for easy access
export default EVOLUTIONS;
