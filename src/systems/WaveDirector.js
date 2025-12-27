/**
 * Wave Director System - Intelligent wave spawning and pacing
 *
 * Manages enemy spawning, wave composition, difficulty scaling, and wave announcements
 */

import { ENEMIES, ENEMY_TIERS, getEnemyStatsForWave } from '../data/enemies.js';
import { getBossForWave, isBossWave } from '../data/bosses.js';

// Wave types
export const WAVE_TYPES = {
  NORMAL: 'normal',
  BOSS: 'boss',
  SWARM: 'swarm',
  ELITE: 'elite',
  MINI_BOSS: 'mini_boss',
};

// Spawn patterns
export const SPAWN_PATTERNS = {
  EDGES: 'edges',           // Random edges
  CLUSTER: 'cluster',       // Groups of enemies
  CARDINAL: 'cardinal',     // North, South, East, West
  SURROUND: 'surround',     // Circle around player
  WAVE_FRONT: 'wave_front', // Line formation
};

/**
 * WaveDirector - Manages wave composition and spawning
 */
export class WaveDirector {
  constructor(difficulty = 1.0, canvasWidth = 1200, canvasHeight = 800) {
    this.difficulty = difficulty;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Wave state
    this.currentWave = 0;
    this.waveType = WAVE_TYPES.NORMAL;
    this.waveActive = false;
    this.waveComplete = false;

    // Spawn queue
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.baseSpawnInterval = 0.5;    // Spawn every 0.5s
    this.currentSpawnInterval = 0.5;

    // Dynamic difficulty
    this.playerHpHistory = [];
    this.killRateHistory = [];
    this.difficultyMultiplier = 1.0;
    this.spawnPaused = false;
    this.pauseDuration = 0;

    // Performance tracking
    this.waveStartTime = 0;
    this.totalKillsThisWave = 0;
    this.playerDamageTakenThisWave = 0;

    // Spawn edge offsets
    this.spawnEdgeOffset = 50;       // Spawn 50px off-screen
  }

  /**
   * Start a new wave
   */
  startWave(waveNumber, player, dispatch) {
    this.currentWave = waveNumber;
    this.waveActive = true;
    this.waveComplete = false;
    this.waveStartTime = Date.now();
    this.totalKillsThisWave = 0;
    this.playerDamageTakenThisWave = 0;

    // Determine wave type
    this.waveType = this.determineWaveType(waveNumber);

    // Generate wave composition
    const composition = this.generateWaveComposition(waveNumber);

    // Create spawn queue
    this.spawnQueue = this.createSpawnQueue(composition, player);

    // Calculate spawn interval (faster spawns on higher waves)
    this.currentSpawnInterval = this.calculateSpawnInterval(waveNumber);

    // Show wave announcement
    this.showWaveAnnouncement(dispatch);

    // Adjust difficulty
    this.adjustDifficulty(player);
  }

  /**
   * Determine wave type based on wave number
   */
  determineWaveType(waveNumber) {
    // Boss waves every 5 waves
    if (isBossWave(waveNumber)) {
      return WAVE_TYPES.BOSS;
    }

    // Special wave patterns
    const mod10 = waveNumber % 10;

    if (mod10 === 3 || mod10 === 8) {
      return WAVE_TYPES.SWARM; // Waves 3, 8, 13, 18...
    }

    if (mod10 === 4 || mod10 === 9) {
      return WAVE_TYPES.ELITE; // Waves 4, 9, 14, 19...
    }

    if (waveNumber % 7 === 0 && !isBossWave(waveNumber)) {
      return WAVE_TYPES.MINI_BOSS; // Waves 7, 14, 21... (not boss waves)
    }

    return WAVE_TYPES.NORMAL;
  }

  /**
   * Generate wave composition
   */
  generateWaveComposition(waveNumber) {
    const composition = {
      enemies: [],
      bossId: null,
      pattern: SPAWN_PATTERNS.EDGES,
      totalCount: 0,
    };

    // Boss waves
    if (this.waveType === WAVE_TYPES.BOSS) {
      const boss = getBossForWave(waveNumber);
      composition.bossId = boss?.id || null;
      composition.totalCount = this.calculateBossWaveEnemyCount(waveNumber);
      composition.enemies = this.selectBossWaveEnemies(waveNumber, composition.totalCount);
      composition.pattern = SPAWN_PATTERNS.EDGES;
      return composition;
    }

    // Calculate base enemy count
    let baseCount = 10 + waveNumber * 3;

    // Modify based on wave type
    switch (this.waveType) {
      case WAVE_TYPES.SWARM:
        baseCount = Math.floor(baseCount * 2.0); // Double enemies
        composition.pattern = SPAWN_PATTERNS.CLUSTER;
        break;

      case WAVE_TYPES.ELITE:
        baseCount = Math.floor(baseCount * 0.5); // Half enemies
        composition.pattern = SPAWN_PATTERNS.CARDINAL;
        break;

      case WAVE_TYPES.MINI_BOSS:
        baseCount = Math.floor(baseCount * 0.7); // 70% enemies
        composition.pattern = SPAWN_PATTERNS.SURROUND;
        break;

      default:
        composition.pattern = SPAWN_PATTERNS.EDGES;
    }

    // Apply difficulty multiplier
    baseCount = Math.floor(baseCount * this.difficultyMultiplier);

    composition.totalCount = baseCount;
    composition.enemies = this.selectEnemies(waveNumber, baseCount);

    return composition;
  }

  /**
   * Select enemies for the wave
   */
  selectEnemies(waveNumber, count) {
    const enemies = [];

    // Determine tier distribution
    const distribution = this.getTierDistribution(waveNumber);

    // Calculate enemy counts per tier
    const tierCounts = {
      [ENEMY_TIERS.COMMON]: Math.floor(count * distribution.common),
      [ENEMY_TIERS.UNCOMMON]: Math.floor(count * distribution.uncommon),
      [ENEMY_TIERS.RARE]: Math.floor(count * distribution.rare),
      [ENEMY_TIERS.ELITE]: Math.floor(count * distribution.elite),
    };

    // Ensure we hit the target count
    const totalAllocated = Object.values(tierCounts).reduce((a, b) => a + b, 0);
    tierCounts[ENEMY_TIERS.COMMON] += count - totalAllocated;

    // Select enemies from each tier
    Object.entries(tierCounts).forEach(([tier, tierCount]) => {
      const availableEnemies = this.getAvailableEnemiesForTier(tier, waveNumber);

      for (let i = 0; i < tierCount; i++) {
        if (availableEnemies.length > 0) {
          // Weighted random selection
          const selected = this.weightedRandomEnemy(availableEnemies);
          enemies.push(selected.id);
        }
      }
    });

    return enemies;
  }

  /**
   * Get tier distribution based on wave and type
   */
  getTierDistribution(waveNumber) {
    let distribution = {
      common: 0.40,
      uncommon: 0.35,
      rare: 0.20,
      elite: 0.05,
    };

    // Adjust based on wave type
    switch (this.waveType) {
      case WAVE_TYPES.SWARM:
        // Mostly weak enemies
        distribution = {
          common: 0.70,
          uncommon: 0.25,
          rare: 0.05,
          elite: 0.00,
        };
        break;

      case WAVE_TYPES.ELITE:
        // Mostly strong enemies
        distribution = {
          common: 0.10,
          uncommon: 0.20,
          rare: 0.40,
          elite: 0.30,
        };
        break;

      case WAVE_TYPES.MINI_BOSS:
        // Balanced but higher elite chance
        distribution = {
          common: 0.30,
          uncommon: 0.30,
          rare: 0.25,
          elite: 0.15,
        };
        break;
    }

    // Scale with wave progression
    if (waveNumber >= 20) {
      distribution.common -= 0.10;
      distribution.elite += 0.10;
    }

    if (waveNumber >= 35) {
      distribution.common -= 0.10;
      distribution.rare += 0.05;
      distribution.elite += 0.05;
    }

    return distribution;
  }

  /**
   * Get available enemies for a tier
   */
  getAvailableEnemiesForTier(tier, waveNumber) {
    return Object.values(ENEMIES).filter((enemy) => {
      return (
        enemy.tier === tier &&
        enemy.waveRequirement <= waveNumber
      );
    });
  }

  /**
   * Weighted random enemy selection
   */
  weightedRandomEnemy(enemies) {
    const totalWeight = enemies.reduce((sum, enemy) => sum + enemy.spawnWeight, 0);
    let random = Math.random() * totalWeight;

    for (const enemy of enemies) {
      random -= enemy.spawnWeight;
      if (random <= 0) {
        return enemy;
      }
    }

    return enemies[0];
  }

  /**
   * Calculate enemy count for boss waves (fewer regular enemies)
   */
  calculateBossWaveEnemyCount(waveNumber) {
    // Boss waves have 40% normal enemy count
    const normalCount = 10 + waveNumber * 3;
    return Math.floor(normalCount * 0.4);
  }

  /**
   * Select enemies for boss waves (lower tier enemies)
   */
  selectBossWaveEnemies(waveNumber, count) {
    const enemies = [];

    // Boss waves spawn mostly common/uncommon enemies
    const distribution = {
      common: 0.60,
      uncommon: 0.30,
      rare: 0.10,
      elite: 0.00,
    };

    const tierCounts = {
      [ENEMY_TIERS.COMMON]: Math.floor(count * distribution.common),
      [ENEMY_TIERS.UNCOMMON]: Math.floor(count * distribution.uncommon),
      [ENEMY_TIERS.RARE]: Math.floor(count * distribution.rare),
    };

    const totalAllocated = Object.values(tierCounts).reduce((a, b) => a + b, 0);
    tierCounts[ENEMY_TIERS.COMMON] += count - totalAllocated;

    Object.entries(tierCounts).forEach(([tier, tierCount]) => {
      const availableEnemies = this.getAvailableEnemiesForTier(tier, waveNumber);

      for (let i = 0; i < tierCount; i++) {
        if (availableEnemies.length > 0) {
          const selected = this.weightedRandomEnemy(availableEnemies);
          enemies.push(selected.id);
        }
      }
    });

    return enemies;
  }

  /**
   * Create spawn queue with timing and positions
   */
  createSpawnQueue(composition, player) {
    const queue = [];

    composition.enemies.forEach((enemyId, index) => {
      const spawnDelay = index * this.currentSpawnInterval;
      const spawnPosition = this.calculateSpawnPosition(
        composition.pattern,
        index,
        composition.enemies.length,
        player
      );

      queue.push({
        enemyId,
        delay: spawnDelay,
        x: spawnPosition.x,
        y: spawnPosition.y,
        spawned: false,
      });
    });

    // Sort by delay
    queue.sort((a, b) => a.delay - b.delay);

    return queue;
  }

  /**
   * Calculate spawn position based on pattern
   */
  calculateSpawnPosition(pattern, index, total, player) {
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;

    switch (pattern) {
      case SPAWN_PATTERNS.EDGES:
        return this.getEdgeSpawnPosition();

      case SPAWN_PATTERNS.CLUSTER:
        return this.getClusterSpawnPosition(index, total);

      case SPAWN_PATTERNS.CARDINAL:
        return this.getCardinalSpawnPosition(index, total);

      case SPAWN_PATTERNS.SURROUND:
        return this.getSurroundSpawnPosition(index, total, player);

      case SPAWN_PATTERNS.WAVE_FRONT:
        return this.getWaveFrontSpawnPosition(index, total);

      default:
        return this.getEdgeSpawnPosition();
    }
  }

  /**
   * Random edge spawn
   */
  getEdgeSpawnPosition() {
    const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    const offset = this.spawnEdgeOffset;

    switch (edge) {
      case 0: // Top
        return {
          x: Math.random() * this.canvasWidth,
          y: -offset,
        };
      case 1: // Right
        return {
          x: this.canvasWidth + offset,
          y: Math.random() * this.canvasHeight,
        };
      case 2: // Bottom
        return {
          x: Math.random() * this.canvasWidth,
          y: this.canvasHeight + offset,
        };
      case 3: // Left
        return {
          x: -offset,
          y: Math.random() * this.canvasHeight,
        };
    }
  }

  /**
   * Cluster spawn (groups)
   */
  getClusterSpawnPosition(index, total) {
    const clustersPerWave = Math.ceil(total / 10); // Groups of ~10
    const clusterIndex = Math.floor(index / (total / clustersPerWave));

    // Each cluster spawns from a random edge
    const clusterEdge = clusterIndex % 4;
    const offset = this.spawnEdgeOffset;
    const clusterSpread = 100;

    const basePos = this.getEdgeSpawnPosition();

    // Add some spread within cluster
    return {
      x: basePos.x + (Math.random() - 0.5) * clusterSpread,
      y: basePos.y + (Math.random() - 0.5) * clusterSpread,
    };
  }

  /**
   * Cardinal direction spawn (N, E, S, W)
   */
  getCardinalSpawnPosition(index, total) {
    const direction = index % 4;
    const offset = this.spawnEdgeOffset;
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;

    switch (direction) {
      case 0: // North
        return { x: centerX + (Math.random() - 0.5) * 200, y: -offset };
      case 1: // East
        return { x: this.canvasWidth + offset, y: centerY + (Math.random() - 0.5) * 200 };
      case 2: // South
        return { x: centerX + (Math.random() - 0.5) * 200, y: this.canvasHeight + offset };
      case 3: // West
        return { x: -offset, y: centerY + (Math.random() - 0.5) * 200 };
    }
  }

  /**
   * Surround spawn (circle around player)
   */
  getSurroundSpawnPosition(index, total, player) {
    const angle = (Math.PI * 2 * index) / total;
    const radius = 400; // Spawn 400px away from player

    return {
      x: player.x + Math.cos(angle) * radius,
      y: player.y + Math.sin(angle) * radius,
    };
  }

  /**
   * Wave front spawn (line formation)
   */
  getWaveFrontSpawnPosition(index, total) {
    const edge = Math.floor(Math.random() * 4);
    const offset = this.spawnEdgeOffset;
    const position = (index / total) * (edge % 2 === 0 ? this.canvasWidth : this.canvasHeight);

    switch (edge) {
      case 0: // Top
        return { x: position, y: -offset };
      case 1: // Right
        return { x: this.canvasWidth + offset, y: position };
      case 2: // Bottom
        return { x: position, y: this.canvasHeight + offset };
      case 3: // Left
        return { x: -offset, y: position };
    }
  }

  /**
   * Calculate spawn interval (faster on higher waves)
   */
  calculateSpawnInterval(waveNumber) {
    const baseInterval = this.baseSpawnInterval;
    const reduction = Math.min(waveNumber * 0.01, 0.3); // Max 30% faster

    let interval = baseInterval * (1 - reduction);

    // Swarm waves spawn faster
    if (this.waveType === WAVE_TYPES.SWARM) {
      interval *= 0.6; // 40% faster
    }

    // Elite waves spawn slower
    if (this.waveType === WAVE_TYPES.ELITE) {
      interval *= 1.5; // 50% slower
    }

    return Math.max(interval, 0.1); // Minimum 0.1s
  }

  /**
   * Update spawning (call every frame)
   */
  updateSpawning(dt, player, dispatch) {
    if (!this.waveActive || this.spawnQueue.length === 0) {
      return;
    }

    // Handle spawn pause (difficulty adjustment)
    if (this.spawnPaused) {
      this.pauseDuration -= dt;
      if (this.pauseDuration <= 0) {
        this.spawnPaused = false;
      }
      return;
    }

    this.spawnTimer += dt;

    // Check spawn queue
    for (const spawn of this.spawnQueue) {
      if (!spawn.spawned && this.spawnTimer >= spawn.delay) {
        this.spawnEnemy(spawn, dispatch);
        spawn.spawned = true;
      }
    }

    // Check if all enemies spawned
    if (this.spawnQueue.every((spawn) => spawn.spawned)) {
      this.waveComplete = true;
      this.spawnTimer = 0;
    }
  }

  /**
   * Spawn an enemy
   */
  spawnEnemy(spawn, dispatch) {
    const enemyDef = ENEMIES[Object.keys(ENEMIES).find(
      (key) => ENEMIES[key].id === spawn.enemyId
    )];

    if (!enemyDef) return;

    const scaledStats = getEnemyStatsForWave(enemyDef, this.currentWave);

    dispatch({
      type: 'ADD_ENEMY',
      payload: {
        id: `enemy_${spawn.enemyId}_${Date.now()}_${Math.random()}`,
        enemyId: spawn.enemyId,
        x: spawn.x,
        y: spawn.y,
        hp: scaledStats.hp,
        maxHp: scaledStats.hp,
        speed: scaledStats.speed,
        damage: scaledStats.damage,
        size: enemyDef.size,
        color: enemyDef.color,
        xpValue: enemyDef.xpValue,
        behavior: enemyDef.behavior,
        tier: enemyDef.tier,
      },
    });
  }

  /**
   * Adjust difficulty based on player performance
   */
  adjustDifficulty(player) {
    // Track player HP
    const healthPercent = (player.health / player.maxHealth) * 100;
    this.playerHpHistory.push(healthPercent);

    // Keep last 5 waves
    if (this.playerHpHistory.length > 5) {
      this.playerHpHistory.shift();
    }

    // Calculate average HP
    const avgHp = this.playerHpHistory.reduce((a, b) => a + b, 0) / this.playerHpHistory.length;

    // Adjust difficulty multiplier
    if (avgHp > 75) {
      // Player doing well, increase difficulty
      this.difficultyMultiplier = Math.min(this.difficultyMultiplier + 0.05, 1.5);
    } else if (avgHp < 30) {
      // Player struggling, ease up
      this.difficultyMultiplier = Math.max(this.difficultyMultiplier - 0.05, 0.7);
    }

    // Pause spawning if player HP is very low
    if (hpPercent < 20 && !this.spawnPaused) {
      this.spawnPaused = true;
      this.pauseDuration = 2.0; // 2 second pause
    }
  }

  /**
   * Track kill for difficulty adjustment
   */
  trackKill() {
    this.totalKillsThisWave++;
  }

  /**
   * Track damage taken
   */
  trackDamageTaken(damage) {
    this.playerDamageTakenThisWave += damage;
  }

  /**
   * Show wave announcement
   */
  showWaveAnnouncement(dispatch) {
    let announcement = '';
    let color = '#FFD700';

    switch (this.waveType) {
      case WAVE_TYPES.BOSS:
        announcement = '🎩 LEGENDARY GUNSLINGER APPROACHES 🎩';
        color = '#FF0000';
        break;

      case WAVE_TYPES.SWARM:
        announcement = `🌪️ SWARM INCOMING - WAVE ${this.currentWave} 🌪️`;
        color = '#FFA500';
        break;

      case WAVE_TYPES.ELITE:
        announcement = `⚔️ ELITE FORCE - WAVE ${this.currentWave} ⚔️`;
        color = '#8B0000';
        break;

      case WAVE_TYPES.MINI_BOSS:
        announcement = `💀 DEADLY ENCOUNTER - WAVE ${this.currentWave} 💀`;
        color = '#9370DB';
        break;

      default:
        announcement = `WAVE ${this.currentWave}`;
        color = '#FFD700';
    }

    dispatch({
      type: 'SHOW_WAVE_ANNOUNCEMENT',
      payload: {
        text: announcement,
        color: color,
        duration: 3.0,
        waveNumber: this.currentWave,
        waveType: this.waveType,
      },
    });
  }

  /**
   * Get wave statistics
   */
  getWaveStats() {
    const duration = (Date.now() - this.waveStartTime) / 1000;

    return {
      waveNumber: this.currentWave,
      waveType: this.waveType,
      duration: duration,
      kills: this.totalKillsThisWave,
      damageTaken: this.playerDamageTakenThisWave,
      killRate: this.totalKillsThisWave / duration,
      difficultyMultiplier: this.difficultyMultiplier,
    };
  }

  /**
   * Reset for new wave
   */
  reset() {
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.waveActive = false;
    this.waveComplete = false;
    this.spawnPaused = false;
    this.pauseDuration = 0;
  }

  /**
   * Check if wave is complete (all enemies spawned and queue empty)
   */
  isWaveComplete() {
    return this.waveComplete && this.spawnQueue.every((spawn) => spawn.spawned);
  }

  /**
   * Get current spawn progress
   */
  getSpawnProgress() {
    if (this.spawnQueue.length === 0) {
      return { spawned: 0, total: 0, percent: 100 };
    }

    const spawned = this.spawnQueue.filter((s) => s.spawned).length;
    const total = this.spawnQueue.length;

    return {
      spawned,
      total,
      percent: (spawned / total) * 100,
    };
  }
}

/**
 * Helper: Create wave director
 */
export function createWaveDirector(difficulty, canvasWidth, canvasHeight) {
  return new WaveDirector(difficulty, canvasWidth, canvasHeight);
}
