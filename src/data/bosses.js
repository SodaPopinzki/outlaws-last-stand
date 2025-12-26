/**
 * Boss System - 10 Legendary Gunslingers
 *
 * Bosses appear every 5 waves (5, 10, 15, 20, 25, 30, 35, 40, 45, 50)
 * Each has unique mechanics, multiple phases, and special abilities
 */

// Attack pattern types
export const BOSS_ATTACK_PATTERNS = {
  QUICK_DRAW: 'quick_draw',           // Fast single shots
  BULLET_SPRAY: 'bullet_spray',       // Spread of bullets
  DYNAMITE_SPLIT: 'dynamite_split',   // Explosives that split
  FIRE_CHARGE: 'fire_charge',         // Charge with fire trail
  TOMAHAWK_ORBIT: 'tomahawk_orbit',   // Returning tomahawks
  POISON_CLOUD: 'poison_cloud',       // Lingering poison
  TRACKING_SHOTS: 'tracking_shots',   // Bullets that track player
  ORBIT_STARS: 'orbit_stars',         // Stars that orbit then launch
  STAMPEDE: 'stampede',               // Charge in straight lines
  TIME_SLOW: 'time_slow',             // Slows player
  CLONE_ATTACK: 'clone_attack',       // Spawns clones
  CIRCLE_SHOT: 'circle_shot',         // 360° bullet spread
  SPIRAL_SHOT: 'spiral_shot',         // Rotating spiral pattern
  SUMMON_MINIONS: 'summon_minions',   // Spawn enemies
};

// Boss phases
export const BOSS_PHASES = {
  PHASE_1: 100,  // 100% HP
  PHASE_2: 50,   // 50% HP
  PHASE_3: 25,   // 25% HP (only final boss)
};

// Boss definitions
export const BOSSES = {
  BILLY_THE_KID: {
    id: 'billy_the_kid',
    name: 'Billy the Kid',
    title: 'The Fastest Gun in the West',
    icon: '🤠',
    waveNumber: 5,

    // Base stats
    baseHp: 500,
    speed: 120,
    baseDamage: 20,
    size: 24,
    color: '#FFD700',

    // Attacks
    attacks: [
      {
        name: 'Quick Draw',
        pattern: BOSS_ATTACK_PATTERNS.QUICK_DRAW,
        cooldown: 0.5,
        damage: 20,
        projectileSpeed: 600,
        projectileCount: 1,
      },
    ],

    // Phase transitions
    phases: [
      {
        hpThreshold: BOSS_PHASES.PHASE_1,
        changes: {
          description: 'Normal speed',
        },
      },
      {
        hpThreshold: BOSS_PHASES.PHASE_2,
        changes: {
          description: 'Becomes faster',
          speedMultiplier: 1.5,
          cooldownMultiplier: 0.7,
        },
      },
    ],

    // Death reward
    deathReward: {
      xp: 100,
      specialDrop: null,
    },

    // Dialogue
    dialogue: {
      intro: "They say I'm the fastest draw alive. Let's see if you can keep up!",
      phase2: "You're quick, but not quick enough!",
      death: "Maybe... you're the fastest now...",
    },
  },

  JESSE_JAMES: {
    id: 'jesse_james',
    name: 'Jesse James',
    title: 'The Notorious Outlaw',
    icon: '💣',
    waveNumber: 10,

    baseHp: 1000,
    speed: 100,
    baseDamage: 30,
    size: 26,
    color: '#DC143C',

    attacks: [
      {
        name: 'Dynamite Toss',
        pattern: BOSS_ATTACK_PATTERNS.DYNAMITE_SPLIT,
        cooldown: 2.0,
        damage: 40,
        explosionRadius: 100,
        splitCount: 4,
      },
      {
        name: 'Circle Shot',
        pattern: BOSS_ATTACK_PATTERNS.CIRCLE_SHOT,
        cooldown: 3.0,
        damage: 25,
        projectileCount: 8,
      },
    ],

    phases: [
      {
        hpThreshold: BOSS_PHASES.PHASE_1,
        changes: {
          description: 'Normal attacks',
        },
      },
      {
        hpThreshold: BOSS_PHASES.PHASE_2,
        changes: {
          description: 'Summons gang members',
          summonMinions: true,
          minionType: 'bandit',
          minionCount: 3,
          summonCooldown: 10.0,
        },
      },
    ],

    deathReward: {
      xp: 250,
      specialDrop: 'health_restore',
    },

    dialogue: {
      intro: "I've robbed trains, banks, and now I'll rob you of your life!",
      phase2: "Boys! Take care of this pest!",
      death: "The James gang... lives on...",
    },
  },

  BUTCH_CASSIDY: {
    id: 'butch_cassidy',
    name: 'Butch Cassidy',
    title: 'The Wild Bunch Leader',
    icon: '🐎',
    waveNumber: 15,

    baseHp: 1800,
    speed: 150,
    baseDamage: 35,
    size: 28,
    color: '#8B4513',

    attacks: [
      {
        name: 'Horse Charge',
        pattern: BOSS_ATTACK_PATTERNS.FIRE_CHARGE,
        cooldown: 4.0,
        damage: 50,
        chargeDuration: 2.0,
        fireTrailDuration: 3.0,
        fireTrailRadius: 60,
      },
      {
        name: 'Bullet Spray',
        pattern: BOSS_ATTACK_PATTERNS.BULLET_SPRAY,
        cooldown: 2.5,
        damage: 30,
        projectileCount: 12,
        spreadAngle: Math.PI / 3,
      },
    ],

    phases: [
      {
        hpThreshold: BOSS_PHASES.PHASE_1,
        changes: {
          description: 'Normal charge',
        },
      },
      {
        hpThreshold: BOSS_PHASES.PHASE_2,
        changes: {
          description: 'Wider fire trail and faster charges',
          fireTrailRadiusMultiplier: 1.5,
          chargeCooldownMultiplier: 0.7,
        },
      },
    ],

    deathReward: {
      xp: 400,
      specialDrop: 'weapon_upgrade',
    },

    dialogue: {
      intro: "This territory belongs to the Wild Bunch!",
      phase2: "Time to show you what a real outlaw can do!",
      death: "Sundance... where are you...",
    },
  },

  SUNDANCE_KID: {
    id: 'sundance_kid',
    name: 'The Sundance Kid',
    title: 'Butch\'s Right Hand',
    icon: '☀️',
    waveNumber: 20,

    baseHp: 2200,
    speed: 130,
    baseDamage: 40,
    size: 26,
    color: '#FFA500',

    attacks: [
      {
        name: 'Dual Wield Spray',
        pattern: BOSS_ATTACK_PATTERNS.BULLET_SPRAY,
        cooldown: 1.5,
        damage: 35,
        projectileCount: 16,
        spreadAngle: Math.PI / 2,
      },
      {
        name: 'Spiral Shot',
        pattern: BOSS_ATTACK_PATTERNS.SPIRAL_SHOT,
        cooldown: 3.0,
        damage: 30,
        projectileCount: 24,
        rotationSpeed: Math.PI / 2,
      },
    ],

    phases: [
      {
        hpThreshold: BOSS_PHASES.PHASE_1,
        changes: {
          description: 'Forward spray only',
        },
      },
      {
        hpThreshold: BOSS_PHASES.PHASE_2,
        changes: {
          description: '360° spray attacks',
          bulletSpray360: true,
          projectileCountMultiplier: 1.5,
        },
      },
    ],

    deathReward: {
      xp: 600,
      specialDrop: 'damage_boost',
    },

    dialogue: {
      intro: "I ride with Butch, and you just made a big mistake!",
      phase2: "Let's see you dodge THIS!",
      death: "Butch... I tried...",
    },
  },

  CALAMITY_JANE: {
    id: 'calamity_jane',
    name: 'Calamity Jane',
    title: 'The Frontier\'s Fiercest',
    icon: '🪓',
    waveNumber: 25,

    baseHp: 2800,
    speed: 140,
    baseDamage: 45,
    size: 24,
    color: '#FF6347',

    attacks: [
      {
        name: 'Tomahawk Throw',
        pattern: BOSS_ATTACK_PATTERNS.TOMAHAWK_ORBIT,
        cooldown: 2.0,
        damage: 50,
        orbitCount: 3,
        orbitRadius: 150,
        returnSpeed: 400,
      },
      {
        name: 'Quick Draw',
        pattern: BOSS_ATTACK_PATTERNS.QUICK_DRAW,
        cooldown: 0.8,
        damage: 40,
        projectileSpeed: 700,
        projectileCount: 2,
      },
    ],

    phases: [
      {
        hpThreshold: BOSS_PHASES.PHASE_1,
        changes: {
          description: 'Normal tomahawk throws',
        },
      },
      {
        hpThreshold: BOSS_PHASES.PHASE_2,
        changes: {
          description: 'Tomahawks split on return',
          tomahawkSplit: true,
          splitCount: 3,
          orbitCountMultiplier: 1.5,
        },
      },
    ],

    deathReward: {
      xp: 850,
      specialDrop: 'crit_boost',
    },

    dialogue: {
      intro: "Calamity's my name, and calamity's what you'll get!",
      phase2: "I've survived worse than you!",
      death: "Tell Wild Bill... I fought well...",
    },
  },

  DOC_HOLLIDAY: {
    id: 'doc_holliday',
    name: 'Doc Holliday',
    title: 'The Deadly Dentist',
    icon: '☠️',
    waveNumber: 30,

    baseHp: 3500,
    speed: 110,
    baseDamage: 50,
    size: 26,
    color: '#9370DB',

    attacks: [
      {
        name: 'Poison Cloud',
        pattern: BOSS_ATTACK_PATTERNS.POISON_CLOUD,
        cooldown: 3.5,
        damage: 25,
        cloudRadius: 120,
        cloudDuration: 5.0,
        dotDamage: 10,
        dotInterval: 0.5,
      },
      {
        name: 'Circle Shot',
        pattern: BOSS_ATTACK_PATTERNS.CIRCLE_SHOT,
        cooldown: 2.5,
        damage: 45,
        projectileCount: 12,
      },
    ],

    phases: [
      {
        hpThreshold: BOSS_PHASES.PHASE_1,
        changes: {
          description: 'Normal poison clouds',
        },
      },
      {
        hpThreshold: BOSS_PHASES.PHASE_2,
        changes: {
          description: 'Poison clouds slow enemies',
          poisonSlow: true,
          slowMultiplier: 0.5,
          cloudDurationMultiplier: 1.5,
        },
      },
    ],

    deathReward: {
      xp: 1200,
      specialDrop: 'health_max_up',
    },

    dialogue: {
      intro: "I'm your huckleberry. Care to dance with death?",
      phase2: "My prescription? A lethal dose of lead!",
      death: "This... is my epitaph...",
    },
  },

  WILD_BILL_HICKOK: {
    id: 'wild_bill_hickok',
    name: 'Wild Bill Hickok',
    title: 'The Deadliest Marksman',
    icon: '🎯',
    waveNumber: 35,

    baseHp: 4500,
    speed: 125,
    baseDamage: 55,
    size: 28,
    color: '#4169E1',

    attacks: [
      {
        name: 'Dead Eye Shot',
        pattern: BOSS_ATTACK_PATTERNS.TRACKING_SHOTS,
        cooldown: 1.2,
        damage: 60,
        projectileCount: 3,
        trackingStrength: 0.8,
        projectileSpeed: 500,
      },
      {
        name: 'Spiral Barrage',
        pattern: BOSS_ATTACK_PATTERNS.SPIRAL_SHOT,
        cooldown: 4.0,
        damage: 50,
        projectileCount: 32,
        rotationSpeed: Math.PI,
      },
    ],

    phases: [
      {
        hpThreshold: BOSS_PHASES.PHASE_1,
        changes: {
          description: 'Normal tracking shots',
        },
      },
      {
        hpThreshold: BOSS_PHASES.PHASE_2,
        changes: {
          description: 'Shots pierce through walls',
          trackingPierce: true,
          trackingStrengthMultiplier: 1.3,
          projectileCountMultiplier: 1.5,
        },
      },
    ],

    deathReward: {
      xp: 1600,
      specialDrop: 'pierce_boost',
    },

    dialogue: {
      intro: "They call me the Prince of Pistoleers. Let's see if you earn that title!",
      phase2: "There's no escape from my aim!",
      death: "Aces and eights... the dead man's hand...",
    },
  },

  WYATT_EARP: {
    id: 'wyatt_earp',
    name: 'Wyatt Earp',
    title: 'The Lawman Legend',
    icon: '⭐',
    waveNumber: 40,

    baseHp: 6000,
    speed: 115,
    baseDamage: 60,
    size: 30,
    color: '#C0C0C0',

    attacks: [
      {
        name: 'Deputy Stars',
        pattern: BOSS_ATTACK_PATTERNS.ORBIT_STARS,
        cooldown: 3.0,
        damage: 65,
        starCount: 6,
        orbitRadius: 180,
        orbitSpeed: Math.PI / 2,
        launchSpeed: 600,
      },
      {
        name: 'Law and Order',
        pattern: BOSS_ATTACK_PATTERNS.CIRCLE_SHOT,
        cooldown: 2.0,
        damage: 55,
        projectileCount: 16,
      },
    ],

    phases: [
      {
        hpThreshold: BOSS_PHASES.PHASE_1,
        changes: {
          description: 'Stars orbit only',
        },
      },
      {
        hpThreshold: BOSS_PHASES.PHASE_2,
        changes: {
          description: 'Stars launch at player periodically',
          starsLaunch: true,
          launchInterval: 2.0,
          starCountMultiplier: 1.5,
        },
      },
    ],

    deathReward: {
      xp: 2200,
      specialDrop: 'speed_boost',
    },

    dialogue: {
      intro: "Justice has come to this frontier, outlaw!",
      phase2: "You can't escape the law!",
      death: "The legend... ends...",
    },
  },

  BUFFALO_BILL: {
    id: 'buffalo_bill',
    name: 'Buffalo Bill',
    title: 'The Wild West Showman',
    icon: '🦬',
    waveNumber: 45,

    baseHp: 8000,
    speed: 160,
    baseDamage: 70,
    size: 32,
    color: '#D2691E',

    attacks: [
      {
        name: 'Buffalo Stampede',
        pattern: BOSS_ATTACK_PATTERNS.STAMPEDE,
        cooldown: 5.0,
        damage: 80,
        chargeCount: 3,
        chargeSpeed: 500,
        chargeWidth: 100,
      },
      {
        name: 'Rifle Barrage',
        pattern: BOSS_ATTACK_PATTERNS.BULLET_SPRAY,
        cooldown: 2.0,
        damage: 65,
        projectileCount: 20,
        spreadAngle: Math.PI / 4,
      },
    ],

    phases: [
      {
        hpThreshold: BOSS_PHASES.PHASE_1,
        changes: {
          description: 'Charges in one direction',
        },
      },
      {
        hpThreshold: BOSS_PHASES.PHASE_2,
        changes: {
          description: 'Stampede charges in 4 directions',
          stampede4Way: true,
          chargeCountMultiplier: 1.5,
        },
      },
    ],

    deathReward: {
      xp: 3000,
      specialDrop: 'cooldown_reduction',
    },

    dialogue: {
      intro: "Welcome to the greatest show in the West! Your final performance!",
      phase2: "The stampede begins!",
      death: "The show... must go on...",
    },
  },

  THE_MAN_WITH_NO_NAME: {
    id: 'the_man_with_no_name',
    name: 'The Man with No Name',
    title: 'The Ultimate Gunslinger',
    icon: '🎩',
    waveNumber: 50,

    baseHp: 12000,
    speed: 135,
    baseDamage: 80,
    size: 32,
    color: '#000000',

    attacks: [
      {
        name: 'Legendary Shot',
        pattern: BOSS_ATTACK_PATTERNS.QUICK_DRAW,
        cooldown: 0.6,
        damage: 90,
        projectileSpeed: 800,
        projectileCount: 3,
      },
      {
        name: 'Time Manipulation',
        pattern: BOSS_ATTACK_PATTERNS.TIME_SLOW,
        cooldown: 8.0,
        duration: 3.0,
        slowMultiplier: 0.3,
      },
      {
        name: 'Shadow Clones',
        pattern: BOSS_ATTACK_PATTERNS.CLONE_ATTACK,
        cooldown: 12.0,
        cloneCount: 2,
        cloneDuration: 10.0,
      },
      {
        name: 'Circle of Death',
        pattern: BOSS_ATTACK_PATTERNS.CIRCLE_SHOT,
        cooldown: 3.0,
        damage: 75,
        projectileCount: 24,
      },
    ],

    phases: [
      {
        hpThreshold: BOSS_PHASES.PHASE_1,
        changes: {
          description: 'Using all basic attacks',
        },
      },
      {
        hpThreshold: BOSS_PHASES.PHASE_2,
        changes: {
          description: 'Time slows frequently',
          timeSlowCooldownMultiplier: 0.5,
          speedMultiplier: 1.3,
        },
      },
      {
        hpThreshold: BOSS_PHASES.PHASE_3,
        changes: {
          description: 'Spawns shadow clones constantly',
          cloneCooldownMultiplier: 0.4,
          cloneCountMultiplier: 2,
          damageMultiplier: 1.5,
        },
      },
    ],

    deathReward: {
      xp: 5000,
      specialDrop: 'legendary_weapon',
    },

    dialogue: {
      intro: "...",
      phase2: "You've come far. But this is where your journey ends.",
      phase3: "Impressive. But there can only be one legend.",
      death: "Perhaps... the West needed a new legend... after all...",
    },
  },
};

// Helper functions

/**
 * Get boss for a specific wave number
 * @param {number} waveNumber - Current wave number
 * @returns {Object|null} Boss definition or null if no boss on this wave
 */
export function getBossForWave(waveNumber) {
  return Object.values(BOSSES).find((boss) => boss.waveNumber === waveNumber) || null;
}

/**
 * Check if a wave has a boss
 * @param {number} waveNumber - Wave number to check
 * @returns {boolean} True if this wave has a boss
 */
export function isBossWave(waveNumber) {
  return waveNumber % 5 === 0 && waveNumber <= 50;
}

/**
 * Get all boss wave numbers
 * @returns {number[]} Array of wave numbers that have bosses
 */
export function getBossWaves() {
  return Object.values(BOSSES).map((boss) => boss.waveNumber).sort((a, b) => a - b);
}

/**
 * Get boss stats scaled to current difficulty
 * @param {Object} boss - Boss definition
 * @param {number} difficultyMultiplier - Difficulty scaling (default 1.0)
 * @returns {Object} Boss with scaled stats
 */
export function getScaledBossStats(boss, difficultyMultiplier = 1.0) {
  return {
    ...boss,
    baseHp: Math.floor(boss.baseHp * difficultyMultiplier),
    baseDamage: Math.floor(boss.baseDamage * difficultyMultiplier),
    attacks: boss.attacks.map((attack) => ({
      ...attack,
      damage: Math.floor(attack.damage * difficultyMultiplier),
    })),
  };
}

/**
 * Get the current phase for a boss based on HP percentage
 * @param {Object} boss - Boss definition
 * @param {number} currentHp - Current HP
 * @param {number} maxHp - Maximum HP
 * @returns {Object} Current phase definition
 */
export function getCurrentPhase(boss, currentHp, maxHp) {
  const hpPercentage = (currentHp / maxHp) * 100;

  // Find the lowest threshold that current HP is above
  // Phases are sorted from highest to lowest threshold
  for (let i = boss.phases.length - 1; i >= 0; i--) {
    if (hpPercentage <= boss.phases[i].hpThreshold) {
      return boss.phases[i];
    }
  }

  // Should never reach here, but return first phase as fallback
  return boss.phases[0];
}

/**
 * Check if boss has entered a new phase
 * @param {Object} boss - Boss definition
 * @param {number} previousHp - HP before damage
 * @param {number} currentHp - HP after damage
 * @param {number} maxHp - Maximum HP
 * @returns {Object|null} New phase if transitioned, null otherwise
 */
export function checkPhaseTransition(boss, previousHp, currentHp, maxHp) {
  const previousPercent = (previousHp / maxHp) * 100;
  const currentPercent = (currentHp / maxHp) * 100;

  // Check each phase threshold
  for (const phase of boss.phases) {
    if (previousPercent > phase.hpThreshold && currentPercent <= phase.hpThreshold) {
      return phase;
    }
  }

  return null;
}

/**
 * Get boss by ID
 * @param {string} bossId - Boss identifier
 * @returns {Object|null} Boss definition or null
 */
export function getBossById(bossId) {
  return Object.values(BOSSES).find((boss) => boss.id === bossId) || null;
}

/**
 * Get next boss after current wave
 * @param {number} currentWave - Current wave number
 * @returns {Object|null} Next boss definition or null if no more bosses
 */
export function getNextBoss(currentWave) {
  const sortedBosses = Object.values(BOSSES).sort((a, b) => a.waveNumber - b.waveNumber);
  return sortedBosses.find((boss) => boss.waveNumber > currentWave) || null;
}

/**
 * Get waves until next boss
 * @param {number} currentWave - Current wave number
 * @returns {number} Waves remaining until next boss (0 if current wave is boss)
 */
export function getWavesUntilNextBoss(currentWave) {
  if (isBossWave(currentWave)) {
    return 0;
  }

  const nextBoss = getNextBoss(currentWave);
  if (!nextBoss) {
    return -1; // No more bosses
  }

  return nextBoss.waveNumber - currentWave;
}

/**
 * Get all bosses defeated progress
 * @param {string[]} defeatedBossIds - Array of defeated boss IDs
 * @returns {Object} Progress information
 */
export function getBossProgress(defeatedBossIds = []) {
  const totalBosses = Object.keys(BOSSES).length;
  const defeated = defeatedBossIds.length;

  return {
    defeated,
    total: totalBosses,
    remaining: totalBosses - defeated,
    percentage: (defeated / totalBosses) * 100,
    allDefeated: defeated === totalBosses,
  };
}

/**
 * Get boss achievement status
 * @param {string[]} defeatedBossIds - Array of defeated boss IDs
 * @returns {Object} Achievement milestones
 */
export function getBossAchievements(defeatedBossIds = []) {
  const progress = getBossProgress(defeatedBossIds);

  return {
    firstBoss: progress.defeated >= 1,
    halfwayPoint: progress.defeated >= 5,
    mostBosses: progress.defeated >= 8,
    allBosses: progress.allDefeated,
    finalBoss: defeatedBossIds.includes('the_man_with_no_name'),
  };
}
