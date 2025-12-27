/**
 * GameLoop Component
 *
 * Orchestrates all game systems using the comprehensive useGameLoop hook
 * Manages the main game update cycle with proper system ordering
 */

import { useRef, useCallback } from 'react';
import { useGame, GAME_STATUS } from '../../context/GameContext';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useInput } from '../../hooks/useInput';
import { WeaponSystem } from '../../systems/weapons';
import { updatePlayer, damagePlayer } from '../entities/Player';
import { updateEnemy, damageEnemy, isEnemyDead } from '../entities/Enemy';
import { updateProjectile, isProjectileExpired } from '../entities/Projectile';
import {
  checkProjectileEnemyCollisions,
  checkPlayerEnemyCollisions,
  isOutOfBounds,
} from '../../systems/collision';
import { spawnWave } from '../../systems/spawning';
import { getEnemyCountForWave } from '../../data/enemies';
import { angle, distance } from '../../utils/math';
import { generateId } from '../../utils/random';
import { updateCharacterProgress } from '../../data/characters';
import { calculateDamage, calculateIncomingDamage } from '../../systems/PassiveSystem';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export function GameLoop({ canvasRef }) {
  const {
    state,
    updatePlayer: setPlayer,
    damagePlayer: playerTakeDamage,
    healPlayer,
    addXp,
    updateEnemies,
    updateProjectiles,
    addProjectile,
    updateXpGems,
    addXpGem,
    removeXpGem,
    updateParticles,
    addParticle,
    incrementKills,
    nextWave,
    gameOver,
  } = useGame();

  const input = useInput();
  const weaponSystemRef = useRef(new WeaponSystem());
  const playerDistanceRef = useRef(0);
  const projectileCountRef = useRef(0);

  /**
   * 1. Update Player
   */
  const updatePlayerSystem = useCallback(
    (dt) => {
      // Handle movement
      const movement = input.getMovementVector();
      if (movement.x !== 0 || movement.y !== 0) {
        const player = state.player;

        // Apply speed modifier from passive
        const passiveSpeedMod = player.passiveManager?.getSpeedModifier() || 1.0;
        const moveSpeed = player.speed * player.stats.moveSpeed * passiveSpeedMod;

        const updatedPlayer = updatePlayer(
          player,
          movement.x,
          movement.y,
          CANVAS_WIDTH,
          CANVAS_HEIGHT
        );

        // Track distance traveled
        const distMoved = Math.sqrt(
          Math.pow(movement.x * moveSpeed * dt, 2) +
          Math.pow(movement.y * moveSpeed * dt, 2)
        );
        playerDistanceRef.current += distMoved;

        setPlayer(updatedPlayer);
      }

      // Update invulnerability
      if (state.player.invulnerable && state.player.invulnerableTime > 0) {
        const newTime = Math.max(0, state.player.invulnerableTime - dt);
        setPlayer({
          invulnerableTime: newTime,
          invulnerable: newTime > 0,
        });
      }

      // Health regeneration
      if (state.player.stats.regen > 0) {
        const healAmount = state.player.stats.regen * dt;
        if (state.player.health < state.player.maxHealth) {
          healPlayer(healAmount);
        }
      }

      // Update aim angle
      const aimAngle = angle(
        state.player.x,
        state.player.y,
        input.mousePos.x,
        input.mousePos.y
      );
      setPlayer({ aimAngle });
    },
    [state.player, input, setPlayer, healPlayer]
  );

  /**
   * 2. Update Weapons
   */
  const updateWeaponsSystem = useCallback(
    (dt) => {
      weaponSystemRef.current.update(dt);

      // Handle shooting
      if (input.isMouseButtonPressed(0) && weaponSystemRef.current.canFireNow()) {
        const newProjectiles = weaponSystemRef.current.fire(
          state.player.x,
          state.player.y,
          input.mousePos.x,
          input.mousePos.y
        );

        if (newProjectiles.length > 0) {
          newProjectiles.forEach((proj) => addProjectile(proj));
          projectileCountRef.current += newProjectiles.length;
        }
      }
    },
    [state.player, input, addProjectile]
  );

  /**
   * 3. Update Projectiles
   */
  const updateProjectilesSystem = useCallback(
    (dt) => {
      const updatedProjectiles = state.projectiles
        .map((proj) => updateProjectile(proj, dt))
        .filter(
          (proj) =>
            !isProjectileExpired(proj) &&
            !isOutOfBounds(proj, CANVAS_WIDTH, CANVAS_HEIGHT)
        );

      updateProjectiles(updatedProjectiles);
    },
    [state.projectiles, updateProjectiles]
  );

  /**
   * 4. Update Enemies
   */
  const updateEnemiesSystem = useCallback(
    (dt) => {
      const updatedEnemies = state.enemies.map((enemy) =>
        updateEnemy(enemy, state.player.x, state.player.y, dt)
      );

      updateEnemies(updatedEnemies);
    },
    [state.enemies, state.player, updateEnemies]
  );

  /**
   * 5. Update XP Gems
   */
  const updateXPGemsSystem = useCallback(
    (dt) => {
      const player = state.player;

      // Apply pickup range modifier from passive
      const passivePickupMod = player.passiveManager?.getPickupRangeModifier() || 1.0;
      const pickupRange = 50 * player.stats.pickupRange * passivePickupMod;
      const magnetRange = 150 * player.stats.pickupRange * passivePickupMod;

      const remainingGems = [];

      state.xpGems.forEach((gem) => {
        const dx = player.x - gem.x;
        const dy = player.y - gem.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Collect gem if in pickup range
        if (dist < pickupRange) {
          // Apply XP modifier from passive
          const modifiedXp = player.passiveManager?.onXpCollected(gem.value, gem.isGold) || gem.value;
          addXp(modifiedXp);
          return; // Don't add to remaining
        }

        // Apply magnetism if in magnet range
        if (dist < magnetRange) {
          const magnetStrength = 200;
          const dirX = dx / dist;
          const dirY = dy / dist;

          remainingGems.push({
            ...gem,
            x: gem.x + dirX * magnetStrength * dt,
            y: gem.y + dirY * magnetStrength * dt,
          });
        } else {
          remainingGems.push(gem);
        }
      });

      updateXpGems(remainingGems);
    },
    [state.player, state.xpGems, addXp, updateXpGems]
  );

  /**
   * 6. Update Particles
   */
  const updateParticlesSystem = useCallback(
    (dt) => {
      const updatedParticles = state.particles
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx * dt,
          y: particle.y + particle.vy * dt,
          life: particle.life - dt,
          alpha: Math.max(0, particle.alpha - dt * (particle.fadeRate || 1)),
        }))
        .filter((particle) => particle.life > 0 && particle.alpha > 0);

      updateParticles(updatedParticles);
    },
    [state.particles, updateParticles]
  );

  /**
   * 7. Update Wave System
   */
  const updateWaveSystemCallback = useCallback(
    (dt) => {
      // Check if wave is complete
      if (state.enemies.length === 0 && state.gameStatus === GAME_STATUS.PLAYING) {
        // Small delay before spawning next wave
        setTimeout(() => {
          nextWave();
          const enemyCount = getEnemyCountForWave(state.wave + 1);
          const newEnemies = spawnWave(
            state.wave + 1,
            enemyCount,
            CANVAS_WIDTH,
            CANVAS_HEIGHT
          );
          updateEnemies(newEnemies);
        }, 1000);
      }
    },
    [state.enemies, state.wave, state.gameStatus, nextWave, updateEnemies]
  );

  /**
   * 8. Check Collisions
   */
  const checkCollisionsCallback = useCallback(() => {
    const player = state.player;
    const passiveManager = player.passiveManager;

    // Projectile-Enemy collisions
    const projectileHits = checkProjectileEnemyCollisions(
      state.projectiles,
      state.enemies
    );

    let enemiesAfterDamage = [...state.enemies];
    const projectilesToRemove = new Set();

    projectileHits.forEach((hit) => {
      const enemyIndex = enemiesAfterDamage.findIndex((e) => e.id === hit.enemyId);
      if (enemyIndex !== -1) {
        const enemy = enemiesAfterDamage[enemyIndex];

        // Apply passive damage modifiers
        let finalDamage = hit.damage;
        if (passiveManager) {
          finalDamage = calculateDamage(passiveManager, hit.damage, {
            targetEnemy: enemy,
            baseDamage: hit.damage,
          });
        }

        enemiesAfterDamage[enemyIndex] = damageEnemy(enemy, finalDamage);

        // Check for life steal
        if (passiveManager) {
          const healing = passiveManager.onDamageDealt(finalDamage, 'normal');
          if (healing > 0) {
            healPlayer(healing);
          }
        }

        // Remove projectile if not piercing
        if (!hit.piercing) {
          projectilesToRemove.add(hit.projectileId);
        }

        // Create hit particle
        addParticle({
          id: generateId(),
          x: enemy.x,
          y: enemy.y,
          vx: (Math.random() - 0.5) * 100,
          vy: (Math.random() - 0.5) * 100,
          life: 0.5,
          alpha: 1,
          color: '#FFD700',
          size: 4,
          fadeRate: 2,
        });
      }
    });

    // Remove dead enemies and spawn XP gems
    const aliveEnemies = [];
    let killCount = 0;

    enemiesAfterDamage.forEach((enemy) => {
      if (isEnemyDead(enemy)) {
        killCount++;

        // Spawn regular XP gem
        addXpGem({
          id: generateId(),
          x: enemy.x,
          y: enemy.y,
          value: enemy.score || 10,
          color: '#32CD32',
          size: 6,
          isGold: false,
        });

        // Check for special spawns from passive (gold nuggets, etc.)
        if (passiveManager) {
          const spawns = passiveManager.onEnemyKilled(enemy, { x: enemy.x, y: enemy.y });
          spawns.forEach((spawn) => {
            if (spawn.type === 'gold') {
              addXpGem(spawn);
            }
          });
        }

        // Death particles
        for (let i = 0; i < 8; i++) {
          addParticle({
            id: generateId(),
            x: enemy.x,
            y: enemy.y,
            vx: (Math.random() - 0.5) * 200,
            vy: (Math.random() - 0.5) * 200,
            life: 1,
            alpha: 1,
            color: enemy.color,
            size: 3,
            fadeRate: 1,
          });
        }
      } else {
        aliveEnemies.push(enemy);
      }
    });

    if (killCount > 0) {
      incrementKills(killCount);
    }

    // Player-Enemy collisions
    const playerHits = checkPlayerEnemyCollisions(player, aliveEnemies);
    if (playerHits.length > 0 && !player.invulnerable) {
      let totalDamage = playerHits.reduce((sum, hit) => sum + hit.damage, 0);

      // Apply damage reduction from passive
      if (passiveManager) {
        totalDamage = calculateIncomingDamage(passiveManager, totalDamage);
      }

      playerTakeDamage(totalDamage);

      // Set invulnerability frames
      setPlayer({
        invulnerable: true,
        invulnerableTime: 0.5, // 0.5 seconds
      });
    }

    // Update state
    updateEnemies(aliveEnemies);
    const activeProjectiles = state.projectiles.filter(
      (p) => !projectilesToRemove.has(p.id)
    );
    updateProjectiles(activeProjectiles);
  }, [
    state.projectiles,
    state.enemies,
    state.player,
    updateEnemies,
    updateProjectiles,
    playerTakeDamage,
    setPlayer,
    addXpGem,
    addParticle,
    incrementKills,
    healPlayer,
  ]);

  // Initialize wave on game start
  const initializeGame = useCallback(() => {
    if (state.enemies.length === 0 && state.gameStatus === GAME_STATUS.PLAYING) {
      const enemyCount = getEnemyCountForWave(state.wave);
      const enemies = spawnWave(state.wave, enemyCount, CANVAS_WIDTH, CANVAS_HEIGHT);
      updateEnemies(enemies);
    }
  }, [state.enemies.length, state.wave, state.gameStatus, updateEnemies]);

  // Initialize on mount
  useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  // Use the comprehensive game loop
  const { fps, gameTime } = useGameLoop({
    updatePlayer: updatePlayerSystem,
    updateWeapons: updateWeaponsSystem,
    updateProjectiles: updateProjectilesSystem,
    updateEnemies: updateEnemiesSystem,
    updateXPGems: updateXPGemsSystem,
    updateParticles: updateParticlesSystem,
    updateWaveSystem: updateWaveSystemCallback,
    checkCollisions: checkCollisionsCallback,
  });

  // Save progress on game over
  useCallback(() => {
    if (state.gameStatus === GAME_STATUS.GAME_OVER) {
      updateCharacterProgress({
        totalKills: state.kills,
        maxWaveReached: Math.max(state.wave, 0),
        totalDistanceTraveled: playerDistanceRef.current,
        totalProjectilesFired: projectileCountRef.current,
      });
    }
  }, [state.gameStatus, state.kills, state.wave]);

  return {
    fps,
    gameTime,
    weaponSystem: weaponSystemRef.current,
    inputHandlers: {
      onMouseMove: input.handleMouseMove,
      onMouseDown: input.handleMouseDown,
      onMouseUp: input.handleMouseUp,
      canvasRef: input.canvasRef,
    },
  };
}
