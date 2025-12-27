// Particle system for visual effects

/**
 * Render particle effects
 */
export function renderParticle(ctx, particle) {
  ctx.save();

  const x = particle.x;
  const y = particle.y;
  const size = particle.size || 3;
  const age = particle.age || 0;
  const lifespan = particle.lifespan || 1.0;
  const alpha = Math.max(0, 1 - (age / lifespan));

  ctx.globalAlpha = alpha;

  switch(particle.type) {
    case 'blood':
      // Blood splatter particle
      ctx.fillStyle = '#8B0000'; // Dark red
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#FF0000';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'dust':
      // Dust cloud particle
      ctx.fillStyle = '#D2B48C'; // Tan dust
      ctx.beginPath();
      ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'muzzleFlash':
      // Muzzle flash effect
      ctx.fillStyle = '#FFFF00'; // Bright yellow
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FFA500'; // Orange glow
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Inner white flash
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'explosion':
      // Explosion particle
      ctx.fillStyle = '#FF4500'; // Orange red
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFD700';
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'damageNumber':
      // Floating damage number
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = particle.critical ? '#FFD700' : '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText(particle.text || '', x, y);
      ctx.fillText(particle.text || '', x, y);
      break;

    case 'xpGem':
      // XP gem (glow and pulse)
      const pulseSize = size + Math.sin(Date.now() / 100) * 2;

      // Outer glow
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = '#00FFFF'; // Cyan glow
      ctx.beginPath();
      ctx.arc(x, y, pulseSize * 2, 0, Math.PI * 2);
      ctx.fill();

      // Inner gem
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#00FFFF';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00FFFF';
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Core highlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
      // Default particle
      ctx.fillStyle = particle.color || '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
  }

  ctx.restore();
}

/**
 * Update particle position and age
 */
export function updateParticle(particle, deltaTime) {
  const vx = particle.vx || 0;
  const vy = particle.vy || 0;
  const gravity = particle.gravity || 0;
  const friction = particle.friction || 0.98;

  const newVx = vx * friction;
  const newVy = (vy + gravity * deltaTime) * friction;

  return {
    ...particle,
    x: particle.x + newVx * deltaTime * 60, // Scale by 60 for frame-rate independence
    y: particle.y + newVy * deltaTime * 60,
    vx: newVx,
    vy: newVy,
    age: (particle.age || 0) + deltaTime,
  };
}

/**
 * Check if particle has expired
 */
export function isParticleExpired(particle) {
  const age = particle.age || 0;
  const lifespan = particle.lifespan || 1.0;
  return age >= lifespan;
}

/**
 * Create blood splatter particles
 */
export function createBloodSplatter(x, y, count = 8) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 1 + Math.random() * 2;
    particles.push({
      id: `blood-${Date.now()}-${i}`,
      type: 'blood',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 2,
      lifespan: 0.5 + Math.random() * 0.3,
      age: 0,
      gravity: 5,
      friction: 0.95,
    });
  }
  return particles;
}

/**
 * Create dust cloud particles
 */
export function createDustCloud(x, y, count = 5) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1;
    particles.push({
      id: `dust-${Date.now()}-${i}`,
      type: 'dust',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * 3,
      lifespan: 0.8 + Math.random() * 0.4,
      age: 0,
      gravity: -1, // Float upward
      friction: 0.97,
    });
  }
  return particles;
}

/**
 * Create muzzle flash
 */
export function createMuzzleFlash(x, y) {
  return {
    id: `muzzle-${Date.now()}`,
    type: 'muzzleFlash',
    x,
    y,
    vx: 0,
    vy: 0,
    size: 8,
    lifespan: 0.1, // Very short lived
    age: 0,
  };
}

/**
 * Create explosion particles
 */
export function createExplosion(x, y, count = 12) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 2 + Math.random() * 3;
    particles.push({
      id: `explosion-${Date.now()}-${i}`,
      type: 'explosion',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 4,
      lifespan: 0.6 + Math.random() * 0.4,
      age: 0,
      gravity: 3,
      friction: 0.96,
    });
  }
  return particles;
}

/**
 * Create damage number
 */
export function createDamageNumber(x, y, damage, isCritical = false) {
  return {
    id: `damage-${Date.now()}`,
    type: 'damageNumber',
    x,
    y,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -2, // Float upward
    text: Math.floor(damage).toString(),
    critical: isCritical,
    size: isCritical ? 18 : 14,
    lifespan: 1.0,
    age: 0,
    friction: 0.98,
  };
}

/**
 * Create XP gem
 */
export function createXpGem(x, y, value = 1) {
  return {
    id: `xpgem-${Date.now()}`,
    type: 'xpGem',
    x,
    y,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    size: 5 + value,
    value,
    lifespan: 10.0, // Lasts 10 seconds before fading
    age: 0,
    friction: 0.92,
    gravity: 0,
  };
}
