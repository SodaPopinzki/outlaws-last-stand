/**
 * EXAMPLE USAGE OF useGameLoop HOOK
 *
 * This file demonstrates how to use the comprehensive game loop
 * in your game components.
 */

import { useGameLoop } from './useGameLoop';
import { useGame } from '../context/GameContext';

export function GameExample() {
  const {
    state,
    updatePlayer,
    updateEnemies,
    updateProjectiles,
    updateXpGems,
    updateParticles,
    addXp,
    incrementKills,
  } = useGame();

  // Define all update functions
  const updateFunctions = {
    // 1. Update player
    updatePlayer: (dt) => {
      // Handle player movement, invulnerability frames, regeneration, etc.
      const player = state.player;

      // Update invulnerability timer
      if (player.invulnerable && player.invulnerableTime > 0) {
        const newTime = Math.max(0, player.invulnerableTime - dt);
        updatePlayer({
          invulnerableTime: newTime,
          invulnerable: newTime > 0,
        });
      }

      // Health regeneration
      if (player.stats.regen > 0) {
        const healAmount = player.stats.regen * dt;
        if (player.hp < player.maxHp) {
          updatePlayer({
            hp: Math.min(player.maxHp, player.hp + healAmount),
          });
        }
      }
    },

    // 2. Update weapons
    updateWeapons: (dt) => {
      // Update weapon cooldowns
      // Handle automatic firing
      // This would typically be handled by a weapon system manager
    },

    // 3. Update projectiles
    updateProjectiles: (dt) => {
      const updatedProjectiles = state.projectiles
        .map((proj) => ({
          ...proj,
          x: proj.x + proj.vx * dt,
          y: proj.y + proj.vy * dt,
          distanceTraveled: proj.distanceTraveled + Math.abs(proj.vx * dt),
        }))
        .filter((proj) => {
          // Remove projectiles out of range
          return proj.distanceTraveled < proj.range;
        });

      updateProjectiles(updatedProjectiles);
    },

    // 4. Update enemies
    updateEnemies: (dt) => {
      const player = state.player;
      const updatedEnemies = state.enemies.map((enemy) => {
        // Move toward player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          const dirX = dx / dist;
          const dirY = dy / dist;

          return {
            ...enemy,
            x: enemy.x + dirX * enemy.speed * dt,
            y: enemy.y + dirY * enemy.speed * dt,
          };
        }

        return enemy;
      });

      updateEnemies(updatedEnemies);
    },

    // 5. Update XP gems
    updateXPGems: (dt) => {
      const player = state.player;
      const pickupRange = 50 * player.stats.pickupRange;
      const magnetRange = 150 * player.stats.pickupRange;

      const updatedGems = state.xpGems
        .map((gem) => {
          const dx = player.x - gem.x;
          const dy = player.y - gem.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Collect gem if in pickup range
          if (dist < pickupRange) {
            addXp(gem.value);
            return null; // Mark for removal
          }

          // Apply magnetism if in magnet range
          if (dist < magnetRange) {
            const magnetStrength = 200;
            const dirX = dx / dist;
            const dirY = dy / dist;

            return {
              ...gem,
              x: gem.x + dirX * magnetStrength * dt,
              y: gem.y + dirY * magnetStrength * dt,
            };
          }

          return gem;
        })
        .filter((gem) => gem !== null);

      updateXpGems(updatedGems);
    },

    // 6. Update particles
    updateParticles: (dt) => {
      const updatedParticles = state.particles
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx * dt,
          y: particle.y + particle.vy * dt,
          life: particle.life - dt,
          alpha: particle.alpha - dt * particle.fadeRate,
        }))
        .filter((particle) => particle.life > 0 && particle.alpha > 0);

      updateParticles(updatedParticles);
    },

    // 7. Update wave system
    updateWaveSystem: (dt) => {
      // Check if wave is complete
      // Spawn new enemies
      // Trigger boss spawns
      // This is typically handled by a separate wave manager
    },

    // 8. Check collisions
    checkCollisions: () => {
      // Check projectile-enemy collisions
      // Check player-enemy collisions
      // Check player-xp gem collisions
      // This would use your collision system
    },
  };

  // Optional custom render function
  const customRender = (dt) => {
    // Custom rendering logic here
    // This is called after all updates
  };

  // Use the game loop
  const { fps, gameTime } = useGameLoop(updateFunctions, customRender);

  return (
    <div>
      <div>FPS: {fps}</div>
      <div>Game Time: {gameTime.toFixed(1)}s</div>
      {/* Your game canvas here */}
    </div>
  );
}

/**
 * SIMPLE USAGE (Backward Compatible)
 *
 * If you want to use the old API style:
 */
import { useSimpleGameLoop } from './useGameLoop';

export function SimpleGameExample() {
  const update = (dt) => {
    // All your game logic here
    console.log('Delta time:', dt);
  };

  // Simple usage
  useSimpleGameLoop(update, true, 60);

  return <div>Game running...</div>;
}
