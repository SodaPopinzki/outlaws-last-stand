import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Input handling hook for keyboard and mouse
 */
export function useInput() {
  const [keys, setKeys] = useState({});
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouseButtons, setMouseButtons] = useState({});
  const canvasRef = useRef(null);

  // Keyboard handlers
  const handleKeyDown = useCallback((e) => {
    setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
  }, []);

  const handleKeyUp = useCallback((e) => {
    setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));
  }, []);

  // Mouse handlers
  const handleMouseMove = useCallback((e) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    setMouseButtons((prev) => ({ ...prev, [e.button]: true }));
  }, []);

  const handleMouseUp = useCallback((e) => {
    setMouseButtons((prev) => ({ ...prev, [e.button]: false }));
  }, []);

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Helper functions
  const isKeyPressed = useCallback(
    (key) => {
      return keys[key.toLowerCase()] || false;
    },
    [keys]
  );

  const isMouseButtonPressed = useCallback(
    (button = 0) => {
      return mouseButtons[button] || false;
    },
    [mouseButtons]
  );

  const getMovementVector = useCallback(() => {
    let x = 0;
    let y = 0;

    if (isKeyPressed('w') || isKeyPressed('arrowup')) y -= 1;
    if (isKeyPressed('s') || isKeyPressed('arrowdown')) y += 1;
    if (isKeyPressed('a') || isKeyPressed('arrowleft')) x -= 1;
    if (isKeyPressed('d') || isKeyPressed('arrowright')) x += 1;

    // Normalize diagonal movement
    const length = Math.sqrt(x * x + y * y);
    if (length > 0) {
      x /= length;
      y /= length;
    }

    return { x, y };
  }, [isKeyPressed]);

  return {
    keys,
    mousePos,
    mouseButtons,
    isKeyPressed,
    isMouseButtonPressed,
    getMovementVector,
    canvasRef,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
  };
}
