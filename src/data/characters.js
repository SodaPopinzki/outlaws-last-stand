// Player character definitions

export const CHARACTERS = {
  COWBOY: {
    id: 'cowboy',
    name: 'The Cowboy',
    description: 'Balanced gunslinger with steady aim',
    health: 100,
    speed: 5,
    size: 16,
    color: '#4169E1',
    startingWeapon: 'revolver',
    abilities: {
      passive: 'quickdraw',
      active: 'dead_eye',
    },
    stats: {
      damage: 1.0,
      fireRate: 1.0,
      moveSpeed: 1.0,
      health: 1.0,
    },
  },

  GUNSLINGER: {
    id: 'gunslinger',
    name: 'The Gunslinger',
    description: 'Fast shooter with dual pistols',
    health: 80,
    speed: 6,
    size: 16,
    color: '#FF4500',
    startingWeapon: 'dual_pistols',
    abilities: {
      passive: 'dual_wield',
      active: 'bullet_time',
    },
    stats: {
      damage: 0.9,
      fireRate: 1.3,
      moveSpeed: 1.2,
      health: 0.8,
    },
  },

  OUTLAW: {
    id: 'outlaw',
    name: 'The Outlaw',
    description: 'Tough fighter with close-range power',
    health: 120,
    speed: 4.5,
    size: 18,
    color: '#8B0000',
    startingWeapon: 'shotgun',
    abilities: {
      passive: 'iron_skin',
      active: 'berserker',
    },
    stats: {
      damage: 1.2,
      fireRate: 0.8,
      moveSpeed: 0.9,
      health: 1.2,
    },
  },

  SHARPSHOOTER: {
    id: 'sharpshooter',
    name: 'The Sharpshooter',
    description: 'Precise marksman with long-range attacks',
    health: 90,
    speed: 4.8,
    size: 16,
    color: '#2E8B57',
    startingWeapon: 'rifle',
    abilities: {
      passive: 'eagle_eye',
      active: 'piercing_shot',
    },
    stats: {
      damage: 1.3,
      fireRate: 0.9,
      moveSpeed: 0.95,
      health: 0.9,
    },
  },
};

export const DEFAULT_CHARACTER = CHARACTERS.COWBOY;
