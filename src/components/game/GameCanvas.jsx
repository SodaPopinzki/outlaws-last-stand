import { useEffect, useRef } from 'react';
import { useGame, GAME_STATES } from '../../context/GameContext';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useInput } from '../../hooks/useInput';
import { renderPlayer, updatePlayer, damagePlayer } from '../entities/Player';
import { renderEnemy, updateEnemy, damageEnemy, isEnemyDead } from '../entities/Enemy';
import { renderProjectile, updateProjectile, isProjectileExpired } from '../entities/Projectile';
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

  // Initialize game on mount
  useEffect(() => {
    if (state.gameState === GAME_STATES.PLAYING && state.enemies.length === 0) {
      // Spawn initial wave
      const enemyCount = getEnemyCountForWave(state.wave);
      const enemies = spawnWave(state.wave, enemyCount, CANVAS_WIDTH, CANVAS_HEIGHT);
      updateEnemies(enemies);
    }
  }, [state.gameState, state.enemies.length, state.wave, updateEnemies]);

  // Game update loop
  const update = (deltaTime) => {
    if (state.gameState !== GAME_STATES.PLAYING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update weapon system
    weaponSystemRef.current.update(deltaTime);

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

    projectileHits.forEach((hit) => {
      const enemyIndex = enemiesAfterDamage.findIndex((e) => e.id === hit.enemyId);
      if (enemyIndex !== -1) {
        enemiesAfterDamage[enemyIndex] = damageEnemy(
          enemiesAfterDamage[enemyIndex],
          hit.damage
        );

        // Remove projectile if not piercing
        if (!hit.piercing) {
          projectilesToRemove.add(hit.projectileId);
        }
      }
    });

    // Remove dead enemies and projectiles that hit
    const aliveEnemies = enemiesAfterDamage.filter((e) => !isEnemyDead(e));
    const activeProjectiles = updatedProjectiles.filter(
      (p) => !projectilesToRemove.has(p.id)
    );

    // Update score for killed enemies
    const killedCount = enemiesAfterDamage.length - aliveEnemies.length;
    if (killedCount > 0) {
      setPlayer({ score: state.player.score + killedCount * 10 });
    }

    // Apply player damage
    let damagedPlayer = state.player;
    playerHits.forEach((hit) => {
      damagedPlayer = damagePlayer(damagedPlayer, hit.damage);
    });

    if (damagedPlayer.health !== state.player.health) {
      setPlayer({ health: damagedPlayer.health });
    }

    // Check game over
    if (damagedPlayer.health <= 0) {
      gameOver();
    }

    // Update state
    updateEnemies(aliveEnemies);
    updateProjectiles(activeProjectiles);

    // Spawn new wave if all enemies defeated
    if (aliveEnemies.length === 0 && state.gameState === GAME_STATES.PLAYING) {
      const nextWave = state.wave + 1;
      const enemyCount = getEnemyCountForWave(nextWave);
      const newEnemies = spawnWave(nextWave, enemyCount, CANVAS_WIDTH, CANVAS_HEIGHT);
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

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Render game entities
    if (state.gameState === GAME_STATES.PLAYING) {
      // Render projectiles
      state.projectiles.forEach((projectile) => {
        renderProjectile(ctx, projectile);
      });

      // Render enemies
      state.enemies.forEach((enemy) => {
        renderEnemy(ctx, enemy);
      });

      // Render player
      renderPlayer(ctx, state.player);
    }
  }, [state]);

  // Start game loop
  useGameLoop(update, state.gameState === GAME_STATES.PLAYING);

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
