/**
 * Passive Ability System
 *
 * Manages character passive abilities and their effects on gameplay
 * Provides modifier functions and event handlers for all passive types
 */

import { generateId } from '../utils/random';

/**
 * PassiveManager Class
 * Central manager for handling character passive abilities
 */
export class PassiveManager {
  constructor(character) {
    this.character = character;
    this.passive = character?.passive;
    this.effect = character?.passive?.effect;

    // Statistics tracking for achievements
    this.stats = {
      goldCollected: 0,
      lifeStolenTotal: 0,
      poisonDamageDealt: 0,
      bonusDamageDealt: 0,
      damageReduced: 0,
    };
  }

  /**
   * Update character (used when changing characters)
   */
  setCharacter(character) {
    this.character = character;
    this.passive = character?.passive;
    this.effect = character?.passive?.effect;
  }

  /**
   * Get current character ID
   */
  getCharacterId() {
    return this.character?.id || 'drifter';
  }

  // ========== DAMAGE MODIFIERS ==========

  /**
   * Get damage modifier for outgoing player damage
   * Used when player deals damage to enemies
   */
  getDamageModifier(context = {}) {
    if (!this.effect) return 1.0;

    let modifier = 1.0;

    switch (this.effect.type) {
      case 'damage_boost':
        // Lone Wolf - always applies (no allies in game)
        modifier *= 1 + this.effect.value;
        break;

      case 'slow_amplification':
        // Noose Tightens - bonus damage to slowed enemies
        if (context.targetEnemy?.slowed || context.targetEnemy?.slowAmount > 0) {
          modifier *= this.effect.damageMultiplier;
          this.stats.bonusDamageDealt += (context.baseDamage || 0) * (this.effect.damageMultiplier - 1);
        }
        break;

      default:
        break;
    }

    return modifier;
  }

  /**
   * Get damage reduction modifier for incoming damage
   * Used when player takes damage from enemies
   */
  getDamageReductionModifier() {
    if (!this.effect) return 1.0;

    if (this.effect.type === 'damage_reduction') {
      // Law & Order - reduce incoming damage
      const reduction = this.effect.value; // 0.15 = 15% reduction
      this.stats.damageReduced += reduction;
      return 1 - reduction;
    }

    return 1.0;
  }

  /**
   * Get poison damage modifier
   */
  getPoisonDamageModifier() {
    if (!this.effect) return 1.0;

    if (this.effect.type === 'poison_and_lifesteal') {
      // Spirit Walk - boost poison damage
      return this.effect.poisonMultiplier;
    }

    return 1.0;
  }

  // ========== MOVEMENT MODIFIERS ==========

  /**
   * Get movement speed modifier
   */
  getSpeedModifier() {
    if (!this.effect) return 1.0;

    if (this.effect.type === 'mobility_boost') {
      // Ride Hard - movement speed bonus
      return this.effect.speedMultiplier;
    }

    return 1.0;
  }

  // ========== WEAPON/FIRE RATE MODIFIERS ==========

  /**
   * Get fire rate modifier for weapons
   */
  getFireRateModifier(weapon) {
    if (!this.effect) return 1.0;

    if (this.effect.type === 'fire_rate_boost') {
      // Trigger Happy - fire rate bonus for projectile weapons
      if (weapon?.type === 'projectile') {
        return this.effect.fireRateMultiplier;
      }
    }

    return 1.0;
  }

  /**
   * Get cooldown reduction multiplier
   */
  getCooldownModifier(weapon) {
    if (!this.effect) return 1.0;

    if (this.effect.type === 'mobility_boost') {
      // Ride Hard - cooldown reduction
      if (weapon?.id === 'horse_charge') {
        return 1 - this.effect.cooldownReduction; // 0.7 = 30% reduction
      }
    }

    return 1.0;
  }

  // ========== PICKUP MODIFIERS ==========

  /**
   * Get pickup radius modifier
   */
  getPickupRangeModifier() {
    if (!this.effect) return 1.0;

    if (this.effect.type === 'pickup_and_gold') {
      // Gold Rush - pickup radius bonus
      return this.effect.pickupMultiplier;
    }

    return 1.0;
  }

  // ========== XP MODIFIERS ==========

  /**
   * Get XP gain modifier
   */
  getXpModifier() {
    if (!this.effect) return 1.0;

    if (this.effect.type === 'xp_and_health') {
      // Wanted Dead - XP bonus
      return this.effect.xpMultiplier;
    }

    return 1.0;
  }

  /**
   * Get max HP modifier
   */
  getMaxHpModifier() {
    if (!this.effect) return 1.0;

    if (this.effect.type === 'xp_and_health') {
      // Wanted Dead - HP penalty
      return this.effect.hpMultiplier;
    }

    return 1.0;
  }

  // ========== EVENT HANDLERS ==========

  /**
   * Handle enemy death event
   * Returns items to spawn (gold, etc.)
   */
  onEnemyKilled(enemy, position) {
    const spawns = [];

    if (this.effect?.type === 'pickup_and_gold') {
      // Gold Rush - chance to spawn gold nugget
      if (Math.random() < this.effect.goldChance) {
        spawns.push({
          type: 'gold',
          id: generateId(),
          x: position.x,
          y: position.y,
          value: 50, // Gold worth 5x normal XP
          color: '#FFD700',
          size: 8,
          isGold: true,
        });
      }
    }

    return spawns;
  }

  /**
   * Handle damage dealt event
   * Returns healing amount if life steal applies
   */
  onDamageDealt(damage, damageType = 'normal') {
    let healing = 0;

    if (this.effect?.type === 'poison_and_lifesteal') {
      // Spirit Walk - life steal on damage
      if (damageType === 'poison' || damageType === 'all') {
        healing = damage * this.effect.lifeSteal;
        this.stats.lifeStolenTotal += healing;
      }
    }

    // Track poison damage
    if (damageType === 'poison') {
      this.stats.poisonDamageDealt += damage;
    }

    return healing;
  }

  /**
   * Handle XP collection event
   * Returns modified XP amount
   */
  onXpCollected(baseXp, isGold = false) {
    let xp = baseXp;

    // Apply XP modifier
    xp *= this.getXpModifier();

    // Track gold collection
    if (isGold) {
      this.stats.goldCollected++;
    }

    return xp;
  }

  // ========== STATISTICS ==========

  /**
   * Get passive statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      goldCollected: 0,
      lifeStolenTotal: 0,
      poisonDamageDealt: 0,
      bonusDamageDealt: 0,
      damageReduced: 0,
    };
  }

  /**
   * Get passive info for UI display
   */
  getPassiveInfo() {
    if (!this.passive) return null;

    return {
      name: this.passive.name,
      description: this.passive.description,
      stats: this.getStats(),
    };
  }
}

// ========== HELPER FUNCTIONS ==========

/**
 * Apply passive effects to base stats
 * Used during character initialization
 */
export function applyPassiveToStats(character, baseStats) {
  if (!character?.passive?.effect) return baseStats;

  const stats = { ...baseStats };
  const effect = character.passive.effect;

  switch (effect.type) {
    case 'damage_boost':
      // Lone Wolf
      stats.damage = (stats.damage || 1.0) * (1 + effect.value);
      break;

    case 'xp_and_health':
      // Wanted Dead
      stats.maxHp = (stats.maxHp || 100) * effect.hpMultiplier;
      break;

    case 'damage_reduction':
      // Law & Order
      stats.armor = (stats.armor || 0) + effect.value * 100;
      break;

    case 'pickup_and_gold':
      // Gold Rush
      stats.pickupRange = (stats.pickupRange || 1.0) * effect.pickupMultiplier;
      break;

    case 'mobility_boost':
      // Ride Hard
      stats.moveSpeed = (stats.moveSpeed || 1.0) * effect.speedMultiplier;
      break;

    case 'fire_rate_boost':
      // Trigger Happy
      stats.fireRate = (stats.fireRate || 1.0) * effect.fireRateMultiplier;
      break;

    case 'poison_and_lifesteal':
      // Spirit Walk - effects applied during gameplay
      break;

    case 'slow_amplification':
      // Noose Tightens - effects applied during damage calculation
      break;

    default:
      break;
  }

  return stats;
}

/**
 * Apply passive modifier to a single stat value
 */
export function applyPassive(character, statName, baseValue) {
  if (!character?.passive?.effect) return baseValue;

  const effect = character.passive.effect;
  let value = baseValue;

  // Map stat names to passive effects
  switch (statName) {
    case 'damage':
      if (effect.type === 'damage_boost') {
        value *= 1 + effect.value;
      }
      break;

    case 'maxHp':
      if (effect.type === 'xp_and_health') {
        value *= effect.hpMultiplier;
      }
      break;

    case 'armor':
      if (effect.type === 'damage_reduction') {
        value += effect.value * 100;
      }
      break;

    case 'pickupRange':
      if (effect.type === 'pickup_and_gold') {
        value *= effect.pickupMultiplier;
      }
      break;

    case 'moveSpeed':
      if (effect.type === 'mobility_boost') {
        value *= effect.speedMultiplier;
      }
      break;

    case 'fireRate':
      if (effect.type === 'fire_rate_boost') {
        value *= effect.fireRateMultiplier;
      }
      break;

    default:
      break;
  }

  return value;
}

/**
 * Calculate final damage with all modifiers
 */
export function calculateDamage(passiveManager, baseDamage, context = {}) {
  let damage = baseDamage;

  // Apply damage modifier
  damage *= passiveManager.getDamageModifier(context);

  // Apply poison modifier if poison damage
  if (context.damageType === 'poison') {
    damage *= passiveManager.getPoisonDamageModifier();
  }

  return damage;
}

/**
 * Calculate damage reduction for incoming damage
 */
export function calculateIncomingDamage(passiveManager, baseDamage) {
  let damage = baseDamage;

  // Apply damage reduction
  damage *= passiveManager.getDamageReductionModifier();

  return damage;
}

/**
 * Check if character should spawn gold on kill
 */
export function shouldSpawnGold(character) {
  if (!character?.passive?.effect) return false;
  return character.passive.effect.type === 'pickup_and_gold';
}

/**
 * Check if character has life steal
 */
export function hasLifeSteal(character) {
  if (!character?.passive?.effect) return false;
  return character.passive.effect.type === 'poison_and_lifesteal';
}

/**
 * Get passive display text for UI
 */
export function getPassiveDisplayText(character) {
  if (!character?.passive) return null;

  return {
    name: character.passive.name,
    description: character.passive.description,
    type: character.passive.effect?.type,
  };
}

/**
 * Initialize passive manager from character
 */
export function createPassiveManager(character) {
  return new PassiveManager(character);
}

// ========== PASSIVE EFFECT TYPES ==========

export const PASSIVE_TYPES = {
  DAMAGE_BOOST: 'damage_boost',
  XP_AND_HEALTH: 'xp_and_health',
  DAMAGE_REDUCTION: 'damage_reduction',
  PICKUP_AND_GOLD: 'pickup_and_gold',
  POISON_AND_LIFESTEAL: 'poison_and_lifesteal',
  MOBILITY_BOOST: 'mobility_boost',
  FIRE_RATE_BOOST: 'fire_rate_boost',
  SLOW_AMPLIFICATION: 'slow_amplification',
};

/**
 * Validate passive effect configuration
 */
export function validatePassiveEffect(effect) {
  if (!effect || !effect.type) {
    return false;
  }

  const validTypes = Object.values(PASSIVE_TYPES);
  return validTypes.includes(effect.type);
}

/**
 * Get all active passive effects from character
 */
export function getActiveEffects(character) {
  if (!character?.passive?.effect) return [];

  return [{
    name: character.passive.name,
    type: character.passive.effect.type,
    description: character.passive.description,
  }];
}
