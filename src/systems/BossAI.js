/**
 * Boss AI System - Sophisticated boss behavior and attack patterns
 *
 * Handles boss movement, attack execution, phase transitions, and telegraphing
 */

import { BOSS_ATTACK_PATTERNS } from '../data/bosses.js';
import { getCurrentPhase, checkPhaseTransition } from '../data/bosses.js';

// Attack telegraph types
export const TELEGRAPH_TYPES = {
  NONE: 'none',                    // Instant attack
  GROUND_MARKER: 'ground_marker',  // AOE indicator on ground
  WARNING_LINE: 'warning_line',    // Line attack indicator
  CHARGING: 'charging',            // Boss charging up
  SCREEN_FLASH: 'screen_flash',    // Screen-wide attack warning
};

// Boss movement states
export const BOSS_MOVEMENT_STATES = {
  IDLE: 'idle',
  APPROACH: 'approach',
  RETREAT: 'retreat',
  CIRCLE: 'circle',
  CHARGE: 'charge',
  STATIONARY: 'stationary',
};

/**
 * BossController - Manages individual boss behavior
 */
export class BossController {
  constructor(boss, bossEntity, player, gameDispatch) {
    this.boss = boss;                    // Boss definition from bosses.js
    this.entity = bossEntity;            // Boss entity (position, hp, etc.)
    this.player = player;                // Player reference
    this.dispatch = gameDispatch;        // Game state dispatcher

    // Attack management
    this.attackCooldowns = new Map();    // Track cooldowns per attack
    this.currentAttack = null;           // Currently executing attack
    this.attackTimer = 0;                // Timer for current attack

    // Phase management
    this.currentPhase = boss.phases[0];
    this.previousHp = bossEntity.hp;
    this.isTransitioning = false;
    this.transitionTimer = 0;
    this.transitionDuration = 1.5;       // 1.5s phase transition

    // Movement AI
    this.movementState = BOSS_MOVEMENT_STATES.APPROACH;
    this.movementTimer = 0;
    this.circleAngle = 0;
    this.circleRadius = 200;
    this.circleSpeed = Math.PI / 2;      // 90° per second

    // Minion spawning
    this.minionCooldown = 0;

    // Telegraphing
    this.telegraphs = [];                // Active telegraph indicators

    // Attack pattern rotation
    this.lastAttackIndex = -1;

    // Initialize cooldowns
    this.boss.attacks.forEach((attack, index) => {
      this.attackCooldowns.set(index, 0);
    });
  }

  /**
   * Main update loop
   */
  update(dt) {
    // Check for phase transitions
    this.checkPhaseTransition(dt);

    // Handle phase transition state
    if (this.isTransitioning) {
      this.updateTransition(dt);
      return;
    }

    // Update cooldowns
    this.updateCooldowns(dt);

    // Update movement AI
    this.updateMovement(dt);

    // Update current attack
    if (this.currentAttack) {
      this.updateCurrentAttack(dt);
    } else {
      // Select and start new attack
      this.selectAndStartAttack();
    }

    // Update minion spawning
    this.updateMinionSpawning(dt);

    // Update telegraphs
    this.updateTelegraphs(dt);
  }

  /**
   * Check if boss should transition to new phase
   */
  checkPhaseTransition(dt) {
    const newPhase = checkPhaseTransition(
      this.boss,
      this.previousHp,
      this.entity.hp,
      this.entity.maxHp
    );

    if (newPhase) {
      this.startPhaseTransition(newPhase);
    }

    this.previousHp = this.entity.hp;
  }

  /**
   * Start phase transition
   */
  startPhaseTransition(newPhase) {
    this.isTransitioning = true;
    this.transitionTimer = 0;
    this.currentPhase = newPhase;

    // Make boss invulnerable during transition
    this.entity.invulnerable = true;

    // Show phase transition dialogue
    this.showDialogue(this.getPhaseDialogue());

    // Visual effect
    this.createPhaseTransitionEffect();

    // Apply phase changes to boss stats
    this.applyPhaseChanges(newPhase);
  }

  /**
   * Update phase transition
   */
  updateTransition(dt) {
    this.transitionTimer += dt;

    if (this.transitionTimer >= this.transitionDuration) {
      this.isTransitioning = false;
      this.entity.invulnerable = false;
    }
  }

  /**
   * Apply phase changes to boss
   */
  applyPhaseChanges(phase) {
    const changes = phase.changes;

    // Speed multiplier
    if (changes.speedMultiplier) {
      this.entity.speed = this.boss.speed * changes.speedMultiplier;
    }

    // Store other changes for attack execution
    this.entity.phaseChanges = changes;
  }

  /**
   * Get dialogue for current phase
   */
  getPhaseDialogue() {
    const hpPercent = (this.entity.hp / this.entity.maxHp) * 100;

    if (hpPercent <= 25) {
      return this.boss.dialogue.phase3 || this.boss.dialogue.phase2;
    } else if (hpPercent <= 50) {
      return this.boss.dialogue.phase2;
    }

    return this.boss.dialogue.intro;
  }

  /**
   * Update attack cooldowns
   */
  updateCooldowns(dt) {
    this.attackCooldowns.forEach((cooldown, attackIndex) => {
      if (cooldown > 0) {
        this.attackCooldowns.set(attackIndex, Math.max(0, cooldown - dt));
      }
    });

    if (this.minionCooldown > 0) {
      this.minionCooldown -= dt;
    }
  }

  /**
   * Update movement AI
   */
  updateMovement(dt) {
    this.movementTimer += dt;

    const dx = this.player.x - this.entity.x;
    const dy = this.player.y - this.entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    switch (this.movementState) {
      case BOSS_MOVEMENT_STATES.APPROACH:
        if (distance > 150) {
          this.moveToward(this.player.x, this.player.y, dt);
        } else {
          // Close enough, switch to circling
          this.movementState = BOSS_MOVEMENT_STATES.CIRCLE;
          this.circleAngle = Math.atan2(dy, dx);
        }
        break;

      case BOSS_MOVEMENT_STATES.CIRCLE:
        this.moveCircle(dt);

        // Occasionally switch movement patterns
        if (this.movementTimer > 5) {
          this.movementTimer = 0;
          this.movementState = Math.random() > 0.5
            ? BOSS_MOVEMENT_STATES.APPROACH
            : BOSS_MOVEMENT_STATES.RETREAT;
        }
        break;

      case BOSS_MOVEMENT_STATES.RETREAT:
        if (distance < 300) {
          this.moveAwayFrom(this.player.x, this.player.y, dt);
        } else {
          this.movementState = BOSS_MOVEMENT_STATES.CIRCLE;
        }
        break;

      case BOSS_MOVEMENT_STATES.STATIONARY:
        // Don't move (used during certain attacks)
        break;

      case BOSS_MOVEMENT_STATES.CHARGE:
        // Handled by charge attack
        break;
    }
  }

  /**
   * Move toward target position
   */
  moveToward(targetX, targetY, dt) {
    const dx = targetX - this.entity.x;
    const dy = targetY - this.entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const speed = this.entity.speed || this.boss.speed;
      this.entity.x += (dx / distance) * speed * dt;
      this.entity.y += (dy / distance) * speed * dt;
    }
  }

  /**
   * Move away from target position
   */
  moveAwayFrom(targetX, targetY, dt) {
    const dx = targetX - this.entity.x;
    const dy = targetY - this.entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const speed = this.entity.speed || this.boss.speed;
      this.entity.x -= (dx / distance) * speed * dt;
      this.entity.y -= (dy / distance) * speed * dt;
    }
  }

  /**
   * Circle around player
   */
  moveCircle(dt) {
    this.circleAngle += this.circleSpeed * dt;

    const targetX = this.player.x + Math.cos(this.circleAngle) * this.circleRadius;
    const targetY = this.player.y + Math.sin(this.circleAngle) * this.circleRadius;

    this.moveToward(targetX, targetY, dt);
  }

  /**
   * Select and start next attack
   */
  selectAndStartAttack() {
    const availableAttacks = this.boss.attacks
      .map((attack, index) => ({ attack, index }))
      .filter(({ index }) => this.attackCooldowns.get(index) === 0)
      .filter(({ index }) => index !== this.lastAttackIndex); // Don't repeat

    if (availableAttacks.length === 0) {
      return; // All attacks on cooldown
    }

    // Randomly select from available attacks
    const selected = availableAttacks[Math.floor(Math.random() * availableAttacks.length)];

    this.startAttack(selected.index);
  }

  /**
   * Start executing an attack
   */
  startAttack(attackIndex) {
    const attack = this.boss.attacks[attackIndex];

    this.currentAttack = {
      ...attack,
      index: attackIndex,
      phase: 'telegraph', // telegraph -> execute -> cooldown
      timer: 0,
      telegraphDuration: this.getTelegraphDuration(attack.pattern),
    };

    this.lastAttackIndex = attackIndex;

    // Create telegraph if needed
    this.createTelegraph(attack);
  }

  /**
   * Update current attack execution
   */
  updateCurrentAttack(dt) {
    if (!this.currentAttack) return;

    this.currentAttack.timer += dt;

    switch (this.currentAttack.phase) {
      case 'telegraph':
        if (this.currentAttack.timer >= this.currentAttack.telegraphDuration) {
          this.currentAttack.phase = 'execute';
          this.currentAttack.timer = 0;
          this.executeAttack(this.currentAttack);
        }
        break;

      case 'execute':
        // Attack execution complete, start cooldown
        if (this.currentAttack.timer >= 0.1) {
          this.attackCooldowns.set(
            this.currentAttack.index,
            this.getAttackCooldown(this.currentAttack)
          );
          this.currentAttack = null;
        }
        break;
    }
  }

  /**
   * Execute attack pattern
   */
  executeAttack(attack) {
    const pattern = attack.pattern;
    const phaseChanges = this.entity.phaseChanges || {};

    switch (pattern) {
      case BOSS_ATTACK_PATTERNS.QUICK_DRAW:
        this.executeQuickDraw(attack, phaseChanges);
        break;

      case BOSS_ATTACK_PATTERNS.BULLET_SPRAY:
        this.executeBulletSpray(attack, phaseChanges);
        break;

      case BOSS_ATTACK_PATTERNS.DYNAMITE_SPLIT:
        this.executeDynamiteSplit(attack, phaseChanges);
        break;

      case BOSS_ATTACK_PATTERNS.FIRE_CHARGE:
        this.executeFireCharge(attack, phaseChanges);
        break;

      case BOSS_ATTACK_PATTERNS.TOMAHAWK_ORBIT:
        this.executeTomahawkOrbit(attack, phaseChanges);
        break;

      case BOSS_ATTACK_PATTERNS.POISON_CLOUD:
        this.executePoisonCloud(attack, phaseChanges);
        break;

      case BOSS_ATTACK_PATTERNS.TRACKING_SHOTS:
        this.executeTrackingShots(attack, phaseChanges);
        break;

      case BOSS_ATTACK_PATTERNS.ORBIT_STARS:
        this.executeOrbitStars(attack, phaseChanges);
        break;

      case BOSS_ATTACK_PATTERNS.STAMPEDE:
        this.executeStampede(attack, phaseChanges);
        break;

      case BOSS_ATTACK_PATTERNS.CIRCLE_SHOT:
        this.executeCircleShot(attack, phaseChanges);
        break;

      case BOSS_ATTACK_PATTERNS.SPIRAL_SHOT:
        this.executeSpiralShot(attack, phaseChanges);
        break;

      case BOSS_ATTACK_PATTERNS.SUMMON_MINIONS:
        this.executeSummonMinions(attack, phaseChanges);
        break;

      case BOSS_ATTACK_PATTERNS.TIME_SLOW:
        this.executeTimeSlow(attack, phaseChanges);
        break;

      case BOSS_ATTACK_PATTERNS.CLONE_ATTACK:
        this.executeCloneAttack(attack, phaseChanges);
        break;
    }
  }

  /**
   * QUICK_DRAW: Fast single shot at player
   */
  executeQuickDraw(attack, phaseChanges) {
    const angle = Math.atan2(
      this.player.y - this.entity.y,
      this.player.x - this.entity.x
    );

    const projectileCount = attack.projectileCount || 1;

    for (let i = 0; i < projectileCount; i++) {
      this.createProjectile({
        x: this.entity.x,
        y: this.entity.y,
        angle: angle,
        speed: attack.projectileSpeed,
        damage: attack.damage,
        color: this.boss.color,
        size: 8,
        type: 'bullet',
      });
    }
  }

  /**
   * BULLET_SPRAY: Spread of bullets
   */
  executeBulletSpray(attack, phaseChanges) {
    const baseAngle = Math.atan2(
      this.player.y - this.entity.y,
      this.player.x - this.entity.x
    );

    let projectileCount = attack.projectileCount;
    let spreadAngle = attack.spreadAngle;

    // Phase changes
    if (phaseChanges.bulletSpray360) {
      projectileCount = Math.floor(projectileCount * 1.5);
      spreadAngle = Math.PI * 2; // Full circle
    }

    if (phaseChanges.projectileCountMultiplier) {
      projectileCount = Math.floor(projectileCount * phaseChanges.projectileCountMultiplier);
    }

    const angleStep = spreadAngle / (projectileCount - 1);
    const startAngle = baseAngle - spreadAngle / 2;

    for (let i = 0; i < projectileCount; i++) {
      const angle = startAngle + angleStep * i;

      this.createProjectile({
        x: this.entity.x,
        y: this.entity.y,
        angle: angle,
        speed: 400,
        damage: attack.damage,
        color: this.boss.color,
        size: 6,
        type: 'bullet',
      });
    }
  }

  /**
   * DYNAMITE_SPLIT: Explosive that splits
   */
  executeDynamiteSplit(attack, phaseChanges) {
    const angle = Math.atan2(
      this.player.y - this.entity.y,
      this.player.x - this.entity.x
    );

    this.createProjectile({
      x: this.entity.x,
      y: this.entity.y,
      angle: angle,
      speed: 300,
      damage: attack.damage,
      color: '#FF4500',
      size: 12,
      type: 'explosive',
      explosionRadius: attack.explosionRadius,
      splits: true,
      splitCount: attack.splitCount || 4,
    });
  }

  /**
   * FIRE_CHARGE: Boss charges leaving fire trail
   */
  executeFireCharge(attack, phaseChanges) {
    const angle = Math.atan2(
      this.player.y - this.entity.y,
      this.player.x - this.entity.x
    );

    let trailRadius = attack.fireTrailRadius;
    if (phaseChanges.fireTrailRadiusMultiplier) {
      trailRadius *= phaseChanges.fireTrailRadiusMultiplier;
    }

    // Start charge
    this.entity.charging = true;
    this.entity.chargeAngle = angle;
    this.entity.chargeSpeed = 600;
    this.entity.chargeDuration = attack.chargeDuration;
    this.entity.chargeTimer = 0;
    this.entity.fireTrailRadius = trailRadius;
    this.entity.fireTrailDuration = attack.fireTrailDuration;

    this.movementState = BOSS_MOVEMENT_STATES.CHARGE;
  }

  /**
   * TOMAHAWK_ORBIT: Returning tomahawks
   */
  executeTomahawkOrbit(attack, phaseChanges) {
    let orbitCount = attack.orbitCount;

    if (phaseChanges.orbitCountMultiplier) {
      orbitCount = Math.floor(orbitCount * phaseChanges.orbitCountMultiplier);
    }

    const angleStep = (Math.PI * 2) / orbitCount;

    for (let i = 0; i < orbitCount; i++) {
      const angle = angleStep * i;

      this.createProjectile({
        x: this.entity.x,
        y: this.entity.y,
        angle: angle,
        speed: attack.returnSpeed,
        damage: attack.damage,
        color: '#8B4513',
        size: 10,
        type: 'tomahawk',
        orbitRadius: attack.orbitRadius,
        returns: true,
        splits: phaseChanges.tomahawkSplit,
        splitCount: phaseChanges.splitCount || 3,
      });
    }
  }

  /**
   * POISON_CLOUD: Lingering damage cloud
   */
  executePoisonCloud(attack, phaseChanges) {
    let cloudDuration = attack.cloudDuration;

    if (phaseChanges.cloudDurationMultiplier) {
      cloudDuration *= phaseChanges.cloudDurationMultiplier;
    }

    this.createGroundEffect({
      x: this.player.x,
      y: this.player.y,
      radius: attack.cloudRadius,
      duration: cloudDuration,
      damage: attack.dotDamage,
      damageInterval: attack.dotInterval,
      color: '#9370DB',
      type: 'poison',
      slow: phaseChanges.poisonSlow ? phaseChanges.slowMultiplier : null,
    });
  }

  /**
   * TRACKING_SHOTS: Homing bullets
   */
  executeTrackingShots(attack, phaseChanges) {
    let projectileCount = attack.projectileCount;
    let trackingStrength = attack.trackingStrength;

    if (phaseChanges.projectileCountMultiplier) {
      projectileCount = Math.floor(projectileCount * phaseChanges.projectileCountMultiplier);
    }

    if (phaseChanges.trackingStrengthMultiplier) {
      trackingStrength *= phaseChanges.trackingStrengthMultiplier;
    }

    for (let i = 0; i < projectileCount; i++) {
      const spread = (Math.random() - 0.5) * 0.5;
      const baseAngle = Math.atan2(
        this.player.y - this.entity.y,
        this.player.x - this.entity.x
      ) + spread;

      this.createProjectile({
        x: this.entity.x,
        y: this.entity.y,
        angle: baseAngle,
        speed: attack.projectileSpeed,
        damage: attack.damage,
        color: '#4169E1',
        size: 8,
        type: 'tracking',
        trackingStrength: trackingStrength,
        pierce: phaseChanges.trackingPierce || false,
      });
    }
  }

  /**
   * ORBIT_STARS: Stars that orbit then launch
   */
  executeOrbitStars(attack, phaseChanges) {
    let starCount = attack.starCount;

    if (phaseChanges.starCountMultiplier) {
      starCount = Math.floor(starCount * phaseChanges.starCountMultiplier);
    }

    const angleStep = (Math.PI * 2) / starCount;

    for (let i = 0; i < starCount; i++) {
      const angle = angleStep * i;

      this.createProjectile({
        x: this.entity.x,
        y: this.entity.y,
        angle: angle,
        speed: 0, // Starts stationary
        damage: attack.damage,
        color: '#FFD700',
        size: 12,
        type: 'orbit_star',
        orbitRadius: attack.orbitRadius,
        orbitSpeed: attack.orbitSpeed,
        launchSpeed: attack.launchSpeed,
        launchesAtPlayer: phaseChanges.starsLaunch,
        launchInterval: phaseChanges.launchInterval,
      });
    }
  }

  /**
   * STAMPEDE: Multi-directional charges
   */
  executeStampede(attack, phaseChanges) {
    const directions = phaseChanges.stampede4Way ? 4 : 1;
    const chargeCount = attack.chargeCount;

    if (directions === 1) {
      // Single direction toward player
      const angle = Math.atan2(
        this.player.y - this.entity.y,
        this.player.x - this.entity.x
      );

      for (let i = 0; i < chargeCount; i++) {
        setTimeout(() => {
          this.createStampedeWave(angle, attack);
        }, i * 500);
      }
    } else {
      // 4 cardinal directions
      const angles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];

      angles.forEach((angle, index) => {
        setTimeout(() => {
          this.createStampedeWave(angle, attack);
        }, index * 300);
      });
    }
  }

  /**
   * CIRCLE_SHOT: 360° burst
   */
  executeCircleShot(attack, phaseChanges) {
    const projectileCount = attack.projectileCount;
    const angleStep = (Math.PI * 2) / projectileCount;

    for (let i = 0; i < projectileCount; i++) {
      const angle = angleStep * i;

      this.createProjectile({
        x: this.entity.x,
        y: this.entity.y,
        angle: angle,
        speed: 400,
        damage: attack.damage,
        color: this.boss.color,
        size: 6,
        type: 'bullet',
      });
    }
  }

  /**
   * SPIRAL_SHOT: Rotating spiral pattern
   */
  executeSpiralShot(attack, phaseChanges) {
    const projectileCount = attack.projectileCount;
    const rotationSpeed = attack.rotationSpeed;
    const waves = 3;

    for (let wave = 0; wave < waves; wave++) {
      setTimeout(() => {
        const angleOffset = (rotationSpeed * wave) / waves;
        const angleStep = (Math.PI * 2) / projectileCount;

        for (let i = 0; i < projectileCount; i++) {
          const angle = angleStep * i + angleOffset;

          this.createProjectile({
            x: this.entity.x,
            y: this.entity.y,
            angle: angle,
            speed: 350,
            damage: attack.damage,
            color: this.boss.color,
            size: 6,
            type: 'bullet',
          });
        }
      }, wave * 200);
    }
  }

  /**
   * SUMMON_MINIONS: Spawn regular enemies
   */
  executeSummonMinions(attack, phaseChanges) {
    // Implemented via updateMinionSpawning
  }

  /**
   * TIME_SLOW: Slow player movement
   */
  executeTimeSlow(attack, phaseChanges) {
    this.dispatch({
      type: 'APPLY_STATUS_EFFECT',
      payload: {
        effect: 'time_slow',
        duration: attack.duration,
        slowMultiplier: attack.slowMultiplier,
      },
    });

    // Visual screen effect
    this.createScreenEffect('time_slow', attack.duration);
  }

  /**
   * CLONE_ATTACK: Spawn shadow clones
   */
  executeCloneAttack(attack, phaseChanges) {
    let cloneCount = attack.cloneCount;

    if (phaseChanges.cloneCountMultiplier) {
      cloneCount = Math.floor(cloneCount * phaseChanges.cloneCountMultiplier);
    }

    for (let i = 0; i < cloneCount; i++) {
      const angle = (Math.PI * 2 * i) / cloneCount;
      const distance = 200;

      this.createBossClone({
        x: this.entity.x + Math.cos(angle) * distance,
        y: this.entity.y + Math.sin(angle) * distance,
        duration: attack.cloneDuration,
      });
    }
  }

  /**
   * Update minion spawning
   */
  updateMinionSpawning(dt) {
    const phaseChanges = this.entity.phaseChanges || {};

    if (!phaseChanges.summonMinions) return;
    if (this.minionCooldown > 0) return;

    // Spawn minions
    const minionType = phaseChanges.minionType || 'bandit';
    const minionCount = phaseChanges.minionCount || 3;

    for (let i = 0; i < minionCount; i++) {
      const angle = (Math.PI * 2 * i) / minionCount;
      const distance = 150;

      this.spawnMinion({
        type: minionType,
        x: this.entity.x + Math.cos(angle) * distance,
        y: this.entity.y + Math.sin(angle) * distance,
      });
    }

    this.minionCooldown = phaseChanges.summonCooldown || 10;
  }

  /**
   * Update active telegraphs
   */
  updateTelegraphs(dt) {
    this.telegraphs = this.telegraphs.filter((telegraph) => {
      telegraph.timer += dt;
      return telegraph.timer < telegraph.duration;
    });
  }

  /**
   * Get telegraph duration for attack pattern
   */
  getTelegraphDuration(pattern) {
    switch (pattern) {
      case BOSS_ATTACK_PATTERNS.QUICK_DRAW:
        return 0.2; // Very short
      case BOSS_ATTACK_PATTERNS.FIRE_CHARGE:
      case BOSS_ATTACK_PATTERNS.STAMPEDE:
        return 1.0; // Long telegraph
      case BOSS_ATTACK_PATTERNS.POISON_CLOUD:
      case BOSS_ATTACK_PATTERNS.DYNAMITE_SPLIT:
        return 0.5; // Medium
      default:
        return 0.3; // Default
    }
  }

  /**
   * Get attack cooldown with phase modifiers
   */
  getAttackCooldown(attack) {
    let cooldown = attack.cooldown;
    const phaseChanges = this.entity.phaseChanges || {};

    if (phaseChanges.cooldownMultiplier) {
      cooldown *= phaseChanges.cooldownMultiplier;
    }

    return cooldown;
  }

  /**
   * Create telegraph indicator
   */
  createTelegraph(attack) {
    const pattern = attack.pattern;
    let telegraphType = TELEGRAPH_TYPES.NONE;

    switch (pattern) {
      case BOSS_ATTACK_PATTERNS.POISON_CLOUD:
        telegraphType = TELEGRAPH_TYPES.GROUND_MARKER;
        this.telegraphs.push({
          type: telegraphType,
          x: this.player.x,
          y: this.player.y,
          radius: attack.cloudRadius,
          color: '#9370DB',
          timer: 0,
          duration: this.getTelegraphDuration(pattern),
        });
        break;

      case BOSS_ATTACK_PATTERNS.FIRE_CHARGE:
      case BOSS_ATTACK_PATTERNS.STAMPEDE:
        telegraphType = TELEGRAPH_TYPES.WARNING_LINE;
        const angle = Math.atan2(
          this.player.y - this.entity.y,
          this.player.x - this.entity.x
        );
        this.telegraphs.push({
          type: telegraphType,
          x: this.entity.x,
          y: this.entity.y,
          angle: angle,
          length: 600,
          width: attack.chargeWidth || 100,
          color: '#FF0000',
          timer: 0,
          duration: this.getTelegraphDuration(pattern),
        });
        break;

      case BOSS_ATTACK_PATTERNS.TIME_SLOW:
        telegraphType = TELEGRAPH_TYPES.SCREEN_FLASH;
        this.telegraphs.push({
          type: telegraphType,
          color: '#9370DB',
          timer: 0,
          duration: this.getTelegraphDuration(pattern),
        });
        break;
    }
  }

  /**
   * Helper methods to create game entities (dispatch to game state)
   */

  createProjectile(data) {
    this.dispatch({
      type: 'ADD_PROJECTILE',
      payload: {
        ...data,
        owner: 'boss',
        bossId: this.boss.id,
      },
    });
  }

  createGroundEffect(data) {
    this.dispatch({
      type: 'ADD_GROUND_EFFECT',
      payload: data,
    });
  }

  createStampedeWave(angle, attack) {
    this.dispatch({
      type: 'ADD_STAMPEDE_WAVE',
      payload: {
        x: this.entity.x,
        y: this.entity.y,
        angle: angle,
        speed: attack.chargeSpeed,
        width: attack.chargeWidth,
        damage: attack.damage,
        color: this.boss.color,
      },
    });
  }

  createBossClone(data) {
    this.dispatch({
      type: 'ADD_BOSS_CLONE',
      payload: {
        bossId: this.boss.id,
        ...data,
      },
    });
  }

  spawnMinion(data) {
    this.dispatch({
      type: 'SPAWN_MINION',
      payload: data,
    });
  }

  showDialogue(text) {
    this.dispatch({
      type: 'SHOW_BOSS_DIALOGUE',
      payload: {
        bossId: this.boss.id,
        text: text,
      },
    });
  }

  createPhaseTransitionEffect() {
    this.dispatch({
      type: 'CREATE_BOSS_PHASE_EFFECT',
      payload: {
        bossId: this.boss.id,
        x: this.entity.x,
        y: this.entity.y,
      },
    });
  }

  createScreenEffect(type, duration) {
    this.dispatch({
      type: 'ADD_SCREEN_EFFECT',
      payload: {
        type: type,
        duration: duration,
      },
    });
  }

  /**
   * Get active telegraphs for rendering
   */
  getTelegraphs() {
    return this.telegraphs;
  }

  /**
   * Handle boss death
   */
  onDeath() {
    // Show death dialogue
    this.showDialogue(this.boss.dialogue.death);

    // Grant death rewards
    this.dispatch({
      type: 'ADD_XP',
      payload: this.boss.deathReward.xp,
    });

    if (this.boss.deathReward.specialDrop) {
      this.dispatch({
        type: 'DROP_SPECIAL_ITEM',
        payload: {
          type: this.boss.deathReward.specialDrop,
          x: this.entity.x,
          y: this.entity.y,
        },
      });
    }

    // Track boss defeat
    this.dispatch({
      type: 'BOSS_DEFEATED',
      payload: {
        bossId: this.boss.id,
        wave: this.boss.waveNumber,
      },
    });

    // Create death explosion effect
    this.dispatch({
      type: 'CREATE_BOSS_DEATH_EFFECT',
      payload: {
        x: this.entity.x,
        y: this.entity.y,
        color: this.boss.color,
      },
    });
  }
}

/**
 * Helper: Create boss controller for a wave
 */
export function createBossController(boss, player, gameDispatch) {
  const bossEntity = {
    id: `boss_${boss.id}_${Date.now()}`,
    bossId: boss.id,
    x: player.x + (Math.random() - 0.5) * 400,
    y: player.y - 300,
    hp: boss.baseHp,
    maxHp: boss.baseHp,
    speed: boss.speed,
    damage: boss.baseDamage,
    size: boss.size,
    color: boss.color,
    invulnerable: false,
    phaseChanges: {},
  };

  return {
    entity: bossEntity,
    controller: new BossController(boss, bossEntity, player, gameDispatch),
  };
}
