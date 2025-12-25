// Weapon definitions

export const WEAPONS = {
  REVOLVER: {
    id: 'revolver',
    name: 'Revolver',
    damage: 25,
    fireRate: 0.4, // seconds between shots
    projectileSpeed: 800,
    projectileSize: 4,
    piercing: false,
    spread: 0,
    projectileCount: 1,
    range: 600,
    color: '#FFD700',
  },

  SHOTGUN: {
    id: 'shotgun',
    name: 'Shotgun',
    damage: 15,
    fireRate: 0.8,
    projectileSpeed: 600,
    projectileSize: 3,
    piercing: false,
    spread: 0.3,
    projectileCount: 5,
    range: 400,
    color: '#FF6347',
  },

  RIFLE: {
    id: 'rifle',
    name: 'Rifle',
    damage: 40,
    fireRate: 0.2,
    projectileSpeed: 1000,
    projectileSize: 3,
    piercing: true,
    spread: 0,
    projectileCount: 1,
    range: 800,
    color: '#87CEEB',
  },

  DUAL_PISTOLS: {
    id: 'dual_pistols',
    name: 'Dual Pistols',
    damage: 20,
    fireRate: 0.25,
    projectileSpeed: 750,
    projectileSize: 4,
    piercing: false,
    spread: 0.1,
    projectileCount: 2,
    range: 600,
    color: '#FFA500',
  },
};

export const DEFAULT_WEAPON = WEAPONS.REVOLVER;
