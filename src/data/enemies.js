// Enemy type definitions

export const ENEMY_TYPES = {
  BANDIT: {
    id: 'bandit',
    name: 'Bandit',
    health: 30,
    speed: 2,
    damage: 10,
    size: 16,
    color: '#8B4513',
    score: 10,
    spawnWeight: 10,
  },

  OUTLAW: {
    id: 'outlaw',
    name: 'Outlaw',
    health: 50,
    speed: 2.5,
    damage: 15,
    size: 18,
    color: '#A0522D',
    score: 20,
    spawnWeight: 7,
  },

  GUNSLINGER: {
    id: 'gunslinger',
    name: 'Gunslinger',
    health: 40,
    speed: 3,
    damage: 20,
    size: 16,
    color: '#CD853F',
    score: 25,
    spawnWeight: 5,
    ranged: true,
    fireRate: 1.5,
  },

  BRUTE: {
    id: 'brute',
    name: 'Brute',
    health: 100,
    speed: 1.5,
    damage: 30,
    size: 24,
    color: '#654321',
    score: 50,
    spawnWeight: 3,
  },

  DESPERADO: {
    id: 'desperado',
    name: 'Desperado',
    health: 70,
    speed: 3.5,
    damage: 25,
    size: 18,
    color: '#D2691E',
    score: 40,
    spawnWeight: 4,
    ranged: true,
    fireRate: 1.0,
  },
};

// Wave configuration - enemies get stronger each wave
export function getEnemyForWave(wave) {
  const availableTypes = Object.values(ENEMY_TYPES);
  const weights = availableTypes.map((type) => type.spawnWeight);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let random = Math.random() * totalWeight;
  for (let i = 0; i < availableTypes.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      // Scale health and damage with wave number
      const scaledEnemy = {
        ...availableTypes[i],
        health: availableTypes[i].health * (1 + wave * 0.1),
        damage: availableTypes[i].damage * (1 + wave * 0.05),
      };
      return scaledEnemy;
    }
  }

  return availableTypes[0];
}

// Calculate number of enemies to spawn based on wave
export function getEnemyCountForWave(wave) {
  return Math.floor(5 + wave * 2 + Math.pow(wave, 1.2));
}
