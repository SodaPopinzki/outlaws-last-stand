import { useEffect, useRef, useCallback, useState } from 'react';
import { useGame, GAME_STATUS } from '../context/GameContext';

// Maximum delta time to prevent spiral of death
const MAX_DELTA_TIME = 100; // 100ms cap

/**
 * Comprehensive game loop hook
 * Manages 60fps game loop with delta time calculations
 * Orchestrates all game system updates in proper order
 *
 * @param {Object} updateFunctions - Object containing all update functions
 * @param {Function} updateFunctions.updatePlayer - Player update function
 * @param {Function} updateFunctions.updateWeapons - Weapon system update
 * @param {Function} updateFunctions.updateProjectiles - Projectile update
 * @param {Function} updateFunctions.updateEnemies - Enemy AI update
 * @param {Function} updateFunctions.updateXPGems - XP gem magnetism/collection
 * @param {Function} updateFunctions.updateParticles - Particle effects update
 * @param {Function} updateFunctions.updateWaveSystem - Wave spawning logic
 * @param {Function} updateFunctions.checkCollisions - Collision detection
 * @param {Function} renderFunction - Optional custom render function
 * @returns {Object} { fps, gameTime } - Debug information
 */
export function useGameLoop(updateFunctions = {}, renderFunction = null) {
  const { state, updateGameTime } = useGame();
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const startTimeRef = useRef();
  const frameCountRef = useRef(0);
  const fpsUpdateTimeRef = useRef(0);
  const [fps, setFps] = useState(60);
  const [gameTime, setGameTime] = useState(0);

  // Destructure update functions with defaults
  const {
    updatePlayer = () => {},
    updateWeapons = () => {},
    updateProjectiles = () => {},
    updateEnemies = () => {},
    updateXPGems = () => {},
    updateParticles = () => {},
    updateWaveSystem = () => {},
    checkCollisions = () => {},
  } = updateFunctions;

  /**
   * Main game loop animation frame callback
   */
  const animate = useCallback(
    (currentTime) => {
      // Initialize timing on first frame
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = currentTime;
        startTimeRef.current = currentTime;
        fpsUpdateTimeRef.current = currentTime;
      }

      // Calculate delta time in milliseconds
      let deltaTime = currentTime - previousTimeRef.current;

      // Cap delta time to prevent spiral of death
      if (deltaTime > MAX_DELTA_TIME) {
        deltaTime = MAX_DELTA_TIME;
      }

      // Convert to seconds for game logic
      const dt = deltaTime / 1000;

      // Update game time
      const currentGameTime = (currentTime - startTimeRef.current) / 1000;
      setGameTime(currentGameTime);
      updateGameTime(currentGameTime);

      // Only update game logic when playing
      if (state.gameStatus === GAME_STATUS.PLAYING) {
        try {
          // ========== Update Phase ==========
          // Update in specific order to ensure proper game logic flow

          // 1. Update player (movement, input, state)
          updatePlayer(dt);

          // 2. Update weapons (cooldowns, firing)
          updateWeapons(dt);

          // 3. Update projectiles (movement, lifetime)
          updateProjectiles(dt);

          // 4. Update enemies (AI, movement, attacks)
          updateEnemies(dt);

          // 5. Update XP gems (magnetism, movement toward player)
          updateXPGems(dt);

          // 6. Update particles (visual effects)
          updateParticles(dt);

          // 7. Update wave system (spawning, wave transitions)
          updateWaveSystem(dt);

          // 8. Check collisions (after all entities have moved)
          checkCollisions();

          // ========== Render Phase ==========
          // Trigger custom render if provided
          if (renderFunction) {
            renderFunction(dt);
          }
        } catch (error) {
          console.error('Game loop error:', error);
        }
      }

      // Calculate FPS
      frameCountRef.current++;
      if (currentTime - fpsUpdateTimeRef.current >= 1000) {
        const currentFps = Math.round(
          (frameCountRef.current * 1000) / (currentTime - fpsUpdateTimeRef.current)
        );
        setFps(currentFps);
        frameCountRef.current = 0;
        fpsUpdateTimeRef.current = currentTime;
      }

      // Store current time for next frame
      previousTimeRef.current = currentTime;

      // Continue loop
      requestRef.current = requestAnimationFrame(animate);
    },
    [
      state.gameStatus,
      updatePlayer,
      updateWeapons,
      updateProjectiles,
      updateEnemies,
      updateXPGems,
      updateParticles,
      updateWaveSystem,
      checkCollisions,
      renderFunction,
      updateGameTime,
    ]
  );

  /**
   * Start/stop game loop based on game status
   */
  useEffect(() => {
    const shouldRun =
      state.gameStatus === GAME_STATUS.PLAYING ||
      state.gameStatus === GAME_STATUS.LEVEL_UP ||
      state.gameStatus === GAME_STATUS.PAUSED;

    if (shouldRun) {
      // Start or resume the loop
      requestRef.current = requestAnimationFrame(animate);

      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    } else {
      // Stop the loop and reset timing
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      previousTimeRef.current = undefined;
      startTimeRef.current = undefined;
    }
  }, [state.gameStatus, animate]);

  /**
   * Reset game time when game resets
   */
  useEffect(() => {
    if (state.gameStatus === GAME_STATUS.MENU) {
      setGameTime(0);
      startTimeRef.current = undefined;
      previousTimeRef.current = undefined;
      frameCountRef.current = 0;
    }
  }, [state.gameStatus]);

  return {
    fps,
    gameTime,
  };
}

/**
 * Simple game loop hook (backward compatible with existing code)
 * @param {Function} update - Update function called each frame with deltaTime
 * @param {boolean} isRunning - Whether the game loop should be running
 * @param {number} targetFPS - Target frames per second (default: 60)
 */
export function useSimpleGameLoop(update, isRunning = true, targetFPS = 60) {
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const fpsInterval = 1000 / targetFPS;

  const animate = useCallback(
    (time) => {
      if (previousTimeRef.current !== undefined) {
        let deltaTime = time - previousTimeRef.current;

        // Cap delta time
        if (deltaTime > MAX_DELTA_TIME) {
          deltaTime = MAX_DELTA_TIME;
        }

        // Only update if enough time has passed for target FPS
        if (deltaTime >= fpsInterval) {
          // Call the update function with deltaTime in seconds
          update(deltaTime / 1000);
          previousTimeRef.current = time - (deltaTime % fpsInterval);
        }
      } else {
        previousTimeRef.current = time;
      }

      requestRef.current = requestAnimationFrame(animate);
    },
    [update, fpsInterval]
  );

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      previousTimeRef.current = undefined;
    }
  }, [isRunning, animate]);
}
