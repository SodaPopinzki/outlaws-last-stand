// Random generation utilities

/**
 * Pick a random element from an array
 */
export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Generate a random ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Random chance (0-1 probability)
 */
export function chance(probability) {
  return Math.random() < probability;
}

/**
 * Generate random position on canvas edge
 */
export function randomEdgePosition(width, height, padding = 200) {
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: // Top
      return { x: Math.random() * width, y: -padding };
    case 1: // Right
      return { x: width + padding, y: Math.random() * height };
    case 2: // Bottom
      return { x: Math.random() * width, y: height + padding };
    case 3: // Left
      return { x: -padding, y: Math.random() * height };
    default:
      return { x: 0, y: 0 };
  }
}

/**
 * Generate random position within canvas bounds
 */
export function randomPosition(width, height, margin = 0) {
  return {
    x: margin + Math.random() * (width - margin * 2),
    y: margin + Math.random() * (height - margin * 2),
  };
}
