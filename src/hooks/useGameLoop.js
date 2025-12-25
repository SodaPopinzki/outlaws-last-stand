import { useEffect, useRef, useCallback } from 'react';

/**
 * Game loop hook - manages the main game update cycle
 * @param {Function} update - Update function called each frame with deltaTime
 * @param {boolean} isRunning - Whether the game loop should be running
 * @param {number} targetFPS - Target frames per second (default: 60)
 */
export function useGameLoop(update, isRunning = true, targetFPS = 60) {
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const fpsInterval = 1000 / targetFPS;

  const animate = useCallback(
    (time) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;

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
