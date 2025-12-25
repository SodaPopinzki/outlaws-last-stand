import { createContext, useContext, useReducer, useCallback } from 'react';

const GameContext = createContext(null);

// Game states
export const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  VICTORY: 'victory',
};

// Initial game state
const initialState = {
  gameState: GAME_STATES.MENU,
  player: {
    x: 400,
    y: 300,
    health: 100,
    maxHealth: 100,
    speed: 5,
    weapon: null,
    upgrades: [],
    score: 0,
    level: 1,
  },
  enemies: [],
  projectiles: [],
  powerups: [],
  wave: 1,
  time: 0,
  isPaused: false,
};

// Action types
const ACTIONS = {
  START_GAME: 'START_GAME',
  PAUSE_GAME: 'PAUSE_GAME',
  RESUME_GAME: 'RESUME_GAME',
  GAME_OVER: 'GAME_OVER',
  UPDATE_PLAYER: 'UPDATE_PLAYER',
  UPDATE_ENEMIES: 'UPDATE_ENEMIES',
  UPDATE_PROJECTILES: 'UPDATE_PROJECTILES',
  ADD_ENEMY: 'ADD_ENEMY',
  REMOVE_ENEMY: 'REMOVE_ENEMY',
  ADD_PROJECTILE: 'ADD_PROJECTILE',
  REMOVE_PROJECTILE: 'REMOVE_PROJECTILE',
  UPDATE_WAVE: 'UPDATE_WAVE',
  UPDATE_TIME: 'UPDATE_TIME',
  RESET_GAME: 'RESET_GAME',
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.START_GAME:
      return {
        ...initialState,
        gameState: GAME_STATES.PLAYING,
      };

    case ACTIONS.PAUSE_GAME:
      return {
        ...state,
        gameState: GAME_STATES.PAUSED,
        isPaused: true,
      };

    case ACTIONS.RESUME_GAME:
      return {
        ...state,
        gameState: GAME_STATES.PLAYING,
        isPaused: false,
      };

    case ACTIONS.GAME_OVER:
      return {
        ...state,
        gameState: GAME_STATES.GAME_OVER,
      };

    case ACTIONS.UPDATE_PLAYER:
      return {
        ...state,
        player: { ...state.player, ...action.payload },
      };

    case ACTIONS.UPDATE_ENEMIES:
      return {
        ...state,
        enemies: action.payload,
      };

    case ACTIONS.UPDATE_PROJECTILES:
      return {
        ...state,
        projectiles: action.payload,
      };

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

    case ACTIONS.UPDATE_WAVE:
      return {
        ...state,
        wave: action.payload,
      };

    case ACTIONS.UPDATE_TIME:
      return {
        ...state,
        time: action.payload,
      };

    case ACTIONS.RESET_GAME:
      return initialState;

    default:
      return state;
  }
}

// Provider component
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Action creators
  const startGame = useCallback(() => {
    dispatch({ type: ACTIONS.START_GAME });
  }, []);

  const pauseGame = useCallback(() => {
    dispatch({ type: ACTIONS.PAUSE_GAME });
  }, []);

  const resumeGame = useCallback(() => {
    dispatch({ type: ACTIONS.RESUME_GAME });
  }, []);

  const gameOver = useCallback(() => {
    dispatch({ type: ACTIONS.GAME_OVER });
  }, []);

  const updatePlayer = useCallback((updates) => {
    dispatch({ type: ACTIONS.UPDATE_PLAYER, payload: updates });
  }, []);

  const updateEnemies = useCallback((enemies) => {
    dispatch({ type: ACTIONS.UPDATE_ENEMIES, payload: enemies });
  }, []);

  const updateProjectiles = useCallback((projectiles) => {
    dispatch({ type: ACTIONS.UPDATE_PROJECTILES, payload: projectiles });
  }, []);

  const addEnemy = useCallback((enemy) => {
    dispatch({ type: ACTIONS.ADD_ENEMY, payload: enemy });
  }, []);

  const removeEnemy = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE_ENEMY, payload: id });
  }, []);

  const addProjectile = useCallback((projectile) => {
    dispatch({ type: ACTIONS.ADD_PROJECTILE, payload: projectile });
  }, []);

  const removeProjectile = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE_PROJECTILE, payload: id });
  }, []);

  const updateWave = useCallback((wave) => {
    dispatch({ type: ACTIONS.UPDATE_WAVE, payload: wave });
  }, []);

  const updateTime = useCallback((time) => {
    dispatch({ type: ACTIONS.UPDATE_TIME, payload: time });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_GAME });
  }, []);

  const value = {
    state,
    startGame,
    pauseGame,
    resumeGame,
    gameOver,
    updatePlayer,
    updateEnemies,
    updateProjectiles,
    addEnemy,
    removeEnemy,
    addProjectile,
    removeProjectile,
    updateWave,
    updateTime,
    resetGame,
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
