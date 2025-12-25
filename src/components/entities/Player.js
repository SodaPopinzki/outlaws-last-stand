// Player entity rendering and logic

/**
 * Render player on canvas
 */
export function renderPlayer(ctx, player) {
  ctx.save();

  // Draw player circle
  ctx.fillStyle = player.color || '#4169E1';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();

  // Draw player outline
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw direction indicator (small line pointing to mouse)
  if (player.aimAngle !== undefined) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    const aimLength = player.size + 10;
    ctx.lineTo(
      player.x + Math.cos(player.aimAngle) * aimLength,
      player.y + Math.sin(player.aimAngle) * aimLength
    );
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Update player position
 */
export function updatePlayer(player, movementX, movementY, canvasWidth, canvasHeight) {
  const newX = player.x + movementX * player.speed;
  const newY = player.y + movementY * player.speed;

  // Keep player within bounds
  const clampedX = Math.max(
    player.size,
    Math.min(canvasWidth - player.size, newX)
  );
  const clampedY = Math.max(
    player.size,
    Math.min(canvasHeight - player.size, newY)
  );

  return {
    ...player,
    x: clampedX,
    y: clampedY,
  };
}

/**
 * Damage player
 */
export function damagePlayer(player, damage) {
  const newHealth = Math.max(0, player.health - damage);
  return {
    ...player,
    health: newHealth,
  };
}

/**
 * Heal player
 */
export function healPlayer(player, amount) {
  const newHealth = Math.min(player.maxHealth, player.health + amount);
  return {
    ...player,
    health: newHealth,
  };
}
