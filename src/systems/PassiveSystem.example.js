/**
 * PASSIVE SYSTEM INTEGRATION EXAMPLES
 *
 * This file demonstrates how to integrate the PassiveManager
 * with various game systems
 */

import {
  PassiveManager,
  createPassiveManager,
  applyPassiveToStats,
  calculateDamage,
  calculateIncomingDamage,
} from './PassiveSystem';

// ========== EXAMPLE 1: Character Initialization ==========

export function initializeCharacterExample(selectedCharacter) {
  // Create passive manager
  const passiveManager = createPassiveManager(selectedCharacter);

  // Apply passive effects to base stats
  const baseStats = {
    damage: 1.0,
    fireRate: 1.0,
    moveSpeed: 1.0,
    maxHp: 1.0,
    pickupRange: 1.0,
    armor: 0,
  };

  const modifiedStats = applyPassiveToStats(selectedCharacter, baseStats);

  // Initialize player with modified stats
  const player = {
    character: selectedCharacter,
    hp: selectedCharacter.baseStats.hp * modifiedStats.maxHp,
    maxHp: selectedCharacter.baseStats.hp * modifiedStats.maxHp,
    speed: selectedCharacter.baseStats.speed * modifiedStats.moveSpeed,
    stats: modifiedStats,
  };

  return { player, passiveManager };
}

// ========== EXAMPLE 2: Damage Calculation ==========

export function dealDamageToEnemyExample(passiveManager, weapon, enemy) {
  const baseDamage = weapon.damage;

  // Context for passive modifiers
  const context = {
    targetEnemy: enemy,
    weapon: weapon,
    baseDamage: baseDamage,
  };

  // Calculate final damage with passive modifiers
  const finalDamage = calculateDamage(passiveManager, baseDamage, context);

  // Apply damage to enemy
  enemy.health -= finalDamage;

  // Check for life steal
  const healing = passiveManager.onDamageDealt(finalDamage, 'normal');
  if (healing > 0) {
    console.log(`Life steal: ${healing} HP healed`);
  }

  return { damage: finalDamage, healing };
}

// ========== EXAMPLE 3: Poison Damage ==========

export function applyPoisonDamageExample(passiveManager, enemy, basePoisonDamage) {
  // Get poison modifier (Spirit Walk passive)
  const poisonModifier = passiveManager.getPoisonDamageModifier();
  const finalPoisonDamage = basePoisonDamage * poisonModifier;

  // Apply poison damage
  enemy.health -= finalPoisonDamage;

  // Check for life steal on poison damage
  const healing = passiveManager.onDamageDealt(finalPoisonDamage, 'poison');

  return { damage: finalPoisonDamage, healing };
}

// ========== EXAMPLE 4: Taking Damage ==========

export function playerTakesDamageExample(passiveManager, player, incomingDamage) {
  // Calculate damage reduction (Law & Order passive)
  const reducedDamage = calculateIncomingDamage(passiveManager, incomingDamage);

  // Apply damage to player
  player.hp = Math.max(0, player.hp - reducedDamage);

  console.log(`Took ${reducedDamage} damage (reduced from ${incomingDamage})`);

  return reducedDamage;
}

// ========== EXAMPLE 5: Enemy Kill Event ==========

export function onEnemyKilledExample(passiveManager, enemy, addXpGem) {
  const position = { x: enemy.x, y: enemy.y };

  // Check for special spawns (Gold Rush passive)
  const spawns = passiveManager.onEnemyKilled(enemy, position);

  spawns.forEach((spawn) => {
    if (spawn.type === 'gold') {
      addXpGem(spawn);
      console.log('Gold nugget spawned!');
    }
  });

  return spawns;
}

// ========== EXAMPLE 6: XP Collection ==========

export function collectXpGemExample(passiveManager, xpGem, addXp) {
  const baseXp = xpGem.value;
  const isGold = xpGem.isGold || false;

  // Apply XP modifier (Wanted Dead passive)
  const finalXp = passiveManager.onXpCollected(baseXp, isGold);

  addXp(finalXp);

  console.log(`Collected ${finalXp} XP (base: ${baseXp})`);

  return finalXp;
}

// ========== EXAMPLE 7: Weapon Fire Rate ==========

export function updateWeaponCooldownExample(passiveManager, weapon, dt) {
  const baseCooldown = weapon.fireRate;

  // Apply fire rate modifier (Trigger Happy passive)
  const fireRateModifier = passiveManager.getFireRateModifier(weapon);

  // Apply cooldown reduction (Ride Hard passive)
  const cooldownModifier = passiveManager.getCooldownModifier(weapon);

  // Calculate effective cooldown
  const effectiveCooldown = baseCooldown * cooldownModifier / fireRateModifier;

  return effectiveCooldown;
}

// ========== EXAMPLE 8: Movement Speed ==========

export function updatePlayerMovementExample(passiveManager, baseSpeed, movement, dt) {
  // Apply speed modifier (Ride Hard passive)
  const speedModifier = passiveManager.getSpeedModifier();
  const effectiveSpeed = baseSpeed * speedModifier;

  // Calculate new position
  const newX = movement.x * effectiveSpeed * dt;
  const newY = movement.y * effectiveSpeed * dt;

  return { x: newX, y: newY };
}

// ========== EXAMPLE 9: Pickup Range ==========

export function checkXpGemInRangeExample(passiveManager, player, xpGem) {
  const basePickupRange = 50;

  // Apply pickup range modifier (Gold Rush passive)
  const rangeModifier = passiveManager.getPickupRangeModifier();
  const effectiveRange = basePickupRange * rangeModifier;

  // Check distance
  const dx = xpGem.x - player.x;
  const dy = xpGem.y - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const inRange = distance < effectiveRange;

  return inRange;
}

// ========== EXAMPLE 10: Complete Game Loop Integration ==========

export function gameLoopIntegrationExample(passiveManager, state, dt) {
  // 1. Update player movement with speed modifier
  const movement = { x: 1, y: 0 }; // Example movement
  const newPos = updatePlayerMovementExample(
    passiveManager,
    state.player.speed,
    movement,
    dt
  );
  state.player.x += newPos.x;
  state.player.y += newPos.y;

  // 2. Update weapon cooldowns with modifiers
  state.weapons.forEach((weapon) => {
    const effectiveCooldown = updateWeaponCooldownExample(passiveManager, weapon, dt);
    weapon.currentCooldown = Math.max(0, weapon.currentCooldown - dt);
  });

  // 3. Check XP gem collection with pickup range
  state.xpGems.forEach((gem, index) => {
    const inRange = checkXpGemInRangeExample(passiveManager, state.player, gem);
    if (inRange) {
      collectXpGemExample(passiveManager, gem, (xp) => {
        state.player.xp += xp;
      });
      state.xpGems.splice(index, 1);
    }
  });

  // 4. Process enemy deaths
  state.enemies.forEach((enemy, index) => {
    if (enemy.health <= 0) {
      onEnemyKilledExample(passiveManager, enemy, (gem) => {
        state.xpGems.push(gem);
      });
      state.enemies.splice(index, 1);
    }
  });

  // 5. Apply passive healing
  if (state.player.hp < state.player.maxHp) {
    // Healing from life steal is applied automatically in damage calculation
  }

  return state;
}

// ========== EXAMPLE 11: Statistics Display ==========

export function displayPassiveStatsExample(passiveManager) {
  const stats = passiveManager.getStats();
  const info = passiveManager.getPassiveInfo();

  console.log('=== Passive Ability ===');
  console.log(`Name: ${info.name}`);
  console.log(`Description: ${info.description}`);
  console.log('\n=== Statistics ===');
  console.log(`Gold Collected: ${stats.goldCollected}`);
  console.log(`Total Life Stolen: ${stats.lifeStolenTotal.toFixed(1)}`);
  console.log(`Poison Damage Dealt: ${stats.poisonDamageDealt.toFixed(1)}`);
  console.log(`Bonus Damage Dealt: ${stats.bonusDamageDealt.toFixed(1)}`);
  console.log(`Damage Reduced: ${stats.damageReduced.toFixed(1)}`);

  return { stats, info };
}

// ========== EXAMPLE 12: Context-Aware Damage (Hangman) ==========

export function damageSlowedEnemyExample(passiveManager, weapon, enemy) {
  // Mark enemy as slowed
  enemy.slowed = true;
  enemy.slowAmount = 0.5; // 50% slow

  const baseDamage = weapon.damage;
  const context = {
    targetEnemy: enemy,
    weapon: weapon,
    baseDamage: baseDamage,
  };

  // Calculate damage (Noose Tightens passive will apply bonus)
  const finalDamage = calculateDamage(passiveManager, baseDamage, context);

  console.log(`Damage to slowed enemy: ${finalDamage} (base: ${baseDamage})`);

  return finalDamage;
}

// ========== USAGE IN GAME COMPONENT ==========

export function GameComponentExample() {
  // In your game component or game loop:

  /*
  import { createPassiveManager } from './systems/PassiveSystem';

  // On character selection
  const passiveManager = createPassiveManager(selectedCharacter);

  // Store in game state
  gameState.passiveManager = passiveManager;

  // In damage calculation
  const damage = calculateDamage(
    gameState.passiveManager,
    weapon.damage,
    { targetEnemy: enemy }
  );

  // On enemy kill
  const spawns = gameState.passiveManager.onEnemyKilled(enemy, { x, y });
  spawns.forEach(spawn => addXpGem(spawn));

  // On XP collection
  const xp = gameState.passiveManager.onXpCollected(gem.value, gem.isGold);
  addXp(xp);

  // Display stats
  const stats = gameState.passiveManager.getStats();
  */

  return 'See commented code above for integration example';
}
