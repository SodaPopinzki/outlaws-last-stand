/**
 * Meta Progression System - Persistent upgrades and achievements
 *
 * Manages currencies, permanent upgrades, character unlocks, and achievements
 * All progress stored in localStorage for persistence
 */

// Currencies
export const CURRENCIES = {
  GOLD_NUGGETS: 'gold_nuggets',
  BOUNTY_STARS: 'bounty_stars',
};

// Permanent upgrade categories
export const UPGRADE_CATEGORIES = {
  STARTING_STATS: 'starting_stats',
  WEAPON_UNLOCKS: 'weapon_unlocks',
  CHARACTER_UNLOCKS: 'character_unlocks',
};

// Permanent stat upgrades
export const PERMANENT_STATS = {
  MAX_HP: {
    id: 'max_hp',
    name: 'Fortitude',
    icon: '❤️',
    description: '+10 Starting Max HP',
    maxLevel: 10,
    baseCost: 100,
    costScaling: 1.5, // Cost multiplier per level
    value: 10,
  },

  DAMAGE: {
    id: 'damage',
    name: 'Gunpowder Mastery',
    icon: '💥',
    description: '+5% Starting Damage',
    maxLevel: 10,
    baseCost: 150,
    costScaling: 1.5,
    value: 0.05,
  },

  SPEED: {
    id: 'speed',
    name: 'Swift Boots',
    icon: '👢',
    description: '+5% Starting Move Speed',
    maxLevel: 10,
    baseCost: 120,
    costScaling: 1.5,
    value: 0.05,
  },

  PICKUP: {
    id: 'pickup',
    name: 'Gold Magnet',
    icon: '🧲',
    description: '+10% Starting Pickup Radius',
    maxLevel: 10,
    baseCost: 100,
    costScaling: 1.5,
    value: 0.10,
  },

  LUCK: {
    id: 'luck',
    name: "Lucky Horseshoe",
    icon: '🍀',
    description: '+10% Starting Luck',
    maxLevel: 10,
    baseCost: 200,
    costScaling: 1.5,
    value: 0.10,
  },

  STARTING_LEVEL: {
    id: 'starting_level',
    name: 'Head Start',
    icon: '⭐',
    description: 'Start at Level 2 (then 3, 4)',
    maxLevel: 3,
    baseCost: 500,
    costScaling: 2.0, // More expensive
    value: 1,
  },

  REROLL: {
    id: 'reroll',
    name: 'Second Chance',
    icon: '🔄',
    description: '+1 Level-Up Reroll',
    maxLevel: 3,
    baseCost: 300,
    costScaling: 1.8,
    value: 1,
  },

  REVIVAL: {
    id: 'revival',
    name: 'Phoenix Feather',
    icon: '🪶',
    description: '+1 Revive (50% HP)',
    maxLevel: 2,
    baseCost: 1000,
    costScaling: 2.0,
    value: 1,
  },
};

// Achievement definitions
export const ACHIEVEMENTS = {
  // Kill milestones
  KILLS_100: {
    id: 'kills_100',
    name: 'Deputy',
    icon: '⭐',
    description: 'Kill 100 enemies',
    category: 'kills',
    requirement: 100,
    reward: { bountyStars: 1 },
  },

  KILLS_500: {
    id: 'kills_500',
    name: 'Marshal',
    icon: '⭐⭐',
    description: 'Kill 500 enemies',
    category: 'kills',
    requirement: 500,
    reward: { bountyStars: 2 },
  },

  KILLS_1000: {
    id: 'kills_1000',
    name: 'Sheriff',
    icon: '⭐⭐⭐',
    description: 'Kill 1,000 enemies',
    category: 'kills',
    requirement: 1000,
    reward: { bountyStars: 3 },
  },

  KILLS_5000: {
    id: 'kills_5000',
    name: 'Legend',
    icon: '⭐⭐⭐⭐',
    description: 'Kill 5,000 enemies',
    category: 'kills',
    requirement: 5000,
    reward: { bountyStars: 5 },
  },

  KILLS_10000: {
    id: 'kills_10000',
    name: 'Immortal',
    icon: '⭐⭐⭐⭐⭐',
    description: 'Kill 10,000 enemies',
    category: 'kills',
    requirement: 10000,
    reward: { bountyStars: 10 },
  },

  // Wave milestones
  WAVE_10: {
    id: 'wave_10',
    name: 'Survivor',
    icon: '🌊',
    description: 'Reach Wave 10',
    category: 'waves',
    requirement: 10,
    reward: { bountyStars: 1 },
  },

  WAVE_20: {
    id: 'wave_20',
    name: 'Veteran',
    icon: '🌊🌊',
    description: 'Reach Wave 20',
    category: 'waves',
    requirement: 20,
    reward: { bountyStars: 2 },
  },

  WAVE_30: {
    id: 'wave_30',
    name: 'Elite Survivor',
    icon: '🌊🌊🌊',
    description: 'Reach Wave 30',
    category: 'waves',
    requirement: 30,
    reward: { bountyStars: 3 },
  },

  WAVE_40: {
    id: 'wave_40',
    name: 'Unstoppable',
    icon: '🌊🌊🌊🌊',
    description: 'Reach Wave 40',
    category: 'waves',
    requirement: 40,
    reward: { bountyStars: 5 },
  },

  WAVE_50: {
    id: 'wave_50',
    name: 'Frontier Legend',
    icon: '🌊🌊🌊🌊🌊',
    description: 'Reach Wave 50',
    category: 'waves',
    requirement: 50,
    reward: { bountyStars: 10 },
  },

  // Time milestones (in seconds)
  TIME_5MIN: {
    id: 'time_5min',
    name: 'Quick Shooter',
    icon: '⏱️',
    description: 'Survive 5 minutes',
    category: 'time',
    requirement: 300,
    reward: { bountyStars: 1 },
  },

  TIME_10MIN: {
    id: 'time_10min',
    name: 'Endurance',
    icon: '⏱️⏱️',
    description: 'Survive 10 minutes',
    category: 'time',
    requirement: 600,
    reward: { bountyStars: 2 },
  },

  TIME_15MIN: {
    id: 'time_15min',
    name: 'Iron Will',
    icon: '⏱️⏱️⏱️',
    description: 'Survive 15 minutes',
    category: 'time',
    requirement: 900,
    reward: { bountyStars: 3 },
  },

  TIME_20MIN: {
    id: 'time_20min',
    name: 'Marathon Runner',
    icon: '⏱️⏱️⏱️⏱️',
    description: 'Survive 20 minutes',
    category: 'time',
    requirement: 1200,
    reward: { bountyStars: 5 },
  },

  TIME_30MIN: {
    id: 'time_30min',
    name: 'Untouchable',
    icon: '⏱️⏱️⏱️⏱️⏱️',
    description: 'Survive 30 minutes',
    category: 'time',
    requirement: 1800,
    reward: { bountyStars: 10 },
  },

  // Boss kills (one per boss)
  BOSS_BILLY: {
    id: 'boss_billy',
    name: 'Fast Draw',
    icon: '🤠',
    description: 'Defeat Billy the Kid',
    category: 'bosses',
    bossId: 'billy_the_kid',
    reward: { bountyStars: 1 },
  },

  BOSS_JESSE: {
    id: 'boss_jesse',
    name: 'Outlaw Hunter',
    icon: '💣',
    description: 'Defeat Jesse James',
    category: 'bosses',
    bossId: 'jesse_james',
    reward: { bountyStars: 1 },
  },

  BOSS_BUTCH: {
    id: 'boss_butch',
    name: 'Wild Bunch',
    icon: '🐎',
    description: 'Defeat Butch Cassidy',
    category: 'bosses',
    bossId: 'butch_cassidy',
    reward: { bountyStars: 2 },
  },

  BOSS_SUNDANCE: {
    id: 'boss_sundance',
    name: 'Dual Wield Master',
    icon: '☀️',
    description: 'Defeat The Sundance Kid',
    category: 'bosses',
    bossId: 'sundance_kid',
    reward: { bountyStars: 2 },
  },

  BOSS_JANE: {
    id: 'boss_jane',
    name: "Calamity's End",
    icon: '🪓',
    description: 'Defeat Calamity Jane',
    category: 'bosses',
    bossId: 'calamity_jane',
    reward: { bountyStars: 3 },
  },

  BOSS_DOC: {
    id: 'boss_doc',
    name: 'Deadly Dentist',
    icon: '☠️',
    description: 'Defeat Doc Holliday',
    category: 'bosses',
    bossId: 'doc_holliday',
    reward: { bountyStars: 3 },
  },

  BOSS_BILL_HICKOK: {
    id: 'boss_bill_hickok',
    name: 'Pistoleer Prince',
    icon: '🎯',
    description: 'Defeat Wild Bill Hickok',
    category: 'bosses',
    bossId: 'wild_bill_hickok',
    reward: { bountyStars: 4 },
  },

  BOSS_WYATT: {
    id: 'boss_wyatt',
    name: 'Lawman Legend',
    icon: '⭐',
    description: 'Defeat Wyatt Earp',
    category: 'bosses',
    bossId: 'wyatt_earp',
    reward: { bountyStars: 4 },
  },

  BOSS_BUFFALO: {
    id: 'boss_buffalo',
    name: 'Wild West Showdown',
    icon: '🦬',
    description: 'Defeat Buffalo Bill',
    category: 'bosses',
    bossId: 'buffalo_bill',
    reward: { bountyStars: 5 },
  },

  BOSS_NO_NAME: {
    id: 'boss_no_name',
    name: 'The New Legend',
    icon: '🎩',
    description: 'Defeat The Man with No Name',
    category: 'bosses',
    bossId: 'the_man_with_no_name',
    reward: { bountyStars: 10 },
  },

  // Evolution discoveries
  EVOLUTION_PEACEMAKER: {
    id: 'evolution_peacemaker',
    name: 'Peacemaker',
    icon: '🔫💥',
    description: 'Discover the Peacemaker evolution',
    category: 'evolutions',
    evolutionId: 'peacemaker',
    reward: { bountyStars: 2 },
  },

  EVOLUTION_HELLFIRE: {
    id: 'evolution_hellfire',
    name: 'Hellfire',
    icon: '🔥💀',
    description: 'Discover the Hellfire evolution',
    category: 'evolutions',
    evolutionId: 'hellfire',
    reward: { bountyStars: 2 },
  },

  EVOLUTION_DEATH_SPIN: {
    id: 'evolution_death_spin',
    name: 'Death Spin',
    icon: '🪓🌀',
    description: 'Discover the Death Spin evolution',
    category: 'evolutions',
    evolutionId: 'death_spin',
    reward: { bountyStars: 2 },
  },

  EVOLUTION_CURSE: {
    id: 'evolution_curse',
    name: 'Curse of the West',
    icon: '☠️📜',
    description: 'Discover the Curse of the West',
    category: 'evolutions',
    evolutionId: 'curse_of_the_west',
    reward: { bountyStars: 2 },
  },

  EVOLUTION_LEAD_STORM: {
    id: 'evolution_lead_storm',
    name: 'Lead Storm',
    icon: '⚙️⭐',
    description: 'Discover the Lead Storm evolution',
    category: 'evolutions',
    evolutionId: 'lead_storm',
    reward: { bountyStars: 2 },
  },

  EVOLUTION_WHIRLWIND: {
    id: 'evolution_whirlwind',
    name: 'Whirlwind',
    icon: '🌪️🔪',
    description: 'Discover the Whirlwind evolution',
    category: 'evolutions',
    evolutionId: 'whirlwind',
    reward: { bountyStars: 2 },
  },

  EVOLUTION_BOOMSTICK: {
    id: 'evolution_boomstick',
    name: 'Boomstick',
    icon: '💥💣',
    description: 'Discover the Boomstick evolution',
    category: 'evolutions',
    evolutionId: 'boomstick',
    reward: { bountyStars: 2 },
  },

  // Perfect waves
  PERFECT_WAVE_1: {
    id: 'perfect_wave_1',
    name: 'Untouched',
    icon: '💚',
    description: 'Complete 1 wave without taking damage',
    category: 'perfect_waves',
    requirement: 1,
    reward: { bountyStars: 1 },
  },

  PERFECT_WAVE_5: {
    id: 'perfect_wave_5',
    name: 'Dodge Master',
    icon: '💚💚',
    description: 'Complete 5 waves without taking damage',
    category: 'perfect_waves',
    requirement: 5,
    reward: { bountyStars: 3 },
  },

  PERFECT_WAVE_10: {
    id: 'perfect_wave_10',
    name: 'Ghost',
    icon: '💚💚💚',
    description: 'Complete 10 waves without taking damage',
    category: 'perfect_waves',
    requirement: 10,
    reward: { bountyStars: 5 },
  },
};

/**
 * MetaProgression - Manages persistent upgrades and achievements
 */
export class MetaProgression {
  constructor() {
    this.storageKey = 'outlaws_meta_progression';
    this.data = this.loadFromStorage();
  }

  /**
   * Load progress from localStorage
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load meta progression:', error);
    }

    // Default data structure
    return {
      currencies: {
        [CURRENCIES.GOLD_NUGGETS]: 0,
        [CURRENCIES.BOUNTY_STARS]: 0,
      },
      permanentUpgrades: {}, // { stat_id: level }
      weaponUnlocks: [],      // Array of unlocked weapon IDs
      characterUnlocks: [],   // Array of unlocked character IDs
      achievements: {},       // { achievement_id: { unlocked: true, timestamp } }
      stats: {
        totalKills: 0,
        totalGold: 0,
        totalStars: 0,
        maxWave: 0,
        maxTime: 0,
        totalRuns: 0,
        bossesDefeated: [],
        evolutionsDiscovered: [],
        perfectWaves: 0,
      },
    };
  }

  /**
   * Save progress to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save meta progression:', error);
    }
  }

  /**
   * Add currency
   */
  addCurrency(currencyType, amount) {
    this.data.currencies[currencyType] = (this.data.currencies[currencyType] || 0) + amount;

    // Track total earned
    if (currencyType === CURRENCIES.GOLD_NUGGETS) {
      this.data.stats.totalGold += amount;
    } else if (currencyType === CURRENCIES.BOUNTY_STARS) {
      this.data.stats.totalStars += amount;
    }

    this.saveToStorage();
  }

  /**
   * Get currency amount
   */
  getCurrency(currencyType) {
    return this.data.currencies[currencyType] || 0;
  }

  /**
   * Spend currency (returns true if successful)
   */
  spendCurrency(currencyType, amount) {
    const current = this.getCurrency(currencyType);
    if (current >= amount) {
      this.data.currencies[currencyType] -= amount;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Get permanent upgrade level
   */
  getUpgradeLevel(statId) {
    return this.data.permanentUpgrades[statId] || 0;
  }

  /**
   * Calculate upgrade cost
   */
  getUpgradeCost(statId) {
    const stat = PERMANENT_STATS[statId.toUpperCase()];
    if (!stat) return 0;

    const currentLevel = this.getUpgradeLevel(statId);
    if (currentLevel >= stat.maxLevel) return 0;

    return Math.floor(stat.baseCost * Math.pow(stat.costScaling, currentLevel));
  }

  /**
   * Purchase permanent upgrade
   */
  purchaseUpgrade(statId) {
    const stat = PERMANENT_STATS[statId.toUpperCase()];
    if (!stat) return false;

    const currentLevel = this.getUpgradeLevel(statId);
    if (currentLevel >= stat.maxLevel) return false;

    const cost = this.getUpgradeCost(statId);
    if (!this.spendCurrency(CURRENCIES.GOLD_NUGGETS, cost)) {
      return false;
    }

    this.data.permanentUpgrades[statId] = currentLevel + 1;
    this.saveToStorage();
    return true;
  }

  /**
   * Get all permanent stat bonuses
   */
  getPermanentStatBonuses() {
    const bonuses = {};

    Object.entries(this.data.permanentUpgrades).forEach(([statId, level]) => {
      const stat = PERMANENT_STATS[statId.toUpperCase()];
      if (stat) {
        bonuses[statId] = stat.value * level;
      }
    });

    return bonuses;
  }

  /**
   * Unlock weapon for starting loadout
   */
  unlockWeapon(weaponId) {
    if (!this.data.weaponUnlocks.includes(weaponId)) {
      this.data.weaponUnlocks.push(weaponId);
      this.saveToStorage();
    }
  }

  /**
   * Check if weapon is unlocked
   */
  isWeaponUnlocked(weaponId) {
    return this.data.weaponUnlocks.includes(weaponId);
  }

  /**
   * Get all unlocked weapons
   */
  getUnlockedWeapons() {
    return [...this.data.weaponUnlocks];
  }

  /**
   * Unlock character
   */
  unlockCharacter(characterId, cost = 0) {
    if (this.data.characterUnlocks.includes(characterId)) {
      return false; // Already unlocked
    }

    if (cost > 0 && !this.spendCurrency(CURRENCIES.BOUNTY_STARS, cost)) {
      return false; // Not enough stars
    }

    this.data.characterUnlocks.push(characterId);
    this.saveToStorage();
    return true;
  }

  /**
   * Check if character is unlocked
   */
  isCharacterUnlocked(characterId) {
    return this.data.characterUnlocks.includes(characterId);
  }

  /**
   * Check and unlock achievement
   */
  checkAchievement(achievementId, value = 1) {
    const achievement = ACHIEVEMENTS[achievementId.toUpperCase()];
    if (!achievement) return false;

    // Already unlocked
    if (this.data.achievements[achievementId]?.unlocked) {
      return false;
    }

    let unlocked = false;

    // Check requirement based on category
    switch (achievement.category) {
      case 'kills':
        unlocked = this.data.stats.totalKills >= achievement.requirement;
        break;

      case 'waves':
        unlocked = this.data.stats.maxWave >= achievement.requirement;
        break;

      case 'time':
        unlocked = this.data.stats.maxTime >= achievement.requirement;
        break;

      case 'bosses':
        unlocked = this.data.stats.bossesDefeated.includes(achievement.bossId);
        break;

      case 'evolutions':
        unlocked = this.data.stats.evolutionsDiscovered.includes(achievement.evolutionId);
        break;

      case 'perfect_waves':
        unlocked = this.data.stats.perfectWaves >= achievement.requirement;
        break;

      default:
        unlocked = false;
    }

    if (unlocked) {
      this.unlockAchievement(achievementId);
      return true;
    }

    return false;
  }

  /**
   * Unlock achievement and grant rewards
   */
  unlockAchievement(achievementId) {
    const achievement = ACHIEVEMENTS[achievementId.toUpperCase()];
    if (!achievement) return;

    this.data.achievements[achievementId] = {
      unlocked: true,
      timestamp: Date.now(),
    };

    // Grant rewards
    if (achievement.reward.bountyStars) {
      this.addCurrency(CURRENCIES.BOUNTY_STARS, achievement.reward.bountyStars);
    }

    if (achievement.reward.goldNuggets) {
      this.addCurrency(CURRENCIES.GOLD_NUGGETS, achievement.reward.goldNuggets);
    }

    this.saveToStorage();
  }

  /**
   * Check if achievement is unlocked
   */
  isAchievementUnlocked(achievementId) {
    return this.data.achievements[achievementId]?.unlocked || false;
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress(achievementId) {
    const achievement = ACHIEVEMENTS[achievementId.toUpperCase()];
    if (!achievement) return { current: 0, required: 0, percent: 0 };

    let current = 0;

    switch (achievement.category) {
      case 'kills':
        current = this.data.stats.totalKills;
        break;
      case 'waves':
        current = this.data.stats.maxWave;
        break;
      case 'time':
        current = this.data.stats.maxTime;
        break;
      case 'perfect_waves':
        current = this.data.stats.perfectWaves;
        break;
      case 'bosses':
        current = this.data.stats.bossesDefeated.includes(achievement.bossId) ? 1 : 0;
        break;
      case 'evolutions':
        current = this.data.stats.evolutionsDiscovered.includes(achievement.evolutionId) ? 1 : 0;
        break;
    }

    const required = achievement.requirement || 1;

    return {
      current: Math.min(current, required),
      required,
      percent: Math.min((current / required) * 100, 100),
    };
  }

  /**
   * Update stats after run
   */
  updateRunStats(runStats) {
    // Update totals
    this.data.stats.totalKills += runStats.kills || 0;
    this.data.stats.maxWave = Math.max(this.data.stats.maxWave, runStats.wave || 0);
    this.data.stats.maxTime = Math.max(this.data.stats.maxTime, runStats.time || 0);
    this.data.stats.totalRuns += 1;

    // Update bosses defeated
    if (runStats.bossesDefeated) {
      runStats.bossesDefeated.forEach(bossId => {
        if (!this.data.stats.bossesDefeated.includes(bossId)) {
          this.data.stats.bossesDefeated.push(bossId);
        }
      });
    }

    // Update evolutions discovered
    if (runStats.evolutionsDiscovered) {
      runStats.evolutionsDiscovered.forEach(evolutionId => {
        if (!this.data.stats.evolutionsDiscovered.includes(evolutionId)) {
          this.data.stats.evolutionsDiscovered.push(evolutionId);
        }
      });
    }

    // Update perfect waves
    if (runStats.perfectWaves) {
      this.data.stats.perfectWaves += runStats.perfectWaves;
    }

    // Add gold earned
    if (runStats.goldEarned) {
      this.addCurrency(CURRENCIES.GOLD_NUGGETS, runStats.goldEarned);
    }

    this.saveToStorage();

    // Check all achievements
    this.checkAllAchievements();
  }

  /**
   * Check all achievements for unlocks
   */
  checkAllAchievements() {
    Object.keys(ACHIEVEMENTS).forEach(achievementId => {
      this.checkAchievement(achievementId.toLowerCase());
    });
  }

  /**
   * Get all achievements with progress
   */
  getAllAchievements() {
    return Object.entries(ACHIEVEMENTS).map(([key, achievement]) => {
      const id = key.toLowerCase();
      return {
        ...achievement,
        id,
        unlocked: this.isAchievementUnlocked(id),
        progress: this.getAchievementProgress(id),
      };
    });
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category) {
    return this.getAllAchievements().filter(a => a.category === category);
  }

  /**
   * Get total achievement completion
   */
  getAchievementCompletion() {
    const total = Object.keys(ACHIEVEMENTS).length;
    const unlocked = Object.values(this.data.achievements).filter(a => a.unlocked).length;

    return {
      unlocked,
      total,
      percent: (unlocked / total) * 100,
    };
  }

  /**
   * Reset all progress (for testing or new save)
   */
  resetProgress() {
    this.data = this.loadFromStorage.call({ storageKey: 'outlaws_meta_progression_backup' });
    localStorage.removeItem(this.storageKey);
    this.data = this.loadFromStorage();
    this.saveToStorage();
  }

  /**
   * Export progress data
   */
  exportData() {
    return JSON.stringify(this.data);
  }

  /**
   * Import progress data
   */
  importData(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.data = imported;
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

/**
 * Helper: Create meta progression instance
 */
export function createMetaProgression() {
  return new MetaProgression();
}

/**
 * Helper: Format currency display
 */
export function formatCurrency(amount) {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

/**
 * Helper: Get currency icon
 */
export function getCurrencyIcon(currencyType) {
  switch (currencyType) {
    case CURRENCIES.GOLD_NUGGETS:
      return '💰';
    case CURRENCIES.BOUNTY_STARS:
      return '⭐';
    default:
      return '❓';
  }
}
