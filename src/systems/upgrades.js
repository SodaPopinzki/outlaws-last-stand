// Upgrade system for player progression

export const UPGRADE_TYPES = {
  DAMAGE: 'damage',
  FIRE_RATE: 'fire_rate',
  MOVEMENT_SPEED: 'movement_speed',
  MAX_HEALTH: 'max_health',
  HEALTH_REGEN: 'health_regen',
  PROJECTILE_SPEED: 'projectile_speed',
  PIERCING: 'piercing',
  MULTI_SHOT: 'multi_shot',
};

export const UPGRADES = {
  DAMAGE_1: {
    id: 'damage_1',
    name: 'Damage +10%',
    description: 'Increase weapon damage by 10%',
    type: UPGRADE_TYPES.DAMAGE,
    value: 0.1,
    cost: 100,
  },

  DAMAGE_2: {
    id: 'damage_2',
    name: 'Damage +20%',
    description: 'Increase weapon damage by 20%',
    type: UPGRADE_TYPES.DAMAGE,
    value: 0.2,
    cost: 250,
    requires: ['damage_1'],
  },

  FIRE_RATE_1: {
    id: 'fire_rate_1',
    name: 'Fire Rate +15%',
    description: 'Shoot 15% faster',
    type: UPGRADE_TYPES.FIRE_RATE,
    value: 0.15,
    cost: 100,
  },

  MOVEMENT_1: {
    id: 'movement_1',
    name: 'Speed +10%',
    description: 'Move 10% faster',
    type: UPGRADE_TYPES.MOVEMENT_SPEED,
    value: 0.1,
    cost: 75,
  },

  MAX_HEALTH_1: {
    id: 'max_health_1',
    name: 'Max Health +20',
    description: 'Increase maximum health by 20',
    type: UPGRADE_TYPES.MAX_HEALTH,
    value: 20,
    cost: 150,
  },

  PIERCING_SHOT: {
    id: 'piercing_shot',
    name: 'Piercing Bullets',
    description: 'Bullets pierce through enemies',
    type: UPGRADE_TYPES.PIERCING,
    value: true,
    cost: 300,
  },

  MULTI_SHOT: {
    id: 'multi_shot',
    name: 'Double Shot',
    description: 'Fire an additional projectile',
    type: UPGRADE_TYPES.MULTI_SHOT,
    value: 1,
    cost: 350,
  },
};

/**
 * Apply upgrade to player stats
 */
export function applyUpgrade(player, upgrade) {
  const updatedPlayer = { ...player };
  const upgrades = [...(player.upgrades || [])];

  // Check if already has upgrade
  if (upgrades.includes(upgrade.id)) {
    return player;
  }

  // Check requirements
  if (upgrade.requires) {
    const hasRequirements = upgrade.requires.every((req) =>
      upgrades.includes(req)
    );
    if (!hasRequirements) {
      return player;
    }
  }

  // Apply upgrade effect
  switch (upgrade.type) {
    case UPGRADE_TYPES.DAMAGE:
      // This will be applied to weapon damage in the game loop
      break;

    case UPGRADE_TYPES.FIRE_RATE:
      // This will be applied to weapon fire rate in the game loop
      break;

    case UPGRADE_TYPES.MOVEMENT_SPEED:
      updatedPlayer.speed = player.speed * (1 + upgrade.value);
      break;

    case UPGRADE_TYPES.MAX_HEALTH:
      updatedPlayer.maxHealth = player.maxHealth + upgrade.value;
      updatedPlayer.health = Math.min(
        player.health + upgrade.value,
        updatedPlayer.maxHealth
      );
      break;

    default:
      break;
  }

  upgrades.push(upgrade.id);
  updatedPlayer.upgrades = upgrades;

  return updatedPlayer;
}

/**
 * Get available upgrades for player
 */
export function getAvailableUpgrades(player) {
  const playerUpgrades = player.upgrades || [];

  return Object.values(UPGRADES).filter((upgrade) => {
    // Already has upgrade
    if (playerUpgrades.includes(upgrade.id)) {
      return false;
    }

    // Check requirements
    if (upgrade.requires) {
      const hasRequirements = upgrade.requires.every((req) =>
        playerUpgrades.includes(req)
      );
      return hasRequirements;
    }

    return true;
  });
}
