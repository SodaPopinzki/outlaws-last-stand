import { createContext, useContext, useReducer, useCallback } from 'react';
import { DEFAULT_CHARACTER } from '../data/characters';
import { DEFAULT_WEAPON } from '../data/weapons';

const GameContext = createContext(null);

// Game status constants
export const GAME_STATUS = {
  MENU: 'menu',
  CHARACTER_SELECT: 'characterSelect',
  PLAYING: 'playing',
  PAUSED: 'paused',
  LEVEL_UP: 'levelUp',
  GAME_OVER: 'gameOver',
  VICTORY: 'victory',
};

// XP requirements per level (exponential scaling)
const XP_PER_LEVEL = (level) => Math.floor(100 * Math.pow(1.5, level - 1));

// Initial game state
const createInitialState = () => ({
  gameStatus: GAME_STATUS.MENU,

  player: {
    x: 400,
    y: 300,
    hp: 100,
    maxHp: 100,
    speed: 5,
    xp: 0,
    level: 1,
    character: DEFAULT_CHARACTER,
    weapons: [DEFAULT_WEAPON],
    activeWeaponIndex: 0,
    stats: {
      damage: 1.0,
      fireRate: 1.0,
      moveSpeed: 1.0,
      maxHp: 1.0,
      projectileSpeed: 1.0,
      projectileSize: 1.0,
      critChance: 0,
      critDamage: 1.5,
      pickupRange: 1.0,
      armor: 0,
      regen: 0,
    },
    invulnerable: false,
    invulnerableTime: 0,
    passiveManager: null, // Initialized when character is selected
  },

  enemies: [],
  projectiles: [],
  xpGems: [],
  particles: [],

  wave: 1,
  gameTime: 0,
  kills: 0,

  camera: {
    x: 0,
    y: 0,
  },

  settings: {
    soundEnabled: true,
    musicEnabled: true,
    difficulty: 'normal', // 'easy', 'normal', 'hard', 'nightmare'
  },
});

const initialState = createInitialState();

// Action types
export const ACTIONS = {
  // Game status
  SET_GAME_STATUS: 'SET_GAME_STATUS',
  RESET_GAME: 'RESET_GAME',

  // Player actions
  UPDATE_PLAYER: 'UPDATE_PLAYER',
  DAMAGE_PLAYER: 'DAMAGE_PLAYER',
  HEAL_PLAYER: 'HEAL_PLAYER',
  ADD_XP: 'ADD_XP',
  LEVEL_UP: 'LEVEL_UP',

  // Weapon actions
  ADD_WEAPON: 'ADD_WEAPON',
  UPGRADE_WEAPON: 'UPGRADE_WEAPON',
  EVOLVE_WEAPON: 'EVOLVE_WEAPON',
  APPLY_STAT_UPGRADE: 'APPLY_STAT_UPGRADE',

  // Enemy actions
  ADD_ENEMY: 'ADD_ENEMY',
  REMOVE_ENEMY: 'REMOVE_ENEMY',
  UPDATE_ENEMIES: 'UPDATE_ENEMIES',

  // Projectile actions
  ADD_PROJECTILE: 'ADD_PROJECTILE',
  REMOVE_PROJECTILE: 'REMOVE_PROJECTILE',
  UPDATE_PROJECTILES: 'UPDATE_PROJECTILES',

  // XP Gem actions
  ADD_XP_GEM: 'ADD_XP_GEM',
  REMOVE_XP_GEM: 'REMOVE_XP_GEM',
  UPDATE_XP_GEMS: 'UPDATE_XP_GEMS',

  // Particle actions
  ADD_PARTICLE: 'ADD_PARTICLE',
  REMOVE_PARTICLE: 'REMOVE_PARTICLE',
  UPDATE_PARTICLES: 'UPDATE_PARTICLES',

  // Wave actions
  NEXT_WAVE: 'NEXT_WAVE',

  // Game tracking
  UPDATE_GAME_TIME: 'UPDATE_GAME_TIME',
  INCREMENT_KILLS: 'INCREMENT_KILLS',

  // Camera
  UPDATE_CAMERA: 'UPDATE_CAMERA',

  // Settings
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
};

// Reducer function
function gameReducer(state, action) {
  switch (action.type) {
    // ========== Game Status ==========
    case ACTIONS.SET_GAME_STATUS:
      return {
        ...state,
        gameStatus: action.payload,
      };

    case ACTIONS.RESET_GAME:
      return createInitialState();

    // ========== Player Actions ==========
    case ACTIONS.UPDATE_PLAYER:
      return {
        ...state,
        player: {
          ...state.player,
          ...action.payload,
        },
      };

    case ACTIONS.DAMAGE_PLAYER: {
      const damage = action.payload;
      const actualDamage = Math.max(0, damage - state.player.stats.armor);
      const newHp = Math.max(0, state.player.hp - actualDamage);

      return {
        ...state,
        player: {
          ...state.player,
          hp: newHp,
        },
        gameStatus: newHp <= 0 ? GAME_STATUS.GAME_OVER : state.gameStatus,
      };
    }

    case ACTIONS.HEAL_PLAYER: {
      const healAmount = action.payload;
      const newHp = Math.min(state.player.maxHp, state.player.hp + healAmount);

      return {
        ...state,
        player: {
          ...state.player,
          hp: newHp,
        },
      };
    }

    case ACTIONS.ADD_XP: {
      const xpAmount = action.payload;
      const newXp = state.player.xp + xpAmount;
      const xpNeeded = XP_PER_LEVEL(state.player.level);

      // Check if leveled up
      if (newXp >= xpNeeded) {
        return {
          ...state,
          player: {
            ...state.player,
            xp: newXp - xpNeeded,
            level: state.player.level + 1,
          },
          gameStatus: GAME_STATUS.LEVEL_UP,
        };
      }

      return {
        ...state,
        player: {
          ...state.player,
          xp: newXp,
        },
      };
    }

    case ACTIONS.LEVEL_UP:
      // Applied when player selects an upgrade
      return {
        ...state,
        gameStatus: GAME_STATUS.PLAYING,
        player: {
          ...state.player,
          ...action.payload,
        },
      };

    // ========== Weapon Actions ==========
    case ACTIONS.ADD_WEAPON: {
      const { weaponId } = action.payload;
      const weapon = require('../data/weapons').WEAPONS.find(w => w.id === weaponId);

      if (!weapon) return state;

      return {
        ...state,
        player: {
          ...state.player,
          weapons: [...state.player.weapons, { ...weapon, level: 1 }],
        },
      };
    }

    case ACTIONS.UPGRADE_WEAPON: {
      const { weaponId } = action.payload;

      return {
        ...state,
        player: {
          ...state.player,
          weapons: state.player.weapons.map(w =>
            w.id === weaponId
              ? { ...w, level: (w.level || 1) + 1 }
              : w
          ),
        },
      };
    }

    case ACTIONS.EVOLVE_WEAPON: {
      const { evolutionId } = action.payload;
      const { getEvolutionById } = require('../systems/WeaponEvolution');
      const evolution = getEvolutionById(evolutionId);

      if (!evolution) return state;

      // Remove base weapons and add evolved weapon
      const baseIds = evolution.baseWeapons.map(w => w.id);
      const filteredWeapons = state.player.weapons.filter(w => !baseIds.includes(w.id));

      return {
        ...state,
        player: {
          ...state.player,
          weapons: [...filteredWeapons, { ...evolution.evolved, level: 1 }],
        },
      };
    }

    case ACTIONS.APPLY_STAT_UPGRADE: {
      // Stat upgrade already applied to player object by LevelUpSystem
      // This action just triggers a re-render
      return {
        ...state,
        player: {
          ...state.player,
        },
      };
    }

    // ========== Enemy Actions ==========
    case ACTIONS.ADD_ENEMY:
      return {
        ...state,
        enemies: [...state.enemies, action.payload],
      };

    case ACTIONS.REMOVE_ENEMY:
      return {
        ...state,
        enemies: state.enemies.filter((e) => e.id !== action.payload),
      };

    case ACTIONS.UPDATE_ENEMIES:
      return {
        ...state,
        enemies: action.payload,
      };

    // ========== Projectile Actions ==========
    case ACTIONS.ADD_PROJECTILE:
      return {
        ...state,
        projectiles: [...state.projectiles, action.payload],
      };

    case ACTIONS.REMOVE_PROJECTILE:
      return {
        ...state,
        projectiles: state.projectiles.filter((p) => p.id !== action.payload),
      };

    case ACTIONS.UPDATE_PROJECTILES:
      return {
        ...state,
        projectiles: action.payload,
      };

    // ========== XP Gem Actions ==========
    case ACTIONS.ADD_XP_GEM:
      return {
        ...state,
        xpGems: [...state.xpGems, action.payload],
      };

    case ACTIONS.REMOVE_XP_GEM:
      return {
        ...state,
        xpGems: state.xpGems.filter((gem) => gem.id !== action.payload),
      };

    case ACTIONS.UPDATE_XP_GEMS:
      return {
        ...state,
        xpGems: action.payload,
      };

    // ========== Particle Actions ==========
    case ACTIONS.ADD_PARTICLE:
      return {
        ...state,
        particles: [...state.particles, action.payload],
      };

    case ACTIONS.REMOVE_PARTICLE:
      return {
        ...state,
        particles: state.particles.filter((p) => p.id !== action.payload),
      };

    case ACTIONS.UPDATE_PARTICLES:
      return {
        ...state,
        particles: action.payload,
      };

    // ========== Wave Actions ==========
    case ACTIONS.NEXT_WAVE:
      return {
        ...state,
        wave: state.wave + 1,
      };

    // ========== Game Tracking ==========
    case ACTIONS.UPDATE_GAME_TIME:
      return {
        ...state,
        gameTime: action.payload,
      };

    case ACTIONS.INCREMENT_KILLS:
      return {
        ...state,
        kills: state.kills + (action.payload || 1),
      };

    // ========== Camera ==========
    case ACTIONS.UPDATE_CAMERA:
      return {
        ...state,
        camera: {
          ...state.camera,
          ...action.payload,
        },
      };

    // ========== Settings ==========
    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    default:
      return state;
  }
}

// Provider component
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // ========== Game Status Actions ==========
  const setGameStatus = useCallback((status) => {
    dispatch({ type: ACTIONS.SET_GAME_STATUS, payload: status });
  }, []);

  const startGame = useCallback(() => {
    dispatch({ type: ACTIONS.SET_GAME_STATUS, payload: GAME_STATUS.PLAYING });
  }, []);

  const pauseGame = useCallback(() => {
    dispatch({ type: ACTIONS.SET_GAME_STATUS, payload: GAME_STATUS.PAUSED });
  }, []);

  const resumeGame = useCallback(() => {
    dispatch({ type: ACTIONS.SET_GAME_STATUS, payload: GAME_STATUS.PLAYING });
  }, []);

  const gameOver = useCallback(() => {
    dispatch({ type: ACTIONS.SET_GAME_STATUS, payload: GAME_STATUS.GAME_OVER });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_GAME });
  }, []);

  // ========== Player Actions ==========
  const updatePlayer = useCallback((updates) => {
    dispatch({ type: ACTIONS.UPDATE_PLAYER, payload: updates });
  }, []);

  const damagePlayer = useCallback((damage) => {
    if (!state.player.invulnerable) {
      dispatch({ type: ACTIONS.DAMAGE_PLAYER, payload: damage });
    }
  }, [state.player.invulnerable]);

  const healPlayer = useCallback((amount) => {
    dispatch({ type: ACTIONS.HEAL_PLAYER, payload: amount });
  }, []);

  const addXp = useCallback((amount) => {
    dispatch({ type: ACTIONS.ADD_XP, payload: amount });
  }, []);

  const levelUp = useCallback((upgrades) => {
    dispatch({ type: ACTIONS.LEVEL_UP, payload: upgrades });
  }, []);

  // ========== Enemy Actions ==========
  const addEnemy = useCallback((enemy) => {
    dispatch({ type: ACTIONS.ADD_ENEMY, payload: enemy });
  }, []);

  const removeEnemy = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE_ENEMY, payload: id });
  }, []);

  const updateEnemies = useCallback((enemies) => {
    dispatch({ type: ACTIONS.UPDATE_ENEMIES, payload: enemies });
  }, []);

  // ========== Projectile Actions ==========
  const addProjectile = useCallback((projectile) => {
    dispatch({ type: ACTIONS.ADD_PROJECTILE, payload: projectile });
  }, []);

  const removeProjectile = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE_PROJECTILE, payload: id });
  }, []);

  const updateProjectiles = useCallback((projectiles) => {
    dispatch({ type: ACTIONS.UPDATE_PROJECTILES, payload: projectiles });
  }, []);

  // ========== XP Gem Actions ==========
  const addXpGem = useCallback((gem) => {
    dispatch({ type: ACTIONS.ADD_XP_GEM, payload: gem });
  }, []);

  const removeXpGem = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE_XP_GEM, payload: id });
  }, []);

  const updateXpGems = useCallback((gems) => {
    dispatch({ type: ACTIONS.UPDATE_XP_GEMS, payload: gems });
  }, []);

  // ========== Particle Actions ==========
  const addParticle = useCallback((particle) => {
    dispatch({ type: ACTIONS.ADD_PARTICLE, payload: particle });
  }, []);

  const removeParticle = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE_PARTICLE, payload: id });
  }, []);

  const updateParticles = useCallback((particles) => {
    dispatch({ type: ACTIONS.UPDATE_PARTICLES, payload: particles });
  }, []);

  // ========== Wave Actions ==========
  const nextWave = useCallback(() => {
    dispatch({ type: ACTIONS.NEXT_WAVE });
  }, []);

  // ========== Game Tracking ==========
  const updateGameTime = useCallback((time) => {
    dispatch({ type: ACTIONS.UPDATE_GAME_TIME, payload: time });
  }, []);

  const incrementKills = useCallback((count = 1) => {
    dispatch({ type: ACTIONS.INCREMENT_KILLS, payload: count });
  }, []);

  // ========== Camera ==========
  const updateCamera = useCallback((cameraUpdate) => {
    dispatch({ type: ACTIONS.UPDATE_CAMERA, payload: cameraUpdate });
  }, []);

  // ========== Settings ==========
  const updateSettings = useCallback((settingsUpdate) => {
    dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settingsUpdate });
  }, []);

  // Context value
  const value = {
    state,
    dispatch,

    // Game status
    setGameStatus,
    startGame,
    pauseGame,
    resumeGame,
    gameOver,
    resetGame,

    // Player
    updatePlayer,
    damagePlayer,
    healPlayer,
    addXp,
    levelUp,

    // Enemies
    addEnemy,
    removeEnemy,
    updateEnemies,

    // Projectiles
    addProjectile,
    removeProjectile,
    updateProjectiles,

    // XP Gems
    addXpGem,
    removeXpGem,
    updateXpGems,

    // Particles
    addParticle,
    removeParticle,
    updateParticles,

    // Wave
    nextWave,

    // Game tracking
    updateGameTime,
    incrementKills,

    // Camera
    updateCamera,

    // Settings
    updateSettings,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Custom hook to use the game context
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Helper function to get XP needed for next level
export function getXpForNextLevel(level) {
  return XP_PER_LEVEL(level);
}

// Export for backward compatibility
export const GAME_STATES = GAME_STATUS;
