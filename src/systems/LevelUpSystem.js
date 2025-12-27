/**
 * Level Up System - Generates upgrade options when player levels up
 *
 * Manages upgrade priorities, weapon evolution offers, and stat bonuses
 */

import { getAvailableEvolutions, getEvolutionCardData } from './WeaponEvolution.js';
import { WEAPONS } from '../data/weapons.js';

// Upgrade types
export const UPGRADE_TYPES = {
  WEAPON_UPGRADE: 'weaponUpgrade',
  NEW_WEAPON: 'newWeapon',
  WEAPON_EVOLUTION: 'weaponEvolution',
  STAT_UPGRADE: 'statUpgrade',
};

// Stat upgrade definitions
export const STAT_UPGRADES = {
  MAX_HP: {
    id: 'max_hp',
    name: 'Iron Heart',
    icon: '❤️',
    description: '+20 Max HP',
    shortDesc: '+20 HP',
    value: 20,
    stackable: true,
    maxStacks: 10,
    apply: (player) => {
      player.maxHealth += 20;
      player.health = Math.min(player.health + 20, player.maxHealth); // Heal when upgrading
    },
  },

  MOVE_SPEED: {
    id: 'move_speed',
    name: 'Quick Draw',
    icon: '⚡',
    description: '+15% Move Speed',
    shortDesc: '+15% Speed',
    value: 0.15,
    stackable: true,
    maxStacks: 5,
    apply: (player) => {
      player.stats.moveSpeed = (player.stats.moveSpeed || 1.0) + 0.15;
    },
  },

  DAMAGE: {
    id: 'damage',
    name: 'Sharpshooter',
    icon: '💥',
    description: '+15% Damage',
    shortDesc: '+15% DMG',
    value: 0.15,
    stackable: true,
    maxStacks: 8,
    apply: (player) => {
      player.stats.damage = (player.stats.damage || 1.0) + 0.15;
    },
  },

  PICKUP_RADIUS: {
    id: 'pickup_radius',
    name: 'Magnetism',
    icon: '🧲',
    description: '+30% Pickup Radius',
    shortDesc: '+30% Range',
    value: 0.30,
    stackable: true,
    maxStacks: 5,
    apply: (player) => {
      player.stats.pickupRange = (player.stats.pickupRange || 1.0) + 0.30;
    },
  },

  LUCK: {
    id: 'luck',
    name: "Gambler's Fortune",
    icon: '🍀',
    description: '+20% Luck (Better drops & crits)',
    shortDesc: '+20% Luck',
    value: 0.20,
    stackable: true,
    maxStacks: 5,
    apply: (player) => {
      player.stats.luck = (player.stats.luck || 1.0) + 0.20;
    },
  },

  REGEN: {
    id: 'regen',
    name: 'Healing Factor',
    icon: '💚',
    description: '+1 HP/sec Regeneration',
    shortDesc: '+1 HP/s',
    value: 1,
    stackable: true,
    maxStacks: 10,
    apply: (player) => {
      player.stats.regen = (player.stats.regen || 0) + 1;
    },
  },

  ARMOR: {
    id: 'armor',
    name: 'Thick Hide',
    icon: '🛡️',
    description: '+5% Damage Reduction',
    shortDesc: '+5% Armor',
    value: 0.05,
    stackable: true,
    maxStacks: 6, // Max 30% damage reduction
    apply: (player) => {
      player.stats.armor = (player.stats.armor || 0) + 0.05;
    },
  },

  CRITICAL: {
    id: 'critical',
    name: 'Deadeye',
    icon: '🎯',
    description: '+10% Critical Chance',
    shortDesc: '+10% Crit',
    value: 0.10,
    stackable: true,
    maxStacks: 5, // Max 50% crit
    apply: (player) => {
      player.stats.critChance = (player.stats.critChance || 0) + 0.10;
    },
  },

  COOLDOWN: {
    id: 'cooldown',
    name: 'Rapid Fire',
    icon: '⏱️',
    description: '-10% Weapon Cooldowns',
    shortDesc: '-10% Cooldown',
    value: -0.10,
    stackable: true,
    maxStacks: 5, // Max 50% cooldown reduction
    apply: (player) => {
      player.stats.cooldownReduction = (player.stats.cooldownReduction || 0) + 0.10;
    },
  },

  PIERCE: {
    id: 'pierce',
    name: 'Penetrating Rounds',
    icon: '🔫',
    description: '+1 Pierce to all weapons',
    shortDesc: '+1 Pierce',
    value: 1,
    stackable: true,
    maxStacks: 5,
    apply: (player) => {
      player.stats.pierce = (player.stats.pierce || 0) + 1;
    },
  },

  PROJECTILE_SPEED: {
    id: 'projectile_speed',
    name: 'High Velocity',
    icon: '💨',
    description: '+20% Projectile Speed',
    shortDesc: '+20% Proj Speed',
    value: 0.20,
    stackable: true,
    maxStacks: 4,
    apply: (player) => {
      player.stats.projectileSpeed = (player.stats.projectileSpeed || 1.0) + 0.20;
    },
  },

  CRIT_DAMAGE: {
    id: 'crit_damage',
    name: 'Executioner',
    icon: '💀',
    description: '+50% Critical Damage',
    shortDesc: '+50% Crit DMG',
    value: 0.50,
    stackable: true,
    maxStacks: 4,
    apply: (player) => {
      player.stats.critDamage = (player.stats.critDamage || 1.5) + 0.50;
    },
  },
};

/**
 * LevelUpSystem - Generates upgrade options for player
 */
export class LevelUpSystem {
  constructor() {
    // Track which stat upgrades have been taken
    this.statUpgradeCounts = new Map();

    // Track last offered upgrades (avoid repeats)
    this.lastOfferedUpgrades = [];
  }

  /**
   * Generate 4 upgrade options for player
   */
  generateUpgradeOptions(player, waveNumber = 1) {
    const options = [];

    // Priority 1: Weapon evolutions (always offer if available)
    const evolutionOptions = this.getEvolutionOptions(player);
    options.push(...evolutionOptions);

    // Priority 2: Existing weapon upgrades (60% chance each)
    const weaponUpgradeOptions = this.getWeaponUpgradeOptions(player);
    options.push(...weaponUpgradeOptions);

    // Priority 3: New weapons (if slot available and not too many weapons)
    const newWeaponOptions = this.getNewWeaponOptions(player, 2);
    options.push(...newWeaponOptions);

    // Priority 4: Stat upgrades (fill remaining slots)
    const statOptions = this.getStatUpgradeOptions(player, 4 - options.length);
    options.push(...statOptions);

    // Ensure we have exactly 4 options (or less if truly no options)
    const shuffled = this.shuffleArray([...options]);
    const finalOptions = shuffled.slice(0, 4);

    // Track last offered
    this.lastOfferedUpgrades = finalOptions.map(opt => opt.id || opt.weaponId || opt.statId);

    return finalOptions;
  }

  /**
   * Get weapon evolution options
   */
  getEvolutionOptions(player) {
    const playerWeapons = player.weapons || [];
    const availableEvolutions = getAvailableEvolutions(playerWeapons);

    return availableEvolutions.map((evolutionId) => {
      const evolutionData = getEvolutionCardData(evolutionId);

      return {
        type: UPGRADE_TYPES.WEAPON_EVOLUTION,
        evolutionId: evolutionId,
        id: `evolution_${evolutionId}`,
        name: evolutionData.name,
        icon: evolutionData.icon,
        description: evolutionData.description,
        rarity: 'legendary',
        priority: 1000, // Highest priority
      };
    });
  }

  /**
   * Get weapon upgrade options (level up existing weapons)
   */
  getWeaponUpgradeOptions(player) {
    const playerWeapons = player.weapons || [];
    const options = [];

    playerWeapons.forEach((playerWeapon) => {
      // Skip max level weapons
      if (playerWeapon.level >= 8) {
        return;
      }

      // 60% chance to offer this weapon upgrade
      if (Math.random() < 0.6) {
        const weaponDef = this.getWeaponDefinition(playerWeapon.weaponId);

        if (weaponDef) {
          const nextLevel = playerWeapon.level + 1;

          options.push({
            type: UPGRADE_TYPES.WEAPON_UPGRADE,
            weaponId: playerWeapon.weaponId,
            id: `weapon_upgrade_${playerWeapon.weaponId}`,
            name: `${weaponDef.name} (Lv ${nextLevel})`,
            icon: weaponDef.icon,
            description: this.getWeaponUpgradeDescription(weaponDef, playerWeapon.level, nextLevel),
            rarity: this.getWeaponRarity(weaponDef),
            priority: 100,
          });
        }
      }
    });

    return options;
  }

  /**
   * Get new weapon options
   */
  getNewWeaponOptions(player, count = 2) {
    const playerWeapons = player.weapons || [];
    const maxWeapons = 6;

    // No new weapons if at max
    if (playerWeapons.length >= maxWeapons) {
      return [];
    }

    const playerWeaponIds = playerWeapons.map(w => w.weaponId);
    const availableWeapons = Object.values(WEAPONS).filter(weapon => {
      // Skip evolved weapons (can only get through evolution)
      if (weapon.evolution) {
        return false;
      }

      // Skip weapons player already has
      if (playerWeaponIds.includes(weapon.id)) {
        return false;
      }

      return true;
    });

    // Shuffle and pick random weapons
    const shuffled = this.shuffleArray(availableWeapons);
    const selected = shuffled.slice(0, Math.min(count, availableWeapons.length));

    return selected.map((weapon) => ({
      type: UPGRADE_TYPES.NEW_WEAPON,
      weaponId: weapon.id,
      id: `new_weapon_${weapon.id}`,
      name: weapon.name,
      icon: weapon.icon,
      description: weapon.description,
      rarity: this.getWeaponRarity(weapon),
      priority: 50,
    }));
  }

  /**
   * Get stat upgrade options
   */
  getStatUpgradeOptions(player, count = 4) {
    const options = [];
    const availableStats = Object.values(STAT_UPGRADES).filter((stat) => {
      const currentCount = this.statUpgradeCounts.get(stat.id) || 0;
      return currentCount < stat.maxStacks;
    });

    // Shuffle available stats
    const shuffled = this.shuffleArray(availableStats);

    // Select up to 'count' stats
    const selected = shuffled.slice(0, Math.min(count, availableStats.length));

    return selected.map((stat) => {
      const currentCount = this.statUpgradeCounts.get(stat.id) || 0;

      return {
        type: UPGRADE_TYPES.STAT_UPGRADE,
        statId: stat.id,
        id: `stat_${stat.id}`,
        name: stat.name,
        icon: stat.icon,
        description: stat.description,
        shortDesc: stat.shortDesc,
        stackCount: currentCount + 1,
        maxStacks: stat.maxStacks,
        rarity: 'common',
        priority: 10,
      };
    });
  }

  /**
   * Apply selected upgrade to player
   */
  applyUpgrade(player, upgrade, dispatch) {
    switch (upgrade.type) {
      case UPGRADE_TYPES.WEAPON_EVOLUTION:
        this.applyWeaponEvolution(player, upgrade, dispatch);
        break;

      case UPGRADE_TYPES.WEAPON_UPGRADE:
        this.applyWeaponUpgrade(player, upgrade, dispatch);
        break;

      case UPGRADE_TYPES.NEW_WEAPON:
        this.applyNewWeapon(player, upgrade, dispatch);
        break;

      case UPGRADE_TYPES.STAT_UPGRADE:
        this.applyStatUpgrade(player, upgrade, dispatch);
        break;
    }
  }

  /**
   * Apply weapon evolution
   */
  applyWeaponEvolution(player, upgrade, dispatch) {
    dispatch({
      type: 'EVOLVE_WEAPON',
      payload: {
        evolutionId: upgrade.evolutionId,
      },
    });
  }

  /**
   * Apply weapon upgrade
   */
  applyWeaponUpgrade(player, upgrade, dispatch) {
    dispatch({
      type: 'UPGRADE_WEAPON',
      payload: {
        weaponId: upgrade.weaponId,
      },
    });
  }

  /**
   * Apply new weapon
   */
  applyNewWeapon(player, upgrade, dispatch) {
    dispatch({
      type: 'ADD_WEAPON',
      payload: {
        weaponId: upgrade.weaponId,
      },
    });
  }

  /**
   * Apply stat upgrade
   */
  applyStatUpgrade(player, upgrade, dispatch) {
    const stat = STAT_UPGRADES[upgrade.statId.toUpperCase()];

    if (stat) {
      // Track stat upgrade count
      const currentCount = this.statUpgradeCounts.get(stat.id) || 0;
      this.statUpgradeCounts.set(stat.id, currentCount + 1);

      // Apply stat to player
      stat.apply(player);

      dispatch({
        type: 'APPLY_STAT_UPGRADE',
        payload: {
          statId: stat.id,
          value: stat.value,
        },
      });
    }
  }

  /**
   * Get weapon definition by ID
   */
  getWeaponDefinition(weaponId) {
    return Object.values(WEAPONS).find(w => w.id === weaponId);
  }

  /**
   * Get weapon upgrade description
   */
  getWeaponUpgradeDescription(weapon, currentLevel, nextLevel) {
    const scaling = weapon.scaling || {};
    const changes = [];

    // Damage scaling
    if (scaling.damage) {
      const increase = Math.round((scaling.damage - 1) * 100);
      changes.push(`+${increase}% damage`);
    }

    // Cooldown scaling
    if (scaling.cooldown && scaling.cooldown < 1) {
      const reduction = Math.round((1 - scaling.cooldown) * 100);
      changes.push(`-${reduction}% cooldown`);
    }

    // Count scaling
    if (scaling.count && nextLevel % Math.ceil(1 / scaling.count) === 0) {
      changes.push('+1 projectile');
    }

    // Pierce scaling
    if (scaling.pierce && nextLevel % Math.ceil(1 / scaling.pierce) === 0) {
      changes.push('+1 pierce');
    }

    return changes.length > 0 ? changes.join(', ') : 'Increased power';
  }

  /**
   * Get weapon rarity based on properties
   */
  getWeaponRarity(weapon) {
    if (weapon.evolution) {
      return 'legendary';
    }

    if (weapon.category === 'special') {
      return 'rare';
    }

    return 'common';
  }

  /**
   * Shuffle array (Fisher-Yates)
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get stat upgrade by ID
   */
  getStatUpgrade(statId) {
    return STAT_UPGRADES[statId.toUpperCase()];
  }

  /**
   * Get stat upgrade count
   */
  getStatUpgradeCount(statId) {
    return this.statUpgradeCounts.get(statId) || 0;
  }

  /**
   * Reset stat upgrade counts (for new game)
   */
  reset() {
    this.statUpgradeCounts.clear();
    this.lastOfferedUpgrades = [];
  }
}

/**
 * Helper: Create level up system
 */
export function createLevelUpSystem() {
  return new LevelUpSystem();
}

/**
 * Helper: Format upgrade card for UI display
 */
export function formatUpgradeCard(upgrade) {
  return {
    id: upgrade.id,
    type: upgrade.type,
    name: upgrade.name,
    icon: upgrade.icon,
    description: upgrade.description,
    rarity: upgrade.rarity,
    stackInfo: upgrade.stackCount && upgrade.maxStacks
      ? `${upgrade.stackCount}/${upgrade.maxStacks}`
      : null,
  };
}

/**
 * Helper: Get rarity color for UI
 */
export function getRarityColor(rarity) {
  switch (rarity) {
    case 'legendary':
      return '#FFD700'; // Gold
    case 'rare':
      return '#9370DB'; // Purple
    case 'uncommon':
      return '#4169E1'; // Blue
    case 'common':
    default:
      return '#C0C0C0'; // Silver
  }
}

/**
 * Helper: Get rarity border style
 */
export function getRarityBorderStyle(rarity) {
  const color = getRarityColor(rarity);

  switch (rarity) {
    case 'legendary':
      return {
        borderColor: color,
        borderWidth: '3px',
        boxShadow: `0 0 15px ${color}`,
        animation: 'pulse 2s infinite',
      };
    case 'rare':
      return {
        borderColor: color,
        borderWidth: '2px',
        boxShadow: `0 0 10px ${color}`,
      };
    default:
      return {
        borderColor: color,
        borderWidth: '2px',
      };
  }
}
