import { useEffect, useRef, useState } from 'react';
import { useGame, GAME_STATUS } from '../../context/GameContext';
import { useSimpleGameLoop } from '../../hooks/useGameLoop';
import { useInput } from '../../hooks/useInput';
import { renderPlayer, updatePlayer, damagePlayer } from '../entities/Player';
import { renderEnemy, updateEnemy, damageEnemy, isEnemyDead } from '../entities/Enemy';
import { renderProjectile, updateProjectile, isProjectileExpired } from '../entities/Projectile';
import {
  renderParticle,
  updateParticle,
  isParticleExpired,
  createBloodSplatter,
  createDustCloud,
  createMuzzleFlash,
  createExplosion,
  createDamageNumber,
  createXpGem,
} from '../entities/Particle';
import { WeaponSystem } from '../../systems/weapons';
import { spawnWave } from '../../systems/spawning';
import { getEnemyCountForWave } from '../../data/enemies';
import {
  checkProjectileEnemyCollisions,
  checkPlayerEnemyCollisions,
  isOutOfBounds,
} from '../../systems/collision';
import { angle } from '../../utils/math';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export function GameCanvas() {
  const canvasRef = useRef(null);
  const weaponSystemRef = useRef(new WeaponSystem());
  const { state, updatePlayer: setPlayer, updateEnemies, updateProjectiles, gameOver } = useGame();
  const input = useInput();
  const [particles, setParticles] = useState([]);

  // Initialize game on mount
  useEffect(() => {
    if (state.gameStatus === GAME_STATUS.PLAYING && state.enemies.length === 0) {
      // Spawn initial wave
      const enemyCount = getEnemyCountForWave(state.wave);
      const enemies = spawnWave(state.wave, enemyCount, CANVAS_WIDTH, CANVAS_HEIGHT, state.player.x, state.player.y);
      updateEnemies(enemies);
    }
  }, [state.gameStatus, state.enemies.length, state.wave, state.player.x, state.player.y, updateEnemies]);

  // Game update loop
  const update = (deltaTime) => {
    if (state.gameStatus !== GAME_STATUS.PLAYING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update weapon system (auto-fire)
    const autoFireProjectiles = weaponSystemRef.current.update(
      deltaTime,
      state.player.x,
      state.player.y,
      state.enemies
    );

    if (autoFireProjectiles.length > 0) {
      updateProjectiles([...state.projectiles, ...autoFireProjectiles]);

      // Create muzzle flash for auto-fire
      const nearestEnemy = state.enemies[0]; // Approximate for flash position
      if (nearestEnemy) {
        const aimAngle = angle(state.player.x, state.player.y, nearestEnemy.x, nearestEnemy.y);
        const muzzleFlash = createMuzzleFlash(
          state.player.x + Math.cos(aimAngle) * 15,
          state.player.y + Math.sin(aimAngle) * 15
        );
        setParticles(prev => [...prev, muzzleFlash]);
      }
    }

    // Handle player movement
    const movement = input.getMovementVector();
    if (movement.x !== 0 || movement.y !== 0) {
      const updatedPlayer = updatePlayer(
        state.player,
        movement.x,
        movement.y,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );
      setPlayer(updatedPlayer);
    }

    // Handle shooting
    if (input.isMouseButtonPressed(0)) {
      const aimAngle = angle(state.player.x, state.player.y, input.mousePos.x, input.mousePos.y);
      setPlayer({ aimAngle });

      const newProjectiles = weaponSystemRef.current.fire(
        state.player.x,
        state.player.y,
        input.mousePos.x,
        input.mousePos.y
      );

      if (newProjectiles.length > 0) {
        updateProjectiles([...state.projectiles, ...newProjectiles]);

        // Create muzzle flash at gun position
        const muzzleFlash = createMuzzleFlash(
          state.player.x + Math.cos(aimAngle) * 15,
          state.player.y + Math.sin(aimAngle) * 15
        );
        setParticles(prev => [...prev, muzzleFlash]);
      }
    }

    // Update enemies
    const updatedEnemies = state.enemies.map((enemy) =>
      updateEnemy(enemy, state.player.x, state.player.y, deltaTime)
    );

    // Update projectiles
    const updatedProjectiles = state.projectiles
      .map((proj) => updateProjectile(proj, deltaTime))
      .filter((proj) => !isProjectileExpired(proj) && !isOutOfBounds(proj, CANVAS_WIDTH, CANVAS_HEIGHT));

    // Check collisions
    const projectileHits = checkProjectileEnemyCollisions(updatedProjectiles, updatedEnemies);
    const playerHits = checkPlayerEnemyCollisions(state.player, updatedEnemies);

    // Apply projectile damage to enemies
    let enemiesAfterDamage = [...updatedEnemies];
    const projectilesToRemove = new Set();
    const newParticles = [];

    projectileHits.forEach((hit) => {
      const enemyIndex = enemiesAfterDamage.findIndex((e) => e.id === hit.enemyId);
      if (enemyIndex !== -1) {
        const enemy = enemiesAfterDamage[enemyIndex];
        enemiesAfterDamage[enemyIndex] = damageEnemy(enemy, hit.damage);

        // Create blood splatter and dust particles
        newParticles.push(...createBloodSplatter(enemy.x, enemy.y, 5));
        newParticles.push(...createDustCloud(enemy.x, enemy.y, 3));

        // Create damage number
        const isCritical = Math.random() < 0.15; // 15% crit chance
        const damageNumber = createDamageNumber(enemy.x, enemy.y - 10, hit.damage, isCritical);
        newParticles.push(damageNumber);

        // Remove projectile if not piercing
        if (!hit.piercing) {
          projectilesToRemove.add(hit.projectileId);
        }
      }
    });

    if (newParticles.length > 0) {
      setParticles(prev => [...prev, ...newParticles]);
    }

    // Remove dead enemies and projectiles that hit
    const aliveEnemies = enemiesAfterDamage.filter((e) => !isEnemyDead(e));
    const activeProjectiles = updatedProjectiles.filter(
      (p) => !projectilesToRemove.has(p.id)
    );

    // Handle killed enemies
    const killedEnemies = enemiesAfterDamage.filter((e) => isEnemyDead(e));
    if (killedEnemies.length > 0) {
      const deathParticles = [];

      killedEnemies.forEach(enemy => {
        // Create explosion effect
        deathParticles.push(...createExplosion(enemy.x, enemy.y, 8));
        deathParticles.push(...createBloodSplatter(enemy.x, enemy.y, 12));

        // Create XP gems
        const xpGem = createXpGem(enemy.x, enemy.y, 5);
        deathParticles.push(xpGem);
      });

      if (deathParticles.length > 0) {
        setParticles(prev => [...prev, ...deathParticles]);
      }

      // Update score
      setPlayer({ score: state.player.score + killedEnemies.length * 10 });
    }

    // Apply player damage (only if not invulnerable)
    let damagedPlayer = state.player;
    if (!state.player.invulnerable && playerHits.length > 0) {
      // Apply damage from first hit only (to prevent multi-hit in same frame)
      damagedPlayer = damagePlayer(damagedPlayer, playerHits[0].damage);

      if (damagedPlayer.health !== state.player.health) {
        setPlayer({
          health: damagedPlayer.health,
          invulnerable: true,
          invulnerableTime: 0.5 // 0.5 second iframes after hit
        });
      }
    }

    // Update invulnerability timer
    if (state.player.invulnerable && state.player.invulnerableTime > 0) {
      const newInvulnerableTime = state.player.invulnerableTime - deltaTime;
      if (newInvulnerableTime <= 0) {
        setPlayer({ invulnerable: false, invulnerableTime: 0 });
      } else {
        setPlayer({ invulnerableTime: newInvulnerableTime });
      }
    }

    // Check game over
    if (damagedPlayer.health <= 0) {
      gameOver();
    }

    // Update particles
    const updatedParticles = particles
      .map(p => updateParticle(p, deltaTime))
      .filter(p => !isParticleExpired(p));
    setParticles(updatedParticles);

    // Update state
    updateEnemies(aliveEnemies);
    updateProjectiles(activeProjectiles);

    // Spawn new wave if all enemies defeated
    if (aliveEnemies.length === 0 && state.gameStatus === GAME_STATUS.PLAYING) {
      const nextWave = state.wave + 1;
      const enemyCount = getEnemyCountForWave(nextWave);
      const newEnemies = spawnWave(nextWave, enemyCount, CANVAS_WIDTH, CANVAS_HEIGHT, state.player.x, state.player.y);
      updateEnemies(newEnemies);
      setPlayer({ level: nextWave });
    }
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with desert sand background
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#c4a35a'); // Desert sand
    gradient.addColorStop(0.5, '#b8985a'); // Slightly darker
    gradient.addColorStop(1, '#c4a35a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Add subtle darker patches for variation
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let i = 0; i < 8; i++) {
      const x = (i * 173 + 50) % CANVAS_WIDTH;
      const y = (i * 137 + 30) % CANVAS_HEIGHT;
      ctx.beginPath();
      ctx.ellipse(x, y, 80, 60, i * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render game entities
    if (state.gameStatus === GAME_STATUS.PLAYING) {
      // Render projectiles
      state.projectiles.forEach((projectile) => {
        renderProjectile(ctx, projectile);
      });

      // Render particles (behind entities)
      particles.forEach((particle) => {
        if (particle.type !== 'damageNumber') {
          renderParticle(ctx, particle);
        }
      });

      // Render enemies
      state.enemies.forEach((enemy) => {
        renderEnemy(ctx, enemy);
      });

      // Render player
      renderPlayer(ctx, state.player);

      // Render damage numbers (on top)
      particles.forEach((particle) => {
        if (particle.type === 'damageNumber') {
          renderParticle(ctx, particle);
        }
      });
    }
  }, [state, particles]);

  // Start game loop
  useSimpleGameLoop(update, state.gameStatus === GAME_STATUS.PLAYING);

  return (
    <canvas
      ref={(ref) => {
        canvasRef.current = ref;
        input.canvasRef.current = ref;
      }}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onMouseMove={input.handleMouseMove}
      onMouseDown={input.handleMouseDown}
      onMouseUp={input.handleMouseUp}
      className="border-4 border-amber-600 rounded-lg shadow-2xl cursor-crosshair"
    />
  );
}
