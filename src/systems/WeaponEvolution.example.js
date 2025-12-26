/**
 * Weapon Evolution System - Integration Examples
 *
 * Shows how to use the evolution system in the game
 */

import {
  getAvailableEvolutions,
  getEvolvableWeaponPairs,
  evolveWeapons,
  checkEvolutionEligibility,
  getEvolutionCardData,
  getEvolutionHint,
  createEvolutionNotification,
  getEvolutionAchievementProgress,
  EVOLUTIONS,
} from './WeaponEvolution';

// ========== EXAMPLE 1: Check for Available Evolutions ==========

function checkEvolutionsOnLevelUp(playerWeapons) {
  // Get all evolutions the player can currently perform
  const available = getAvailableEvolutions(playerWeapons);

  if (available.length > 0) {
    console.log('🌟 Evolutions available:', available.length);
    available.forEach(evo => {
      console.log(`  - ${evo.icon} ${evo.name}`);
    });

    // Show evolution notification
    available.forEach(evolution => {
      const notification = createEvolutionNotification(evolution);
      // Display notification in UI
      showNotification(notification);
    });
  }
}

// Example player weapons
const playerWeapons = [
  { id: 'six_shooter', name: 'Six-Shooter', level: 8, maxLevel: 8 },
  { id: 'rifle', name: 'Rifle', level: 8, maxLevel: 8 },
  { id: 'dynamite', name: 'Dynamite', level: 6, maxLevel: 8 },
];

checkEvolutionsOnLevelUp(playerWeapons);
// Output: Evolutions available: 1
//         - 🔫💥 Peacemaker

// ========== EXAMPLE 2: Show Evolution Progress ==========

function displayEvolutionProgress(playerWeapons) {
  const pairs = getEvolvableWeaponPairs(playerWeapons);

  pairs.forEach(pair => {
    console.log(`\n${pair.evolution.icon} ${pair.evolution.name}`);
    console.log(`  Requires: ${pair.weapon1.name} + ${pair.weapon2.name}`);
    console.log(`  Progress: ${Math.floor(pair.progress * 100)}%`);
    console.log(`  Levels: ${pair.weapon1.level}/${pair.evolution.requiresLevel} + ${pair.weapon2.level}/${pair.evolution.requiresLevel}`);
    console.log(`  Can Evolve: ${pair.canEvolve ? '✅' : '❌'}`);
  });
}

displayEvolutionProgress([
  { id: 'six_shooter', name: 'Six-Shooter', level: 8, maxLevel: 8 },
  { id: 'rifle', name: 'Rifle', level: 8, maxLevel: 8 },
  { id: 'dynamite', name: 'Dynamite', level: 6, maxLevel: 8 },
  { id: 'molotov_whiskey', name: 'Molotov Whiskey', level: 5, maxLevel: 8 },
]);

// Output:
// 🔫💥 Peacemaker
//   Requires: Six-Shooter + Rifle
//   Progress: 100%
//   Levels: 8/8 + 8/8
//   Can Evolve: ✅
//
// 🔥💀 Hellfire
//   Requires: Dynamite + Molotov Whiskey
//   Progress: 62%
//   Levels: 6/8 + 5/8
//   Can Evolve: ❌

// ========== EXAMPLE 3: Evolution in Level-Up Screen ==========

function handleLevelUpChoice(playerWeapons, choice) {
  if (choice.type === 'evolution') {
    // Player chose to evolve weapons
    const evolutionId = choice.evolutionId;

    // Check eligibility
    if (checkEvolutionEligibility(playerWeapons, evolutionId)) {
      // Perform evolution
      const newWeapons = evolveWeapons(playerWeapons, evolutionId);

      // Play evolution animation/sound
      playEvolutionAnimation(evolutionId);
      playSound('evolution_complete');

      // Show success message
      const evolution = EVOLUTIONS[evolutionId.toUpperCase()];
      showMessage(`Evolution Complete! You now wield the ${evolution.name}!`);

      return newWeapons;
    } else {
      console.error('Evolution not available');
      return playerWeapons;
    }
  }

  // Handle normal weapon upgrade
  return handleNormalUpgrade(playerWeapons, choice);
}

// ========== EXAMPLE 4: Creating Evolution Upgrade Cards ==========

function generateLevelUpChoices(playerWeapons) {
  const choices = [];

  // Check for available evolutions
  const availableEvolutions = getAvailableEvolutions(playerWeapons);

  // Add evolution cards (priority)
  availableEvolutions.forEach(evolution => {
    const weapon1 = playerWeapons.find(w => w.id === evolution.requires[0]);
    const weapon2 = playerWeapons.find(w => w.id === evolution.requires[1]);

    const cardData = getEvolutionCardData(evolution, weapon1, weapon2);

    choices.push({
      type: 'evolution',
      ...cardData,
      weight: 1000, // High priority
    });
  });

  // Add normal upgrade choices
  // ... (regular weapon upgrades)

  return choices;
}

// Example usage in UI
const choices = generateLevelUpChoices(playerWeapons);
choices.forEach(choice => {
  if (choice.type === 'evolution') {
    console.log(`\n🌟 EVOLUTION AVAILABLE 🌟`);
    console.log(`${choice.icon} ${choice.name}`);
    console.log(`${choice.description}`);
    console.log(`\nCombines:`);
    choice.components.forEach(comp => {
      console.log(`  - ${comp.name} (Level ${comp.level})`);
    });
    console.log(`\nSpecial Properties:`);
    choice.specialProperties.forEach(prop => {
      console.log(`  • ${prop}`);
    });
  }
});

// Output:
// 🌟 EVOLUTION AVAILABLE 🌟
// 🔫💥 Peacemaker
// Legendary revolver with explosive rounds. Combines rapid fire with devastating power.
//
// Combines:
//   - Six-Shooter (Level 8)
//   - Rifle (Level 8)
//
// Special Properties:
//   • Explosive Rounds (60 radius)

// ========== EXAMPLE 5: Evolution Hints in Weapon Tooltips ==========

function showWeaponTooltip(weapon) {
  console.log(`\n${weapon.name} (Level ${weapon.level}/${weapon.maxLevel})`);
  console.log(`Damage: ${weapon.baseDamage}`);

  // Show evolution hints
  const hints = getEvolutionHint(weapon.id);
  if (hints.length > 0) {
    console.log(`\n💡 Evolution Paths:`);
    hints.forEach(hint => {
      console.log(`  ${hint.evolution}: Combine with ${hint.needsWeapon} at level ${hint.needsLevel}`);
    });
  }
}

showWeaponTooltip({
  id: 'six_shooter',
  name: 'Six-Shooter',
  level: 5,
  maxLevel: 8,
  baseDamage: 25,
});

// Output:
// Six-Shooter (Level 5/8)
// Damage: 25
//
// 💡 Evolution Paths:
//   Peacemaker: Combine with rifle at level 8

// ========== EXAMPLE 6: Achievement Tracking ==========

function showEvolutionAchievements() {
  const progress = getEvolutionAchievementProgress();

  console.log('\n🏆 Evolution Achievements');
  console.log(`Progress: ${progress.unlocked}/${progress.total} (${Math.floor(progress.percentage)}%)`);
  console.log(`Remaining: ${progress.remaining}`);

  if (progress.unlocked > 0) {
    console.log('\nUnlocked:');
    progress.evolutions.forEach(evoId => {
      console.log(`  ✅ ${evoId}`);
    });
  }

  // Check for milestone achievements
  if (progress.unlocked === progress.total) {
    console.log('\n🎉 MASTER GUNSMITH - All evolutions unlocked!');
  } else if (progress.unlocked >= 5) {
    console.log('\n⭐ WEAPON MASTER - 5+ evolutions unlocked!');
  } else if (progress.unlocked >= 3) {
    console.log('\n⭐ SKILLED CRAFTER - 3+ evolutions unlocked!');
  } else if (progress.unlocked >= 1) {
    console.log('\n⭐ FIRST EVOLUTION - Evolution path discovered!');
  }
}

showEvolutionAchievements();

// ========== EXAMPLE 7: Evolution System in GameContext ==========

// Add to GameContext reducer
const evolutionActions = {
  CHECK_EVOLUTIONS: (state) => {
    const available = getAvailableEvolutions(state.player.weapons);
    if (available.length > 0) {
      // Show evolution notification
      return {
        ...state,
        notifications: [
          ...state.notifications,
          ...available.map(createEvolutionNotification),
        ],
      };
    }
    return state;
  },

  EVOLVE_WEAPONS: (state, action) => {
    const { evolutionId } = action.payload;
    const newWeapons = evolveWeapons(state.player.weapons, evolutionId);

    return {
      ...state,
      player: {
        ...state.player,
        weapons: newWeapons,
      },
      gameStatus: 'playing', // Resume game after evolution
    };
  },
};

// ========== EXAMPLE 8: Integration with Level-Up System ==========

function onPlayerLevelUp(gameState, dispatch) {
  // Check for evolutions first
  const availableEvolutions = getAvailableEvolutions(gameState.player.weapons);

  if (availableEvolutions.length > 0) {
    // Show evolution screen with priority
    const evolutionChoices = availableEvolutions.map(evolution => {
      const weapon1 = gameState.player.weapons.find(w => w.id === evolution.requires[0]);
      const weapon2 = gameState.player.weapons.find(w => w.id === evolution.requires[1]);
      return getEvolutionCardData(evolution, weapon1, weapon2);
    });

    // Add regular upgrade choices
    const regularChoices = getRegularUpgradeChoices(gameState.player.weapons);

    // Combine all choices (evolutions shown first)
    const allChoices = [...evolutionChoices, ...regularChoices];

    // Show level-up screen
    dispatch({
      type: 'SHOW_LEVEL_UP',
      payload: { choices: allChoices },
    });
  } else {
    // No evolutions available, show regular upgrades
    const choices = getRegularUpgradeChoices(gameState.player.weapons);
    dispatch({
      type: 'SHOW_LEVEL_UP',
      payload: { choices },
    });
  }
}

// ========== EXAMPLE 9: Visual Evolution Animation ==========

function playEvolutionAnimation(evolutionId) {
  const evolution = EVOLUTIONS[evolutionId.toUpperCase()];

  // Create particle effects
  const particles = [];
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200,
      color: evolution.color,
      life: 2.0,
      size: Math.random() * 8 + 4,
    });
  }

  // Flash screen with evolution color
  flashScreen(evolution.color, 0.5);

  // Show evolution title
  showEvolutionTitle(evolution);

  // Play sound effect
  playSound('evolution_transform');

  // Shake screen
  shakeScreen(10, 0.8);

  return {
    particles,
    duration: 2000, // 2 second animation
  };
}

function showEvolutionTitle(evolution) {
  // Display large centered text
  return {
    text: `${evolution.icon} ${evolution.name.toUpperCase()} ${evolution.icon}`,
    subtitle: evolution.description,
    color: '#FFD700',
    fontSize: 48,
    duration: 2000,
    fadeIn: 200,
    fadeOut: 300,
  };
}

// ========== Placeholder Functions ==========

function showNotification(notification) {
  console.log(`📢 ${notification.title}: ${notification.message}`);
}

function playSound(soundName) {
  console.log(`🔊 Playing sound: ${soundName}`);
}

function showMessage(message) {
  console.log(`💬 ${message}`);
}

function handleNormalUpgrade(weapons, choice) {
  return weapons; // Placeholder
}

function getRegularUpgradeChoices(weapons) {
  return []; // Placeholder
}

function flashScreen(color, duration) {
  console.log(`✨ Flash screen: ${color} for ${duration}s`);
}

function shakeScreen(intensity, duration) {
  console.log(`📳 Shake screen: ${intensity} for ${duration}s`);
}
