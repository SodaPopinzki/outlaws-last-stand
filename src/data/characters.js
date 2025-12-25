// Player character definitions for Outlaw's Last Stand

// Unlock condition types
export const UNLOCK_TYPES = {
  DEFAULT: 'default',
  TOTAL_KILLS: 'total_kills',
  REACH_WAVE: 'reach_wave',
  COLLECT_XP: 'collect_xp',
  POISON_DAMAGE: 'poison_damage',
  DISTANCE_TRAVELED: 'distance_traveled',
  PROJECTILES_FIRED: 'projectiles_fired',
  BOSSES_KILLED: 'bosses_killed',
};

// Character definitions
export const CHARACTERS = {
  DRIFTER: {
    id: 'drifter',
    name: 'The Drifter',
    title: 'Wandering Gunslinger',
    description: 'A lone wanderer with a mysterious past. Balanced stats make him perfect for beginners.',

    baseStats: {
      hp: 100,
      speed: 180,
      pickup: 60,
      damage: 1.0,
      luck: 1.0,
    },

    startingWeapon: 'six_shooter',

    passive: {
      name: 'Lone Wolf',
      description: '+10% damage when fighting alone',
      effect: {
        type: 'damage_boost',
        value: 0.10,
        condition: 'solo', // No allies nearby
      },
    },

    unlockCondition: {
      type: UNLOCK_TYPES.DEFAULT,
      value: 0,
      description: 'Available from start',
    },

    appearance: {
      primaryColor: '#8B7355',    // Brown duster coat
      secondaryColor: '#4A4A4A',  // Dark gray
      accentColor: '#C9A55A',     // Gold buckle
      hatColor: '#5C4033',        // Dark brown hat
      size: 16,
    },

    isUnlocked: true,
  },

  OUTLAW: {
    id: 'outlaw',
    name: 'The Outlaw',
    title: 'Wanted Dead or Alive',
    description: 'A ruthless bandit with a price on his head. Gains XP faster but fragile.',

    baseStats: {
      hp: 80,
      speed: 200,
      pickup: 50,
      damage: 1.05,
      luck: 1.2,
    },

    startingWeapon: 'sawed_off',

    passive: {
      name: 'Wanted Dead',
      description: '+20% XP from kills, -10% max HP',
      effect: {
        type: 'xp_and_health',
        xpMultiplier: 1.20,
        hpMultiplier: 0.90,
      },
    },

    unlockCondition: {
      type: UNLOCK_TYPES.TOTAL_KILLS,
      value: 500,
      description: 'Kill 500 enemies total across all runs',
    },

    appearance: {
      primaryColor: '#8B0000',    // Dark red bandana
      secondaryColor: '#2F2F2F',  // Black vest
      accentColor: '#FFD700',     // Gold bullets
      hatColor: '#1C1C1C',        // Black hat
      size: 16,
    },

    get isUnlocked() {
      return checkUnlockCondition(this.unlockCondition);
    },
  },

  MARSHAL: {
    id: 'marshal',
    name: 'The Marshal',
    title: 'Lawman of the West',
    description: 'A veteran lawman bringing order to chaos. High durability and damage reduction.',

    baseStats: {
      hp: 120,
      speed: 160,
      pickup: 70,
      damage: 0.95,
      luck: 0.9,
    },

    startingWeapon: 'deputy_star',

    passive: {
      name: 'Law & Order',
      description: 'Enemies deal 15% less damage to you',
      effect: {
        type: 'damage_reduction',
        value: 0.15,
      },
    },

    unlockCondition: {
      type: UNLOCK_TYPES.REACH_WAVE,
      value: 15,
      description: 'Survive to Wave 15 in any run',
    },

    appearance: {
      primaryColor: '#4169E1',    // Royal blue uniform
      secondaryColor: '#C0C0C0',  // Silver badge
      accentColor: '#FFD700',     // Gold star
      hatColor: '#2F4F4F',        // Dark slate hat
      size: 18,
    },

    get isUnlocked() {
      return checkUnlockCondition(this.unlockCondition);
    },
  },

  PROSPECTOR: {
    id: 'prospector',
    name: 'The Prospector',
    title: 'Gold Rush Veteran',
    description: 'A treasure hunter with keen eyes. Massive pickup radius and finds bonus gold.',

    baseStats: {
      hp: 90,
      speed: 170,
      pickup: 100,
      damage: 0.90,
      luck: 1.5,
    },

    startingWeapon: 'dynamite',

    passive: {
      name: 'Gold Rush',
      description: '+50% pickup radius, enemies drop gold nuggets',
      effect: {
        type: 'pickup_and_gold',
        pickupMultiplier: 1.50,
        goldChance: 0.10, // 10% chance for gold drops
      },
    },

    unlockCondition: {
      type: UNLOCK_TYPES.COLLECT_XP,
      value: 1000,
      description: 'Collect 1000 XP in a single run',
    },

    appearance: {
      primaryColor: '#CD853F',    // Peru brown work clothes
      secondaryColor: '#DAA520',  // Goldenrod
      accentColor: '#FFD700',     // Gold nuggets
      hatColor: '#8B4513',        // Saddle brown
      size: 16,
    },

    get isUnlocked() {
      return checkUnlockCondition(this.unlockCondition);
    },
  },

  SHAMAN: {
    id: 'shaman',
    name: 'The Shaman',
    title: 'Spirit Walker',
    description: 'A mystic channeling ancient spirits. Poison specialist with life steal.',

    baseStats: {
      hp: 70,
      speed: 190,
      pickup: 55,
      damage: 1.15,
      luck: 1.1,
    },

    startingWeapon: 'snake_oil',

    passive: {
      name: 'Spirit Walk',
      description: 'Poison damage +30%, heal for 5% of damage dealt',
      effect: {
        type: 'poison_and_lifesteal',
        poisonMultiplier: 1.30,
        lifeSteal: 0.05,
      },
    },

    unlockCondition: {
      type: UNLOCK_TYPES.POISON_DAMAGE,
      value: 10000,
      description: 'Deal 10,000 poison damage total',
    },

    appearance: {
      primaryColor: '#228B22',    // Forest green robes
      secondaryColor: '#800080',  // Purple spirit energy
      accentColor: '#9400D3',     // Dark violet
      hatColor: '#2F4F2F',        // Dark green hood
      size: 16,
    },

    get isUnlocked() {
      return checkUnlockCondition(this.unlockCondition);
    },
  },

  CAVALRY: {
    id: 'cavalry',
    name: 'The Cavalry',
    title: 'Horse Rider',
    description: 'A mounted soldier charging into battle. Highest speed and mobility.',

    baseStats: {
      hp: 110,
      speed: 220,
      pickup: 45,
      damage: 1.0,
      luck: 0.95,
    },

    startingWeapon: 'horse_charge',

    passive: {
      name: 'Ride Hard',
      description: 'Horse ability cooldown -30%, movement speed +20%',
      effect: {
        type: 'mobility_boost',
        cooldownReduction: 0.30,
        speedMultiplier: 1.20,
      },
    },

    unlockCondition: {
      type: UNLOCK_TYPES.DISTANCE_TRAVELED,
      value: 50000,
      description: 'Travel 50,000 units total across all runs',
    },

    appearance: {
      primaryColor: '#000080',    // Navy blue uniform
      secondaryColor: '#FFD700',  // Gold cavalry stripes
      accentColor: '#B22222',     // Firebrick red
      hatColor: '#191970',        // Midnight blue cap
      size: 20,
    },

    get isUnlocked() {
      return checkUnlockCondition(this.unlockCondition);
    },
  },

  GUNSLINGER: {
    id: 'gunslinger',
    name: 'The Gunslinger',
    title: 'Quick Draw Expert',
    description: 'A legendary marksman with lightning reflexes. All weapons fire faster.',

    baseStats: {
      hp: 60,
      speed: 160,
      pickup: 50,
      damage: 1.25,
      luck: 1.0,
    },

    startingWeapon: 'gatling_gun',

    passive: {
      name: 'Trigger Happy',
      description: 'All projectile weapons fire 25% faster',
      effect: {
        type: 'fire_rate_boost',
        fireRateMultiplier: 1.25,
      },
    },

    unlockCondition: {
      type: UNLOCK_TYPES.PROJECTILES_FIRED,
      value: 10000,
      description: 'Fire 10,000 projectiles total across all runs',
    },

    appearance: {
      primaryColor: '#DC143C',    // Crimson coat
      secondaryColor: '#2F2F2F',  // Dark gray
      accentColor: '#C0C0C0',     // Silver revolvers
      hatColor: '#8B0000',        // Dark red hat
      size: 16,
    },

    get isUnlocked() {
      return checkUnlockCondition(this.unlockCondition);
    },
  },

  HANGMAN: {
    id: 'hangman',
    name: 'The Hangman',
    title: 'Executioner',
    description: 'A grim enforcer of frontier justice. Slows and executes weakened enemies.',

    baseStats: {
      hp: 100,
      speed: 175,
      pickup: 65,
      damage: 1.10,
      luck: 1.0,
    },

    startingWeapon: 'lasso',

    passive: {
      name: 'Noose Tightens',
      description: 'Slowed enemies take +25% damage from all sources',
      effect: {
        type: 'slow_amplification',
        damageMultiplier: 1.25,
        slowThreshold: 0.5, // Enemies at 50% or less speed
      },
    },

    unlockCondition: {
      type: UNLOCK_TYPES.BOSSES_KILLED,
      value: 100,
      description: 'Kill 100 bosses total across all runs',
    },

    appearance: {
      primaryColor: '#1C1C1C',    // Almost black
      secondaryColor: '#696969',  // Dim gray
      accentColor: '#8B4513',     // Saddle brown rope
      hatColor: '#000000',        // Pure black
      size: 18,
    },

    get isUnlocked() {
      return checkUnlockCondition(this.unlockCondition);
    },
  },
};

// Default character (The Drifter)
export const DEFAULT_CHARACTER = CHARACTERS.DRIFTER;

// Get all characters as array
export function getAllCharacters() {
  return Object.values(CHARACTERS);
}

// Get unlocked characters
export function getUnlockedCharacters() {
  return getAllCharacters().filter((char) => char.isUnlocked);
}

// Get locked characters
export function getLockedCharacters() {
  return getAllCharacters().filter((char) => !char.isUnlocked);
}

// Get character by ID
export function getCharacterById(id) {
  return Object.values(CHARACTERS).find((char) => char.id === id) || DEFAULT_CHARACTER;
}

// Check if character is unlocked
export function isCharacterUnlocked(characterId) {
  const character = getCharacterById(characterId);
  return character.isUnlocked;
}

// Save/load unlock progress from localStorage
const STORAGE_KEY = 'outlaws_character_progress';

export function saveCharacterProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save character progress:', error);
  }
}

export function loadCharacterProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : getDefaultProgress();
  } catch (error) {
    console.warn('Failed to load character progress:', error);
    return getDefaultProgress();
  }
}

function getDefaultProgress() {
  return {
    totalKills: 0,
    maxWaveReached: 0,
    maxXpCollected: 0,
    totalPoisonDamage: 0,
    totalDistanceTraveled: 0,
    totalProjectilesFired: 0,
    totalBossesKilled: 0,
  };
}

// Check unlock condition
export function checkUnlockCondition(condition) {
  if (condition.type === UNLOCK_TYPES.DEFAULT) {
    return true;
  }

  const progress = loadCharacterProgress();

  switch (condition.type) {
    case UNLOCK_TYPES.TOTAL_KILLS:
      return progress.totalKills >= condition.value;

    case UNLOCK_TYPES.REACH_WAVE:
      return progress.maxWaveReached >= condition.value;

    case UNLOCK_TYPES.COLLECT_XP:
      return progress.maxXpCollected >= condition.value;

    case UNLOCK_TYPES.POISON_DAMAGE:
      return progress.totalPoisonDamage >= condition.value;

    case UNLOCK_TYPES.DISTANCE_TRAVELED:
      return progress.totalDistanceTraveled >= condition.value;

    case UNLOCK_TYPES.PROJECTILES_FIRED:
      return progress.totalProjectilesFired >= condition.value;

    case UNLOCK_TYPES.BOSSES_KILLED:
      return progress.totalBossesKilled >= condition.value;

    default:
      return false;
  }
}

// Update progress (call this during gameplay)
export function updateCharacterProgress(updates) {
  const progress = loadCharacterProgress();
  const newProgress = { ...progress, ...updates };
  saveCharacterProgress(newProgress);
  return newProgress;
}

// Get unlock progress for a character (0-1)
export function getUnlockProgress(character) {
  if (character.unlockCondition.type === UNLOCK_TYPES.DEFAULT) {
    return 1;
  }

  const progress = loadCharacterProgress();
  let current = 0;

  switch (character.unlockCondition.type) {
    case UNLOCK_TYPES.TOTAL_KILLS:
      current = progress.totalKills;
      break;
    case UNLOCK_TYPES.REACH_WAVE:
      current = progress.maxWaveReached;
      break;
    case UNLOCK_TYPES.COLLECT_XP:
      current = progress.maxXpCollected;
      break;
    case UNLOCK_TYPES.POISON_DAMAGE:
      current = progress.totalPoisonDamage;
      break;
    case UNLOCK_TYPES.DISTANCE_TRAVELED:
      current = progress.totalDistanceTraveled;
      break;
    case UNLOCK_TYPES.PROJECTILES_FIRED:
      current = progress.totalProjectilesFired;
      break;
    case UNLOCK_TYPES.BOSSES_KILLED:
      current = progress.totalBossesKilled;
      break;
    default:
      return 0;
  }

  return Math.min(1, current / character.unlockCondition.value);
}

// Apply character passive effects to player stats
export function applyCharacterPassive(character, baseStats) {
  const stats = { ...baseStats };
  const passive = character.passive.effect;

  switch (passive.type) {
    case 'damage_boost':
      stats.damage *= 1 + passive.value;
      break;

    case 'xp_and_health':
      stats.maxHp *= passive.hpMultiplier;
      break;

    case 'damage_reduction':
      stats.armor = (stats.armor || 0) + (passive.value * 100); // Convert to armor points
      break;

    case 'pickup_and_gold':
      stats.pickupRange *= passive.pickupMultiplier;
      break;

    case 'poison_and_lifesteal':
      // These are applied during damage calculation
      break;

    case 'mobility_boost':
      stats.moveSpeed *= passive.speedMultiplier;
      break;

    case 'fire_rate_boost':
      stats.fireRate *= passive.fireRateMultiplier;
      break;

    case 'slow_amplification':
      // Applied during damage calculation
      break;

    default:
      break;
  }

  return stats;
}
