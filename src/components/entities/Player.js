// Player entity rendering and logic

/**
 * Render player as a cowboy character
 */
export function renderPlayer(ctx, player) {
  ctx.save();

  const x = player.x;
  const y = player.y;
  const size = 20; // Cowboy is ~40px tall

  // Flash when invulnerable or taking damage
  if (player.invulnerable) {
    const flash = Math.floor(Date.now() / 100) % 2 === 0;
    if (flash) {
      ctx.globalAlpha = 0.6;
      // White flash when damaged
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FFFFFF';
    }
  }

  // Determine facing direction (flip sprite if needed)
  const facingLeft = player.aimAngle && Math.abs(player.aimAngle) > Math.PI / 2;

  // === DRAW COWBOY ===

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + size + 2, size * 0.8, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = '#654321'; // Brown pants
  ctx.fillRect(x - 6, y + 5, 5, 12);
  ctx.fillRect(x + 1, y + 5, 5, 12);

  // Body (poncho)
  ctx.fillStyle = '#8B4513'; // Saddle brown poncho
  ctx.beginPath();
  ctx.moveTo(x, y - 5);
  ctx.lineTo(x - 10, y + 8);
  ctx.lineTo(x + 10, y + 8);
  ctx.closePath();
  ctx.fill();

  // Poncho stripe
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 3);
  ctx.lineTo(x + 8, y + 3);
  ctx.stroke();

  // Arms
  ctx.fillStyle = '#D2691E'; // Tan arms
  // Left arm
  const leftArmX = facingLeft ? x - 8 : x - 7;
  ctx.fillRect(leftArmX, y - 2, 4, 10);
  // Right arm
  const rightArmX = facingLeft ? x + 3 : x + 4;
  ctx.fillRect(rightArmX, y - 2, 4, 10);

  // Gun in hand
  ctx.fillStyle = '#2F4F4F'; // Dark gray gun
  ctx.fillRect(facingLeft ? x - 12 : x + 8, y + 2, 6, 3);

  // Head (skin tone)
  ctx.fillStyle = '#FFDBAC'; // Skin tone
  ctx.beginPath();
  ctx.arc(x, y - 10, 7, 0, Math.PI * 2);
  ctx.fill();

  // Cowboy hat
  ctx.fillStyle = '#654321'; // Dark brown hat
  // Hat brim
  ctx.beginPath();
  ctx.ellipse(x, y - 15, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hat crown
  ctx.beginPath();
  ctx.ellipse(x, y - 18, 7, 6, 0, 0, Math.PI);
  ctx.fill();

  // Face details
  // Eyes
  ctx.fillStyle = '#000000';
  ctx.fillRect(facingLeft ? x + 2 : x - 4, y - 12, 2, 2);
  if (!facingLeft) ctx.fillRect(x + 2, y - 12, 2, 2);

  // Bandana/neckerchief
  ctx.fillStyle = '#DC143C'; // Crimson red
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 5);
  ctx.lineTo(x + 5, y - 5);
  ctx.lineTo(x + 3, y - 1);
  ctx.lineTo(x - 3, y - 1);
  ctx.closePath();
  ctx.fill();

  // Invulnerable glow
  if (player.invulnerable) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x, y, size + 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Aim indicator
  if (player.aimAngle !== undefined) {
    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const aimLength = 30;
    ctx.lineTo(
      x + Math.cos(player.aimAngle) * aimLength,
      y + Math.sin(player.aimAngle) * aimLength
    );
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Update player position
 */
export function updatePlayer(player, movementX, movementY, canvasWidth, canvasHeight) {
  // Player speed should be around 3 pixels per frame (180 px/sec at 60fps)
  const actualSpeed = 3;
  const newX = player.x + movementX * actualSpeed;
  const newY = player.y + movementY * actualSpeed;

  // Keep player within bounds (with padding for sprite size)
  const padding = 25;
  const clampedX = Math.max(
    padding,
    Math.min(canvasWidth - padding, newX)
  );
  const clampedY = Math.max(
    padding,
    Math.min(canvasHeight - padding, newY)
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
