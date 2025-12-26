/**
 * Weapon Renderer - Integration Examples
 *
 * Shows how to use the weapon renderer in GameCanvas
 */

import { createWeaponRenderer } from './WeaponRenderer';
import { getWeaponById } from '../data/weapons';

// ========== EXAMPLE 1: Initialize Renderer in GameCanvas ==========

function GameCanvas() {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Create weapon renderer
    rendererRef.current = createWeaponRenderer(ctx, canvas);

    return () => {
      // Cleanup
      if (rendererRef.current) {
        rendererRef.current.clearEffects();
      }
    };
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
}

// ========== EXAMPLE 2: Update Renderer in Game Loop ==========

function gameLoop(dt) {
  const renderer = rendererRef.current;
  if (!renderer) return;

  // Update renderer time and effects
  renderer.update(dt);

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply screen shake
  renderer.applyScreenEffects();

  // Render game objects
  renderPlayer();
  renderEnemies();
  renderProjectiles();

  // Render weapon effects
  renderer.renderMuzzleFlashes();
  renderer.renderImpactParticles();
  renderer.renderGroundEffects();

  // Remove screen effects
  renderer.removeScreenEffects();
}

// ========== EXAMPLE 3: Render Projectiles ==========

function renderProjectiles() {
  const renderer = rendererRef.current;

  state.projectiles.forEach(projectile => {
    const weapon = getWeaponById(projectile.weaponId);
    if (weapon) {
      renderer.renderProjectile(projectile, weapon);
    }
  });
}

// Example projectile structure
const exampleProjectile = {
  id: 'proj_123',
  weaponId: 'six_shooter',
  x: 400,
  y: 300,
  angle: Math.PI / 4,
  vx: 100,
  vy: 100,
  color: '#FFD700',
  size: 4,
  life: 2.0,
};

// ========== EXAMPLE 4: Firing Weapons ==========

function fireWeapon(weaponId, playerX, playerY, targetX, targetY) {
  const weapon = getWeaponById(weaponId);
  const renderer = rendererRef.current;

  // Calculate angle
  const angle = Math.atan2(targetY - playerY, targetX - playerX);

  // Create muzzle flash
  renderer.createMuzzleFlash(playerX, playerY, angle, weapon);

  // Create projectile
  const projectile = {
    id: generateId(),
    weaponId: weapon.id,
    x: playerX,
    y: playerY,
    angle,
    vx: Math.cos(angle) * weapon.baseProjectileSpeed,
    vy: Math.sin(angle) * weapon.baseProjectileSpeed,
    color: weapon.color,
    size: 4,
    life: weapon.range / weapon.baseProjectileSpeed,
  };

  return projectile;
}

// Example: Fire six-shooter
const sixShooter = getWeaponById('six_shooter');
const projectile = fireWeapon('six_shooter', 400, 300, 600, 200);
// Muzzle flash automatically created!

// ========== EXAMPLE 5: Projectile Hit Effects ==========

function onProjectileHit(projectile, enemy, isCritical = false) {
  const renderer = rendererRef.current;
  const weapon = getWeaponById(projectile.weaponId);

  // Create impact particles
  renderer.createImpactParticles(
    enemy.x,
    enemy.y,
    weapon.color,
    isCritical
  );

  // Special effects for different weapon types
  if (weapon.type === 'explosive') {
    // Explosion effect
    renderer.createExplosion(
      projectile.x,
      projectile.y,
      weapon.explosionRadius || 80,
      weapon
    );

    // Add ground effect if it's a molotov
    if (weapon.id.includes('molotov')) {
      renderer.addGroundEffect(
        projectile.x,
        projectile.y,
        weapon.poolRadius || 60,
        weapon.poolDuration || 5.0,
        'fire',
        weapon
      );
    }
  }

  // Critical hit gets extra effects
  if (isCritical) {
    console.log('💥 CRITICAL HIT!');
    // Screen shake and flash already applied in createImpactParticles
  }
}

// Example: Regular hit
onProjectileHit(projectile, enemy, false);
// Result: Gold particles, small impact

// Example: Critical hit
onProjectileHit(projectile, enemy, true);
// Result: Red particles, screen shake, red flash

// ========== EXAMPLE 6: Different Weapon Types ==========

// Bullet weapon (Six-Shooter)
const bulletProjectile = {
  weaponId: 'six_shooter',
  x: 400,
  y: 300,
  angle: 0,
  color: '#FFD700',
  size: 4,
};
renderer.renderProjectile(bulletProjectile, getWeaponById('six_shooter'));
// Result: Elongated bullet with gold trail

// Explosive weapon (Dynamite)
const explosiveProjectile = {
  weaponId: 'dynamite',
  x: 450,
  y: 300,
  life: 0.8,
  color: '#DC143C',
};
renderer.renderProjectile(explosiveProjectile, getWeaponById('dynamite'));
// Result: Animated dynamite with sparking fuse

// Orbit weapon (Lasso)
const orbitProjectile = {
  weaponId: 'lasso',
  x: 500,
  y: 300,
  playerX: 400,
  playerY: 300,
  orbitAngle: Math.PI / 4,
};
renderer.renderProjectile(orbitProjectile, getWeaponById('lasso'));
// Result: Lasso loop connected to player with rope

// Bounce weapon (Deputy Star)
const bounceProjectile = {
  weaponId: 'deputy_star',
  x: 450,
  y: 350,
  bounceCount: 2,
};
renderer.renderProjectile(bounceProjectile, getWeaponById('deputy_star'));
// Result: Star with sparkle trail and bounce indicators

// Cloud weapon (Snake Oil)
const cloudProjectile = {
  weaponId: 'snake_oil',
  x: 500,
  y: 400,
  radius: 80,
  life: 3.0,
  maxLife: 4.0,
};
renderer.renderProjectile(cloudProjectile, getWeaponById('snake_oil'));
// Result: Animated poison cloud with particles

// Ground effect (Molotov)
const groundProjectile = {
  weaponId: 'molotov_whiskey',
  x: 400,
  y: 450,
  radius: 100,
  life: 4.0,
  maxLife: 5.0,
};
renderer.renderProjectile(groundProjectile, getWeaponById('molotov_whiskey'));
// Result: Animated fire pool with flames

// ========== EXAMPLE 7: Explosion Effects ==========

function throwDynamite(x, y, targetX, targetY) {
  const renderer = rendererRef.current;
  const dynamite = getWeaponById('dynamite');

  // Create projectile
  const projectile = {
    id: generateId(),
    weaponId: 'dynamite',
    x,
    y,
    // ... projectile data
  };

  // After fuse time, create explosion
  setTimeout(() => {
    renderer.createExplosion(
      projectile.x,
      projectile.y,
      dynamite.explosionRadius,
      dynamite
    );

    // Damage enemies in radius
    damageEnemiesInRadius(projectile.x, projectile.y, dynamite.explosionRadius);
  }, dynamite.fuseTime * 1000);

  return projectile;
}

// Result:
// - Screen shake (intensity based on radius)
// - Orange screen flash
// - 30 explosion particles radiating outward
// - Shockwave ring expanding

// ========== EXAMPLE 8: Horse Charge Effect ==========

function chargeWithHorse(playerX, playerY, chargeAngle, speed) {
  const renderer = rendererRef.current;

  // Create dust cloud as horse runs
  const interval = setInterval(() => {
    renderer.createHorseCharge(playerX, playerY, chargeAngle, speed);
  }, 100); // Every 0.1 seconds

  // Stop after charge duration
  setTimeout(() => {
    clearInterval(interval);
  }, 2000); // 2 second charge
}

// Result:
// - Dust particles trailing behind
// - Screen shake (mild)
// - Brown/tan dust color

// ========== EXAMPLE 9: Screen Effects Management ==========

// Manual screen shake (for melee hits, etc.)
renderer.addScreenShake(10, 0.3);
// 10 pixel intensity, 0.3 second duration

// Manual screen flash (for power-ups, etc.)
renderer.addScreenFlash('#FFD700', 0.2);
// Gold flash, 0.2 second fade

// Get current shake for UI adjustment
const shake = renderer.getScreenShake();
console.log(`Shake offset: ${shake.x}, ${shake.y}`);

// ========== EXAMPLE 10: Complete Render Loop ==========

function render(dt) {
  const renderer = rendererRef.current;
  const ctx = canvasRef.current.getContext('2d');

  // Update renderer
  renderer.update(dt);

  // Clear canvas
  ctx.fillStyle = '#2C1810'; // Dark brown background
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply screen shake
  renderer.applyScreenEffects();

  // Render ground effects first (behind everything)
  renderer.renderGroundEffects();

  // Render game entities
  renderEnemies(ctx);
  renderPlayer(ctx);
  renderProjectiles(ctx);

  // Render weapon effects on top
  renderer.renderMuzzleFlashes();
  renderer.renderImpactParticles();

  // Remove screen effects (includes flash)
  renderer.removeScreenEffects();

  // Render UI (not affected by shake)
  renderHUD(ctx);
}

// ========== EXAMPLE 11: Critical Hit System ==========

function calculateDamage(baseDamage, player, enemy) {
  let damage = baseDamage;
  const critChance = player.stats.critChance || 0;
  const critDamage = player.stats.critDamage || 1.5;

  // Roll for critical
  const isCritical = Math.random() < critChance;

  if (isCritical) {
    damage *= critDamage;
  }

  return {
    damage,
    isCritical,
  };
}

// Use in collision detection
const result = calculateDamage(50, player, enemy);
if (result.isCritical) {
  // Trigger critical hit effects
  renderer.createImpactParticles(enemy.x, enemy.y, '#FF0000', true);
  // Result: Red particles, screen shake, red flash
}

// ========== EXAMPLE 12: Evolution Weapon Effects ==========

// Legendary weapons get enhanced visuals
const peacemaker = getWeaponById('peacemaker');

const peacemakerProjectile = {
  weaponId: 'peacemaker',
  x: 400,
  y: 300,
  angle: 0,
  color: '#FFD700',
  size: 5,
};

renderer.renderProjectile(peacemakerProjectile, peacemaker);
// Result:
// - Larger bullet
// - Brighter glow (40% opacity vs 30%)
// - Longer trail
// - Gold color

// When it hits (explosive rounds)
renderer.createExplosion(
  peacemakerProjectile.x,
  peacemakerProjectile.y,
  peacemaker.explosionRadius,
  peacemaker
);
// Result: Small explosion per hit

// ========== EXAMPLE 13: Managing Ground Effects ==========

// Add fire pool
renderer.addGroundEffect(
  400, 300,           // x, y
  100,                // radius
  5.0,                // duration (seconds)
  'fire',             // type
  molotovWeapon       // weapon
);

// Add poison pool
renderer.addGroundEffect(
  500, 400,
  80,
  4.0,
  'poison',
  snakeOilWeapon
);

// Ground effects automatically:
// - Animate over time
// - Fade out as life decreases
// - Remove when expired
// - Render in correct order

// ========== EXAMPLE 14: Clearing Effects on Game Over ==========

function onGameOver() {
  const renderer = rendererRef.current;

  // Clear all active effects
  renderer.clearEffects();

  // Result: All particles, flashes, shakes removed
}

// ========== Placeholder Functions ==========

function renderPlayer() {
  // Player rendering code
}

function renderEnemies() {
  // Enemy rendering code
}

function renderHUD() {
  // HUD rendering code
}

function generateId() {
  return `${Date.now()}_${Math.random()}`;
}

function damageEnemiesInRadius(x, y, radius) {
  // Damage calculation
}

// State object placeholder
const state = {
  projectiles: [],
  player: { x: 400, y: 300 },
};

const enemy = { x: 500, y: 300 };
