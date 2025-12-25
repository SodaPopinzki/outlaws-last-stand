// Boss definitions

export const BOSSES = {
  SHERIFF: {
    id: 'sheriff',
    name: 'Corrupt Sheriff',
    health: 500,
    speed: 2,
    damage: 30,
    size: 32,
    color: '#DAA520',
    score: 500,
    wave: 5,
    patterns: [
      {
        type: 'circle_shot',
        projectileCount: 8,
        cooldown: 2,
      },
      {
        type: 'rapid_fire',
        duration: 3,
        cooldown: 5,
      },
    ],
  },

  GANG_LEADER: {
    id: 'gang_leader',
    name: 'Gang Leader',
    health: 800,
    speed: 2.5,
    damage: 40,
    size: 36,
    color: '#B8860B',
    score: 1000,
    wave: 10,
    patterns: [
      {
        type: 'summon_minions',
        count: 5,
        cooldown: 8,
      },
      {
        type: 'spiral_shot',
        projectileCount: 12,
        cooldown: 3,
      },
    ],
  },

  DESPERADO_KING: {
    id: 'desperado_king',
    name: 'King of Desperados',
    health: 1200,
    speed: 3,
    damage: 50,
    size: 40,
    color: '#8B0000',
    score: 2000,
    wave: 15,
    patterns: [
      {
        type: 'targeted_barrage',
        projectileCount: 20,
        cooldown: 4,
      },
      {
        type: 'dash_attack',
        cooldown: 6,
      },
      {
        type: 'circle_shot',
        projectileCount: 16,
        cooldown: 5,
      },
    ],
  },
};

// Get boss for specific wave (if any)
export function getBossForWave(wave) {
  return Object.values(BOSSES).find((boss) => boss.wave === wave);
}
