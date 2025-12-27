# Outlaw's Last Stand - Game Systems Documentation

Complete overview of all implemented game systems and features.

---

## 🎮 Core Game Systems

### 1. **Game State Management** (`src/context/GameContext.jsx`)

Comprehensive React Context-based state management:

```javascript
gameStatus: 'menu' | 'characterSelect' | 'playing' | 'paused' | 'levelUp' | 'gameOver' | 'victory'

player: {
  x, y, hp, maxHp, speed, xp, level,
  character, weapons[], activeWeaponIndex,
  stats: { damage, fireRate, moveSpeed, maxHp, projectileSpeed,
           projectileSize, critChance, critDamage, pickupRange,
           armor, regen },
  invulnerable, invulnerableTime,
  passiveManager  // Manages character passive abilities
}

enemies[], projectiles[], xpGems[], particles[]
wave, gameTime, kills
camera: { x, y }
settings: { soundEnabled, musicEnabled, difficulty }
```

**Actions (20+)**:
- Player: UPDATE_PLAYER, DAMAGE_PLAYER, HEAL_PLAYER, ADD_XP, LEVEL_UP
- Enemies: ADD/REMOVE/UPDATE_ENEMIES
- Projectiles: ADD/REMOVE/UPDATE_PROJECTILES
- XP Gems: ADD/REMOVE/UPDATE_XP_GEMS
- Particles: ADD/REMOVE/UPDATE_PARTICLES
- Game: SET_GAME_STATUS, RESET_GAME, INCREMENT_KILLS, NEXT_WAVE

---

### 2. **Game Loop System** (`src/hooks/useGameLoop.js`)

60 FPS requestAnimationFrame-based game loop:

- **Delta Time**: Capped at 100ms to prevent spiral of death
- **Ordered Updates**: 8 systems executed in sequence
- **Pausable**: Auto-pauses on LEVEL_UP and PAUSED states
- **FPS Tracking**: Real-time performance monitoring
- **Game Time**: Accurate elapsed time tracking

**Update Order**:
1. updatePlayer(dt)
2. updateWeapons(dt)
3. updateProjectiles(dt)
4. updateEnemies(dt)
5. updateXPGems(dt)
6. updateParticles(dt)
7. updateWaveSystem(dt)
8. checkCollisions()

---

### 3. **Character System** (`src/data/characters.js`)

**8 Unique Playable Characters**:

| Character | HP | Speed | Pickup | Passive | Unlock |
|-----------|-----|-------|--------|---------|--------|
| **Drifter** | 100 | 180 | 60 | +10% damage solo | Default |
| **Outlaw** | 80 | 200 | 50 | +20% XP, -10% HP | 500 kills |
| **Marshal** | 120 | 160 | 70 | 15% damage reduction | Wave 15 |
| **Prospector** | 90 | 170 | 100 | +50% pickup, gold drops | 1000 XP/run |
| **Shaman** | 70 | 190 | 55 | +30% poison, 5% lifesteal | 10k poison dmg |
| **Cavalry** | 110 | 220 | 45 | +20% speed, -30% cooldown | 50k distance |
| **Gunslinger** | 60 | 160 | 50 | +25% fire rate | 10k projectiles |
| **Hangman** | 100 | 175 | 65 | +25% dmg to slowed | 100 bosses |

**Features**:
- Base stats: hp, speed, pickup, damage, luck
- Unique passive abilities with typed effects
- Starting weapons per character
- Unlock conditions with 7 types
- Appearance data (4 color schemes)
- localStorage progress tracking
- Helper functions for unlock progress

---

### 4. **Weapon System** (`src/data/weapons.js`)

**15 Base Weapons + 7 Evolutions** across 4 categories:

**Character Starting Weapons**:
1. **Six-Shooter** (Drifter) - Balanced revolver
2. **Sawed-Off** (Outlaw) - Close-range shotgun
3. **Deputy Star** (Marshal) - Boomerang badge
4. **Dynamite** (Prospector) - Explosive AOE
5. **Snake Oil** (Shaman) - Poison vials
6. **Horse Charge** (Cavalry) - Melee charge
7. **Gatling Gun** (Gunslinger) - Rapid-fire
8. **Lasso** (Hangman) - Pull & slow

**Additional Weapons**:
- Revolver, Rifle, Dual Pistols, Winchester
- Tomahawk, Molotov, Crossbow, Peacemaker

**Weapon Properties**:
```javascript
damage, fireRate, projectileSpeed, projectileSize
piercing, spread, projectileCount, range, knockback
explosionRadius, poisonDamage, critChance, slowAmount
color, trailColor, rarity, level (1-8), maxLevel
```

**Features**:
- 5 weapon types: PROJECTILE, EXPLOSIVE, MELEE, SPECIAL, POISON
- Level scaling (+20% per level)
- DPS calculation
- Upgrade system with costs
- Display info for UI
- Special properties extraction

---

### 5. **Weapon Evolution System** (`src/systems/WeaponEvolution.js`)

**7 Legendary Evolutions** - Combine two max-level (8) weapons to create powerful evolved forms:

1. **Peacemaker** 🔫💥 (Six-Shooter + Rifle)
   - Rapid-fire explosive rounds
   - 60 radius explosions per shot
   - Combines speed with devastating power

2. **Hellfire** 🔥💀 (Dynamite + Molotov Whiskey)
   - Massive 200 radius explosion
   - Creates **permanent** burning ground
   - 15 damage per tick, burns forever

3. **Death Spin** 🪓🌀 (Lasso + Tomahawk)
   - 3 orbiting tomahawks
   - 100 radius orbit, 360°/sec rotation
   - 30% slow on hit

4. **Curse of the West** ☠️📜 (Snake Oil + Wanted Poster)
   - Poison spreads between marked enemies
   - Chains up to 5 enemies within 150 range
   - +40% damage bonus to marked targets

5. **Lead Storm** ⚙️⭐ (Gatling Gun + Deputy Star)
   - Rapid-fire bouncing projectiles
   - 4 bounces, only 15% damage reduction
   - 0.12s cooldown (8.3 shots/sec)

6. **Whirlwind** 🌪️🔪 (Bowie Knife + Pickaxe)
   - Constant 360° melee damage
   - 8 spinning blades, 80 radius
   - 30% bleed chance, 10 damage over 3s

7. **Boomstick** 💥💣 (Sawed-Off + Powder Keg)
   - Shotgun fires 4 mini-explosives
   - 80 radius explosions per pellet
   - Heavy knockback (25)

**System Features**:
- `checkEvolutionEligibility()` - Validates both weapons at max level
- `getAvailableEvolutions()` - Returns all currently available evolutions
- `evolveWeapons()` - Removes component weapons, adds evolved weapon
- `getEvolutionCardData()` - Formats data for "EVOLUTION AVAILABLE" upgrade cards
- `createEvolutionNotification()` - Creates evolution alert notifications
- `getEvolutionHint()` - Shows evolution paths in weapon tooltips
- `unlockEvolution()` - Tracks evolutions in localStorage
- `getEvolutionAchievementProgress()` - Progress toward "Master Gunsmith"

**Evolution Process**:
1. Player reaches level 8 with two compatible weapons
2. System detects evolution eligibility
3. Shows special "EVOLUTION AVAILABLE" card during level-up
4. Player chooses evolution
5. Both weapons removed, evolved weapon added at level 1
6. Evolution tracked for achievements
7. Can level evolved weapon 1-8 like regular weapons

**Achievement Milestones**:
- First Evolution: 1/7 unlocked
- Skilled Crafter: 3/7 unlocked
- Weapon Master: 5/7 unlocked
- Master Gunsmith: 7/7 unlocked (all evolutions)

---

### 6. **Weapon Renderer System** (`src/systems/WeaponRenderer.js`)

**Visual rendering system** for all weapon projectiles and effects:

**Projectile Rendering**:
- **Bullets**: Elongated with trails, gradient coloring, weapon-specific colors
- **Explosives**: Animated fuse, smoke trail, sparking tip
- **Orbit Weapons**: Rope/chain connection to player, rotating sprites
- **Ground Effects**: Animated fire pools (20 flames), poison clouds
- **Bouncing**: 5-pointed star with sparkle trail, bounce indicators
- **Clouds**: 12 animated particles, radial gradient, pulsing

**Visual Effects**:
- **Muzzle Flash**: 0.05s cone gradient, directional based on aim
- **Impact Particles**: 10-20 particles, velocity-based, color-coded
- **Explosion**: 30 particles, shockwave ring, screen effects
- **Fire Pools**: Gradient flames (red → orange → gold), radial glow
- **Horse Charge**: Dust particles, brown/tan color, trailing effect

**Screen Effects**:
- **Screen Shake**: Intensity-based (0-30px), duration fade (0.5s max)
- **Screen Flash**: Color overlay (max 30% opacity), 0.2s fade
- **Critical Hits**: Red particles, 15px shake, red flash

**Weapon-Specific Enhancements**:
- Legendary weapons: 60% glow intensity vs 30%
- Shotguns: Screen flash on fire
- Explosives: Shake intensity = radius / 5
- Evolution weapons: Enhanced particle counts

**Effect Management**:
- Time-based animation (sine waves, rotations)
- Auto-cleanup of expired effects
- Particle aging and alpha fade
- Effect stacking (highest priority wins)

**Integration**:
```javascript
renderer.update(dt);
renderer.applyScreenEffects();
// Render game objects
renderer.renderMuzzleFlashes();
renderer.renderImpactParticles();
renderer.renderGroundEffects();
renderer.removeScreenEffects();
```

---

### 7. **Boss System** (`src/data/bosses.js`)

**10 Legendary Gunslinger Bosses** - Epic encounters every 5 waves:

| Boss | Wave | HP | Title | Attacks |
|------|------|-----|-------|---------|
| **Billy the Kid** 🤠 | 5 | 500 | The Fastest Gun | Quick Draw |
| **Jesse James** 💣 | 10 | 1000 | The Notorious Outlaw | Dynamite Split, Circle Shot |
| **Butch Cassidy** 🐎 | 15 | 1800 | The Wild Bunch Leader | Horse Charge, Bullet Spray |
| **Sundance Kid** ☀️ | 20 | 2200 | Butch's Right Hand | Dual Wield, Spiral Shot |
| **Calamity Jane** 🪓 | 25 | 2800 | The Frontier's Fiercest | Tomahawk Orbit, Quick Draw |
| **Doc Holliday** ☠️ | 30 | 3500 | The Deadly Dentist | Poison Cloud, Circle Shot |
| **Wild Bill** 🎯 | 35 | 4500 | The Deadliest Marksman | Tracking Shots, Spiral Barrage |
| **Wyatt Earp** ⭐ | 40 | 6000 | The Lawman Legend | Deputy Stars, Law & Order |
| **Buffalo Bill** 🦬 | 45 | 8000 | The Wild West Showman | Stampede, Rifle Barrage |
| **The Man with No Name** 🎩 | 50 | 12000 | The Ultimate Gunslinger | ALL ATTACKS |

**Attack Patterns (14)**:
- **Quick Draw**: Fast single shots at player
- **Bullet Spray**: Wide spread of projectiles
- **Dynamite Split**: Explosives that split into 4 mini-bombs
- **Fire Charge**: Charges leaving burning ground trail
- **Tomahawk Orbit**: Returning tomahawks that orbit
- **Poison Cloud**: Lingering damage clouds
- **Tracking Shots**: Bullets that follow player
- **Orbit Stars**: Stars that orbit then launch
- **Stampede**: High-speed charges in multiple directions
- **Time Slow**: Slows player movement by 70%
- **Clone Attack**: Spawns shadow clones
- **Circle Shot**: 360° projectile burst
- **Spiral Shot**: Rotating spiral pattern
- **Summon Minions**: Spawns regular enemies

**Phase System**:
- **Phase 1** (100% HP): Normal attacks
- **Phase 2** (50% HP): Enhanced mechanics
  - Billy: +50% speed, -30% cooldowns
  - Jesse: Summons gang members (3 bandits every 10s)
  - Butch: +50% fire trail radius, -30% charge cooldown
  - Sundance: 360° bullet spray, +50% projectile count
  - Jane: Tomahawks split into 3 on return
  - Doc: Poison clouds slow by 50%, +50% duration
  - Bill: Tracking shots pierce walls, +30% tracking
  - Wyatt: Stars launch at player every 2s
  - Buffalo: Stampede charges in 4 directions
- **Phase 3** (25% HP - Final Boss Only):
  - Shadow clones spawn constantly
  - +50% damage, -60% clone cooldown

**Dialogue System**:
```javascript
dialogue: {
  intro: "Opening taunt",
  phase2: "Mid-fight quote",
  phase3: "Desperate final phase" (final boss only),
  death: "Final words"
}
```

**Death Rewards**:
- **XP**: 100 (Billy) → 5000 (Man with No Name)
- **Special Drops**:
  - health_restore, weapon_upgrade, damage_boost
  - crit_boost, health_max_up, pierce_boost
  - speed_boost, cooldown_reduction
  - legendary_weapon (final boss)

**Helper Functions**:
- `getBossForWave(waveNumber)` - Get boss for specific wave
- `isBossWave(waveNumber)` - Check if wave has a boss
- `getBossWaves()` - Get all boss wave numbers [5,10,15...50]
- `getScaledBossStats(boss, difficulty)` - Scale boss for difficulty
- `getCurrentPhase(boss, currentHp, maxHp)` - Get active phase
- `checkPhaseTransition(boss, previousHp, currentHp, maxHp)` - Detect phase change
- `getBossById(bossId)` - Lookup boss by ID
- `getNextBoss(currentWave)` - Get upcoming boss
- `getWavesUntilNextBoss(currentWave)` - Countdown to next boss
- `getBossProgress(defeatedBossIds)` - Track defeated bosses
- `getBossAchievements(defeatedBossIds)` - Achievement milestones

**Achievement Milestones**:
- **First Blood**: Defeat first boss (Billy the Kid)
- **Halfway There**: Defeat 5 bosses
- **Boss Hunter**: Defeat 8 bosses
- **Legend Slayer**: Defeat all 10 bosses
- **The New Legend**: Defeat The Man with No Name

**Final Boss Special Mechanics**:
The Man with No Name (Wave 50) has 3 unique abilities:
1. **Time Manipulation**: Slows player to 30% speed for 3s
2. **Shadow Clones**: Spawns 2 clones that copy attacks (10s duration)
3. **All Attack Patterns**: Uses every boss attack type
4. **3 Phases**: Only boss with third phase (25% HP threshold)

---

### 8. **Boss AI System** (`src/systems/BossAI.js`)

**Sophisticated boss behavior and attack execution system**:

**BossController Class**:
Core boss AI controller managing all boss behaviors:

```javascript
const controller = new BossController(boss, bossEntity, player, gameDispatch);
controller.update(dt);
```

**Movement States** (6 types):
- **IDLE**: No movement
- **APPROACH**: Move toward player (distance > 150px)
- **RETREAT**: Move away from player (distance < 300px)
- **CIRCLE**: Circle around player at 200px radius
- **CHARGE**: Linear charge attack movement
- **STATIONARY**: Fixed position (during certain attacks)

**Attack Execution System**:
3-phase attack cycle:
1. **Telegraph** (0.2s - 1.0s): Visual warning before attack
2. **Execute**: Fire projectiles/activate attack
3. **Cooldown**: Attack-specific cooldown period

**Attack Pattern Implementation** (14 patterns):
- **Quick Draw**: Instant shot at player (0.2s telegraph)
- **Bullet Spray**: Spread of bullets with configurable angle
- **Dynamite Split**: Explosive splits into 4 mini-bombs
- **Fire Charge**: Boss charges, leaving burning ground (1.0s telegraph)
- **Tomahawk Orbit**: Returning tomahawks that can split
- **Poison Cloud**: Ground AoE with DoT and optional slow (0.5s telegraph)
- **Tracking Shots**: Homing bullets that track player
- **Orbit Stars**: Stars orbit boss, then launch at player
- **Stampede**: Multi-directional charge waves (1.0s telegraph)
- **Circle Shot**: 360° burst of projectiles
- **Spiral Shot**: 3-wave rotating spiral pattern
- **Summon Minions**: Spawns regular enemies around boss
- **Time Slow**: Slows player to 30% speed (screen flash)
- **Clone Attack**: Spawns shadow clones that copy attacks

**Telegraph System** (4 types):
- **NONE**: No warning (instant attacks)
- **GROUND_MARKER**: Circular indicator on ground (poison cloud)
- **WARNING_LINE**: Line indicator (charges, stampede)
- **SCREEN_FLASH**: Screen border flash (time slow, screen-wide)

**Phase Transition System**:
Automatic phase detection and transition:
- Detects HP threshold crossing (100% → 50% → 25%)
- 1.5s transition animation with boss invulnerability
- Displays phase dialogue
- Applies stat multipliers (speed, cooldown, damage)
- Modifies attack behaviors (360°, splits, launches)

**Phase Modifiers Applied**:
```javascript
speedMultiplier: 1.5          // +50% movement speed
cooldownMultiplier: 0.7       // -30% attack cooldowns
projectileCountMultiplier: 1.5 // +50% projectile count
trackingStrengthMultiplier: 1.3 // +30% tracking
fireTrailRadiusMultiplier: 1.5 // +50% fire radius
// ... and more
```

**Movement AI**:
- **Smart positioning**: Maintains optimal distance from player
- **Pattern switching**: Changes movement every 5 seconds
- **Circle strafing**: Orbits player at 200px radius, π/2 rad/sec
- **Tactical retreat**: Backs away when too close (<300px)
- **Attack-specific movement**: Stationary during certain attacks

**Minion Spawning**:
Phase 2 mechanic for some bosses:
- Cooldown-based spawning (10s default)
- Spawns around boss in circular pattern
- Count and type configurable per boss
- Only active when phase enables it

**Helper Functions**:
- `createBossController(boss, player, dispatch)` - Initialize boss AI
- `getTelegraphs()` - Get active warning indicators for rendering
- `onDeath()` - Handle boss defeat (dialogue, rewards, tracking)

**Integration with Game State**:
Dispatches actions for:
- Projectile creation (`ADD_PROJECTILE`)
- Ground effects (`ADD_GROUND_EFFECT`)
- Boss clones (`ADD_BOSS_CLONE`)
- Dialogue display (`SHOW_BOSS_DIALOGUE`)
- Screen effects (`ADD_SCREEN_EFFECT`)
- Minion spawning (`SPAWN_MINION`)
- Death rewards (`ADD_XP`, `DROP_SPECIAL_ITEM`)
- Achievement tracking (`BOSS_DEFEATED`)

**Performance Features**:
- Cooldown tracking per attack
- Efficient movement calculations
- Attack pattern rotation (no repeats)
- Telegraph cleanup (expired warnings removed)
- Smart attack selection (only available attacks)

---

### 9. **Wave Director System** (`src/systems/WaveDirector.js`)

**Intelligent wave spawning and pacing system**:

**WaveDirector Class**:
Manages wave composition, enemy spawning, and dynamic difficulty:

```javascript
const director = new WaveDirector(difficulty, canvasWidth, canvasHeight);
director.startWave(waveNumber, player, dispatch);
director.updateSpawning(dt, player, dispatch);
```

**Wave Types** (5 types):
- **NORMAL**: Standard wave with balanced enemy mix
- **BOSS**: Every 5 waves - Boss + 40% normal enemy count
- **SWARM**: Waves 3, 8, 13, 18... - Double enemies, mostly weak
- **ELITE**: Waves 4, 9, 14, 19... - Half enemies, mostly strong
- **MINI_BOSS**: Waves 7, 14, 21... - 70% enemies, balanced tiers

**Spawn Patterns** (5 patterns):
- **EDGES**: Random spawns from screen edges (normal waves)
- **CLUSTER**: Groups of ~10 enemies (swarm waves)
- **CARDINAL**: North, East, South, West spawns (elite waves)
- **SURROUND**: Circle around player at 400px radius (mini-boss)
- **WAVE_FRONT**: Line formation from one edge

**Wave Composition**:
Base enemy count formula: `10 + waveNumber × 3`

Modifiers:
- **Swarm waves**: 2.0× enemies (70% common, 25% uncommon)
- **Elite waves**: 0.5× enemies (30% elite, 40% rare)
- **Boss waves**: 0.4× enemies (60% common, 30% uncommon)
- **Mini-boss**: 0.7× enemies (balanced distribution)

**Tier Distribution** (Normal waves):
- **Early game** (Wave 1-19): 40% common, 35% uncommon, 20% rare, 5% elite
- **Mid game** (Wave 20-34): 30% common, 35% uncommon, 25% rare, 10% elite
- **Late game** (Wave 35+): 20% common, 35% uncommon, 30% rare, 15% elite

**Spawning System**:
- Spawn queue with timing (not all at once)
- Base spawn interval: 0.5s between spawns
- Interval reduces by 1% per wave (max 30% faster)
- Swarm waves: 40% faster spawning
- Elite waves: 50% slower spawning
- Minimum interval: 0.1s

**Dynamic Difficulty Adjustment**:
Real-time difficulty scaling based on player performance:

**HP Tracking**:
- Records player HP% at end of each wave
- Maintains history of last 5 waves
- Calculates average HP%

**Difficulty Multiplier**:
- Average HP > 75%: Increase multiplier by 0.05 (max 1.5×)
- Average HP < 30%: Decrease multiplier by 0.05 (min 0.7×)
- Affects enemy count in wave composition

**Emergency Pause**:
- Player HP < 20%: Pause spawning for 2 seconds
- Gives player breathing room to recover
- Only triggers once per low-HP period

**Wave Announcements**:
Visual announcements with color coding:

- **Normal**: "WAVE X" (Gold #FFD700)
- **Swarm**: "🌪️ SWARM INCOMING - WAVE X 🌪️" (Orange #FFA500)
- **Elite**: "⚔️ ELITE FORCE - WAVE X ⚔️" (Dark Red #8B0000)
- **Mini-Boss**: "💀 DEADLY ENCOUNTER - WAVE X 💀" (Purple #9370DB)
- **Boss**: "🎩 LEGENDARY GUNSLINGER APPROACHES 🎩" (Red #FF0000)

Duration: 3 seconds

**Enemy Selection**:
- Weighted random selection based on `spawnWeight`
- Only spawns enemies with `waveRequirement ≤ currentWave`
- Respects tier distribution percentages
- Prevents impossible spawns (e.g., elite on wave 1)

**Spawn Positioning**:
Smart spawn position calculation:

**Edge Spawns**:
- Random edge (top, right, bottom, left)
- 50px off-screen to prevent pop-in
- Evenly distributed along edge

**Cluster Spawns**:
- Groups of ~10 enemies
- Each cluster from random edge
- 100px spread within cluster

**Cardinal Spawns**:
- 4 directions (N, E, S, W)
- Centered on screen midpoint
- 200px spread per direction

**Surround Spawns**:
- Circle around player
- 400px radius
- Evenly spaced by angle

**Performance Tracking**:
Wave statistics for balancing:

```javascript
{
  waveNumber: 15,
  waveType: 'ELITE',
  duration: 45.2,           // seconds
  kills: 23,
  damageTaken: 150,
  killRate: 0.51,           // kills per second
  difficultyMultiplier: 1.15
}
```

**Helper Functions**:
- `startWave(waveNumber, player, dispatch)` - Initialize new wave
- `updateSpawning(dt, player, dispatch)` - Spawn enemies over time
- `adjustDifficulty(player)` - Dynamic difficulty adjustment
- `trackKill()` - Record enemy kill
- `trackDamageTaken(damage)` - Record damage
- `isWaveComplete()` - Check if all enemies spawned
- `getSpawnProgress()` - Get spawn progress (spawned/total)
- `getWaveStats()` - Get wave performance statistics
- `reset()` - Clear wave state

**Integration with Game State**:
Dispatches actions for:
- Enemy spawning (`ADD_ENEMY`)
- Wave announcements (`SHOW_WAVE_ANNOUNCEMENT`)

**Balancing Features**:
- Progressive difficulty scaling (enemy count, spawn rate)
- Wave variety prevents monotony
- Boss waves focus on boss fight (fewer adds)
- Swarm waves test area damage
- Elite waves test single-target damage
- Emergency pause prevents unfair deaths
- Difficulty adjusts to player skill level

---

### 10. **Level Up System** (`src/systems/LevelUpSystem.js`)

**Intelligent upgrade generation when player levels up**:

**LevelUpSystem Class**:
Generates 4 upgrade options with smart prioritization:

```javascript
const levelUpSystem = new LevelUpSystem();
const options = levelUpSystem.generateUpgradeOptions(player, waveNumber);
levelUpSystem.applyUpgrade(player, selectedOption, dispatch);
```

**Upgrade Priority System**:
Upgrades are offered in order of priority:

1. **Weapon Evolutions** (Priority 1000) - Always offered if available
2. **Weapon Upgrades** (Priority 100) - 60% chance per weapon (level < 8)
3. **New Weapons** (Priority 50) - If player has < 6 weapons
4. **Stat Upgrades** (Priority 10) - Fill remaining slots to reach 4 options

**4 Upgrade Types**:

**1. Weapon Evolution** (Legendary):
- Combines two max-level weapons
- Always offered when available
- Takes priority over all other upgrades
- Example: Six-Shooter + Rifle → Peacemaker

**2. Weapon Upgrade**:
- Levels up existing weapon (1 → 8)
- 60% chance per eligible weapon
- Shows damage/cooldown/pierce/count increases
- Example: "Six-Shooter (Lv 3)" → "+20% damage, -8% cooldown"

**3. New Weapon**:
- Adds new weapon to loadout
- Only offered if < 6 weapons
- Maximum 2 new weapons per level-up
- Cannot offer evolved weapons (evolution-only)

**4. Stat Upgrade**:
- Permanent passive bonuses
- Stackable with limits
- Fills remaining slots (always 4 total options)

**12 Stat Upgrades Available**:

| Stat | Name | Icon | Effect | Max Stacks |
|------|------|------|--------|------------|
| **Max HP** | Iron Heart | ❤️ | +20 Max HP (heals immediately) | 10 |
| **Move Speed** | Quick Draw | ⚡ | +15% Move Speed | 5 |
| **Damage** | Sharpshooter | 💥 | +15% Damage | 8 |
| **Pickup Radius** | Magnetism | 🧲 | +30% Pickup Radius | 5 |
| **Luck** | Gambler's Fortune | 🍀 | +20% Luck (drops & crits) | 5 |
| **Regen** | Healing Factor | 💚 | +1 HP/sec Regeneration | 10 |
| **Armor** | Thick Hide | 🛡️ | +5% Damage Reduction | 6 |
| **Critical** | Deadeye | 🎯 | +10% Critical Chance | 5 |
| **Cooldown** | Rapid Fire | ⏱️ | -10% Weapon Cooldowns | 5 |
| **Pierce** | Penetrating Rounds | 🔫 | +1 Pierce (all weapons) | 5 |
| **Projectile Speed** | High Velocity | 💨 | +20% Projectile Speed | 4 |
| **Crit Damage** | Executioner | 💀 | +50% Critical Damage | 4 |

**Maximum Stat Values**:
- Max HP: +200 HP total (10 stacks)
- Move Speed: +75% (5 stacks)
- Damage: +120% (8 stacks)
- Pickup Radius: +150% (5 stacks)
- Armor: 30% damage reduction (6 stacks)
- Critical Chance: 50% (5 stacks)
- Cooldown Reduction: 50% (5 stacks)
- Pierce: +5 (5 stacks)
- Critical Damage: +200% (4 stacks, base 150%)

**Rarity System**:
Upgrades are color-coded by rarity:

- **Legendary** (Gold #FFD700): Weapon evolutions
  - 3px border, glowing shadow, pulsing animation
- **Rare** (Purple #9370DB): Special weapons
  - 2px border, glowing shadow
- **Uncommon** (Blue #4169E1): Advanced weapons
  - 2px border
- **Common** (Silver #C0C0C0): Standard weapons, stat upgrades
  - 2px border

**Weapon Upgrade Descriptions**:
Automatically calculated from weapon scaling:
- Damage scaling: "+20% damage" (if scaling.damage = 1.2)
- Cooldown scaling: "-8% cooldown" (if scaling.cooldown = 0.92)
- Count scaling: "+1 projectile" (every 2 levels if scaling.count = 0.5)
- Pierce scaling: "+1 pierce" (every 3 levels if scaling.pierce = 0.33)

**Smart Selection**:
- Avoids offering maxed stat upgrades
- Only offers weapons player doesn't have
- Shuffles options for variety
- Tracks last offered upgrades

**State Tracking**:
```javascript
statUpgradeCounts: Map {
  'max_hp' => 3,
  'damage' => 5,
  'critical' => 2
}
```

**Helper Functions**:
- `generateUpgradeOptions(player, waveNumber)` - Generate 4 options
- `applyUpgrade(player, upgrade, dispatch)` - Apply selected upgrade
- `getStatUpgradeCount(statId)` - Get times stat was upgraded
- `reset()` - Clear counts for new game
- `formatUpgradeCard(upgrade)` - Format for UI display
- `getRarityColor(rarity)` - Get color by rarity
- `getRarityBorderStyle(rarity)` - Get border style by rarity

**Integration with Game State**:
Dispatches actions for:
- Weapon evolution (`EVOLVE_WEAPON`)
- Weapon upgrade (`UPGRADE_WEAPON`)
- New weapon (`ADD_WEAPON`)
- Stat upgrade (`APPLY_STAT_UPGRADE`)

**Upgrade Application**:
Each upgrade type applies differently:
- **Evolution**: Removes component weapons, adds evolved weapon
- **Weapon Upgrade**: Increments weapon level, recalculates stats
- **New Weapon**: Adds to weapons array (if < 6)
- **Stat Upgrade**: Modifies player.stats, tracks count

**UI Display Format**:
```javascript
{
  id: 'stat_damage',
  type: 'statUpgrade',
  name: 'Sharpshooter',
  icon: '💥',
  description: '+15% Damage',
  rarity: 'common',
  stackInfo: '3/8'  // Current/Max stacks
}
```

**Balancing Features**:
- Evolution priority ensures exciting moments
- 60% weapon upgrade chance creates variety
- Stat cap prevents infinite scaling
- New weapons only if slots available
- Always 4 options for meaningful choice

---

### 11. **Meta Progression System** (`src/systems/MetaProgression.js`)

**Persistent upgrades and achievements between runs**:

**MetaProgression Class**:
Manages currencies, permanent upgrades, and achievement tracking:

```javascript
const metaProgression = new MetaProgression();
metaProgression.addCurrency(CURRENCIES.GOLD_NUGGETS, 50);
metaProgression.purchaseUpgrade('max_hp');
metaProgression.updateRunStats(runStats);
```

**2 Currencies**:

**Gold Nuggets** 💰:
- Dropped by enemies (common)
- More from elite enemies and bosses
- Used for permanent stat upgrades
- Persistent across runs

**Bounty Stars** ⭐:
- Earned from achievements/milestones
- Used for character unlocks
- Rare and valuable

**8 Permanent Stat Upgrades** (Gold Nuggets):

| Upgrade | Name | Effect | Max Level | Base Cost | Scaling |
|---------|------|--------|-----------|-----------|---------|
| **Max HP** | Fortitude ❤️ | +10 Starting HP | 10 | 100g | 1.5× |
| **Damage** | Gunpowder Mastery 💥 | +5% Starting DMG | 10 | 150g | 1.5× |
| **Speed** | Swift Boots 👢 | +5% Starting Speed | 10 | 120g | 1.5× |
| **Pickup** | Gold Magnet 🧲 | +10% Pickup Radius | 10 | 100g | 1.5× |
| **Luck** | Lucky Horseshoe 🍀 | +10% Starting Luck | 10 | 200g | 1.5× |
| **Starting Level** | Head Start ⭐ | Start at Lv 2/3/4 | 3 | 500g | 2.0× |
| **Reroll** | Second Chance 🔄 | +1 Upgrade Reroll | 3 | 300g | 1.8× |
| **Revival** | Phoenix Feather 🪶 | +1 Revive (50% HP) | 2 | 1000g | 2.0× |

**Cost Scaling Formula**:
```javascript
cost = baseCost × (costScaling ^ currentLevel)
// Example: Max HP Level 3 = 100 × (1.5 ^ 2) = 225g
```

**Maximum Stat Bonuses**:
- Max HP: +100 HP (10 × 10)
- Damage: +50% (10 × 5%)
- Speed: +50% (10 × 5%)
- Pickup Radius: +100% (10 × 10%)
- Luck: +100% (10 × 10%)
- Starting Level: Level 4 (3 upgrades)
- Rerolls: 3 rerolls per level-up
- Revives: 2 revives per run

**Weapon Unlocks**:
- Unlock any weapon to start with it
- First find weapon in a run
- Permanently unlocked for all future runs
- Start with any unlocked weapon

**Character Unlocks** (Bounty Stars):
- Characters cost stars to unlock
- Displayed in character select
- Star cost varies by character
- Permanent unlock

**Achievement System** (50+ Achievements):

**Kill Milestones** (5 achievements):
- 100 kills: Deputy ⭐ (+1 star)
- 500 kills: Marshal ⭐⭐ (+2 stars)
- 1,000 kills: Sheriff ⭐⭐⭐ (+3 stars)
- 5,000 kills: Legend ⭐⭐⭐⭐ (+5 stars)
- 10,000 kills: Immortal ⭐⭐⭐⭐⭐ (+10 stars)

**Wave Milestones** (5 achievements):
- Wave 10: Survivor 🌊 (+1 star)
- Wave 20: Veteran 🌊🌊 (+2 stars)
- Wave 30: Elite Survivor 🌊🌊🌊 (+3 stars)
- Wave 40: Unstoppable 🌊🌊🌊🌊 (+5 stars)
- Wave 50: Frontier Legend 🌊🌊🌊🌊🌊 (+10 stars)

**Time Milestones** (5 achievements):
- 5 minutes: Quick Shooter ⏱️ (+1 star)
- 10 minutes: Endurance ⏱️⏱️ (+2 stars)
- 15 minutes: Iron Will ⏱️⏱️⏱️ (+3 stars)
- 20 minutes: Marathon Runner ⏱️⏱️⏱️⏱️ (+5 stars)
- 30 minutes: Untouchable ⏱️⏱️⏱️⏱️⏱️ (+10 stars)

**Boss Achievements** (10 achievements, 1-10 stars each):
- Billy the Kid: Fast Draw 🤠 (+1 star)
- Jesse James: Outlaw Hunter 💣 (+1 star)
- Butch Cassidy: Wild Bunch 🐎 (+2 stars)
- Sundance Kid: Dual Wield Master ☀️ (+2 stars)
- Calamity Jane: Calamity's End 🪓 (+3 stars)
- Doc Holliday: Deadly Dentist ☠️ (+3 stars)
- Wild Bill Hickok: Pistoleer Prince 🎯 (+4 stars)
- Wyatt Earp: Lawman Legend ⭐ (+4 stars)
- Buffalo Bill: Wild West Showdown 🦬 (+5 stars)
- The Man with No Name: The New Legend 🎩 (+10 stars)

**Evolution Achievements** (7 achievements, 2 stars each):
- Peacemaker, Hellfire, Death Spin, Curse of the West
- Lead Storm, Whirlwind, Boomstick

**Perfect Wave Achievements** (3 achievements):
- 1 perfect wave: Untouched 💚 (+1 star)
- 5 perfect waves: Dodge Master 💚💚 (+3 stars)
- 10 perfect waves: Ghost 💚💚💚 (+5 stars)

**Stat Tracking**:
```javascript
{
  totalKills: 0,
  totalGold: 0,
  totalStars: 0,
  maxWave: 0,
  maxTime: 0,
  totalRuns: 0,
  bossesDefeated: [],
  evolutionsDiscovered: [],
  perfectWaves: 0
}
```

**Run Stats Update**:
After each run ends:
```javascript
metaProgression.updateRunStats({
  kills: 234,
  wave: 15,
  time: 720,           // 12 minutes
  bossesDefeated: ['billy_the_kid', 'jesse_james'],
  evolutionsDiscovered: ['peacemaker'],
  perfectWaves: 2,
  goldEarned: 150
});
```

**Achievement Checking**:
Automatic after run stats update:
- Checks all achievements for unlocks
- Grants Bounty Stars rewards
- Tracks unlock timestamp

**Helper Functions**:
- `addCurrency(type, amount)` - Add gold/stars
- `getCurrency(type)` - Get current amount
- `spendCurrency(type, amount)` - Spend if available
- `getUpgradeLevel(statId)` - Get current upgrade level
- `getUpgradeCost(statId)` - Calculate next upgrade cost
- `purchaseUpgrade(statId)` - Buy permanent upgrade
- `getPermanentStatBonuses()` - Get all bonuses for new run
- `unlockWeapon(weaponId)` - Unlock weapon for start
- `isWeaponUnlocked(weaponId)` - Check unlock status
- `unlockCharacter(characterId, cost)` - Unlock character
- `isCharacterUnlocked(characterId)` - Check unlock
- `checkAchievement(id, value)` - Check single achievement
- `checkAllAchievements()` - Check all achievements
- `getAchievementProgress(id)` - Get progress (current/required)
- `getAllAchievements()` - Get all with progress
- `getAchievementsByCategory(category)` - Filter by category
- `getAchievementCompletion()` - Total completion %

**Data Persistence**:
All data stored in localStorage:
- Key: `outlaws_meta_progression`
- Auto-saves on any change
- Loads on game start
- Export/import support

**Export/Import**:
```javascript
const data = metaProgression.exportData();  // JSON string
metaProgression.importData(data);           // Restore from JSON
```

**Balancing Features**:
- Exponential cost scaling prevents easy maxing
- Achievement rewards encourage varied playstyles
- Perfect wave achievements reward skill
- Boss achievements encourage progression
- Evolution discoveries reward experimentation
- Multiple currencies create different progression paths

---

### 12. **Particle System** (`src/systems/ParticleSystem.js`)

Robust particle effects for all game visuals with performance optimizations.

**Particle Class**:
```javascript
class Particle {
  x, y          // Position
  vx, vy        // Velocity
  life, maxLife // Lifetime in seconds
  size, sizeDecay
  color, alpha
  gravity       // Gravity force
  friction      // Velocity dampening (0-1)
  shape         // 'circle', 'square', 'star', 'line'
  rotation, rotationSpeed
}
```

**ParticleEmitter Class**:
```javascript
const emitter = particleSystem.createEmitter(x, y);

// Single burst
emitter.emit({
  count: 20,
  spread: 30,
  velocitySpread: 100,
  life: 1.0,
  color: '#FFD700',
  shape: 'star'
});

// Continuous stream
emitter.stream({
  rate: 10,      // Particles per second
  color: '#FF0000',
  shape: 'circle'
}, 2.0);         // Duration in seconds
```

**ParticleSystem Class**:
- Object pooling for particle reuse
- Max particle limit: 1000
- LOD (Level of Detail): Reduces particles when > 500 active
- Automatic particle lifecycle management

**Preset Effects** (14 presets):

1. **DUST_CLOUD** - Brown/tan particles, slow fall
   - Count: 15, spread: 20, gravity: 30
   - Colors: Brown, tan, beige
   - Use: Environmental effects, landing

2. **MUZZLE_FLASH** - Yellow/orange, fast fade
   - Count: 8, life: 0.2s, shape: star
   - Colors: Orange, gold, yellow
   - Use: Gun firing effects

3. **BLOOD_SPLATTER** - Red particles, gravity affected
   - Count: 20, gravity: 300
   - Colors: Dark red, crimson, maroon
   - Use: Enemy damage

4. **EXPLOSION** - Orange/yellow expanding ring
   - Count: 40, velocitySpread: 300
   - Colors: Red-orange to yellow gradient
   - Use: Large explosions, boss attacks

5. **FIRE** - Orange/red rising particles
   - Count: 12, gravity: -50 (rises)
   - Colors: Red, orange, gold
   - Use: Fire effects, burning

6. **POISON** - Green bubbling particles
   - Count: 10, gravity: -20 (rises slowly)
   - Colors: Lime, green, yellow-green
   - Use: Poison DOT effects

7. **XP_COLLECT** - Golden sparkles
   - Count: 8, shape: star, life: 0.4s
   - Colors: Gold, orange, yellow
   - Use: XP gem pickup

8. **LEVEL_UP** - Golden shower from top
   - Count: 50, spread: 100, life: 1.5s
   - Colors: Gold, yellow, beige
   - Use: Player level up celebration

9. **BOSS_DEATH** - Massive explosion
   - Count: 100, velocitySpread: 400
   - Colors: Red to yellow gradient
   - Use: Boss defeated

10. **FOOTSTEP_DUST** - Small puff
    - Count: 5, size: 2, life: 0.4s
    - Colors: Brown, tan
    - Use: Player movement

11. **SMOKE_TRAIL** - Rising gray smoke
    - Count: 5, gravity: -30
    - Colors: Gray shades
    - Use: Projectile trails

12. **HEALING** - Green sparkles rising
    - Count: 15, gravity: -40, shape: star
    - Colors: Green, lime, light green
    - Use: Health pickup, regen

13. **COIN_PICKUP** - Golden squares
    - Count: 10, shape: square
    - Colors: Gold, orange, dark gold
    - Use: Gold nugget pickup

14. **IMPACT** - White lines radiating
    - Count: 20, shape: line
    - Colors: White, light gray
    - Use: Bullet impacts

15. **CRITICAL_HIT** - Red/gold stars
    - Count: 25, shape: star
    - Colors: Red, orange, gold
    - Use: Critical damage

**Helper Functions**:
```javascript
// Directional burst (e.g., from weapon)
emitDirectionalBurst(particleSystem, x, y, angle, {
  count: 10,
  speed: 100,
  angleSpread: 0.5,
  color: '#FFD700'
});

// Ring pattern
emitRing(particleSystem, x, y, radius, {
  count: 20,
  speed: 100,
  color: '#FF0000'
});

// Line of particles
emitLine(particleSystem, x1, y1, x2, y2, {
  count: 10,
  color: '#0000FF'
});
```

**Usage Example**:
```javascript
// Create system
const particleSystem = createParticleSystem(1000);

// Update in game loop
particleSystem.update(dt);

// Render
particleSystem.render(ctx);

// Emit preset effect
particleSystem.emitPreset('EXPLOSION', enemyX, enemyY);

// Custom burst
const emitter = particleSystem.createEmitter(playerX, playerY);
emitter.emit({
  count: 20,
  spread: 30,
  velocitySpread: 100,
  life: 1.0,
  size: 5,
  color: ['#FFD700', '#FFA500'],
  shape: 'star',
  gravity: 200
});
```

**Performance Optimizations**:
- **Object Pooling**: Reuses particle objects instead of creating new ones
- **Max Limit**: Hard cap at 1000 particles
- **LOD**: When > 500 particles, starts randomly skipping new particles
  - At 750 particles: ~25% skip rate
  - At 1000 particles: ~50% skip rate
- **Efficient Update**: Single loop for all particles
- **Early Exit**: Dead particles immediately returned to pool

**Integration Points**:
- Weapon firing: MUZZLE_FLASH, directional burst
- Enemy damage: BLOOD_SPLATTER, IMPACT
- Enemy death: EXPLOSION (normal), BOSS_DEATH (bosses)
- Player movement: FOOTSTEP_DUST (when moving)
- XP pickup: XP_COLLECT toward player
- Level up: LEVEL_UP shower
- Gold pickup: COIN_PICKUP
- Healing: HEALING rising particles
- Critical hits: CRITICAL_HIT
- Poison effects: POISON bubbling
- Fire effects: FIRE rising
- Explosions: EXPLOSION, ring patterns

---

### 13. **Screen Effects System** (`src/systems/ScreenEffects.js`)

Full-screen visual effects for dramatic game moments and feedback.

**ScreenShake Class**:
```javascript
shake.shake(intensity, duration);
// intensity: pixels to shake (1-20)
// duration: seconds
// Automatically decays over time
```

**FlashOverlay Class**:
```javascript
flash.flash(color, duration, intensity);
// Quick fade in (20%), long fade out (80%)
// color: hex or rgba
// intensity: alpha (0-1)
```

**VignetteEffect Class**:
```javascript
vignette.vignette(intensity, duration, color, persistent);
// intensity: 0-1
// persistent: true for pulsing effect (low HP)
// Radial gradient from center
```

**SlowMotion Class**:
```javascript
slowMo.slowMotion(factor, duration);
// factor: 0.1 (very slow) to 1.0 (normal)
// Smooth transition in/out
// Returns modified time scale
```

**ColorGrading Class**:
```javascript
colorGrade.setColorGrade(preset);
// Presets: 'normal', 'sepia', 'blood', 'poison', 'noir', 'highNoon'
// Smooth 0.5s transition between presets
// Applies filters: brightness, contrast, saturation, hue, sepia
```

**Color Grade Presets**:
1. **normal** - Default appearance
2. **sepia** - Western film look (brightness 1.1, contrast 1.2, sepia 0.4)
3. **blood** - Red tint for danger (contrast 1.3, red tint)
4. **poison** - Green hue for poison (saturation 1.4, hue +100)
5. **noir** - Black & white (saturation 0, contrast 1.5)
6. **highNoon** - Bright golden (brightness 1.2, warm tint)

**Main ScreenEffects Class**:
```javascript
const effects = createScreenEffects();

// Update in game loop
effects.update(dt);

// Render color grading (before game objects)
effects.render(ctx, width, height);

// Render overlays (after game objects)
effects.renderOverlays(ctx, width, height);

// Trigger effects
effects.triggerShake(10, 0.5);
effects.triggerFlash('#FF0000', 0.3, 0.5);
effects.triggerVignette(0.7, 0.5, '#8B0000');
effects.triggerSlowMotion(0.3, 2.0);
effects.setColorGrade('blood');

// Get time scale for game logic
const timeScale = effects.getTimeScale();
```

**Preset Effect Combinations** (12 presets):

1. **PLAYER_HIT**
   - Red vignette (0.6 intensity, 0.3s)
   - Red flash (0.3 alpha, 0.15s)
   - Small shake (3px, 0.1s)

2. **EXPLOSION** (distance-based)
   - Shake (0-15px based on distance)
   - Orange flash (intensity by distance)
   - Max distance: 300px

3. **BOSS_SPAWN**
   - Slow motion (0.3× speed, 1.5s)
   - Dark red flash (0.5 alpha, 1.0s)
   - Shake (8px, 0.6s)
   - Color grade: 'blood'

4. **BOSS_DEATH**
   - Slow motion (0.2× speed, 2.0s)
   - White flash (0.8 alpha, 1.5s)
   - Heavy shake (20px, 1.0s)
   - Return to 'normal' after 2s

5. **LEVEL_UP**
   - Golden flash (0.5 alpha, 0.5s)
   - Medium shake (5px, 0.3s)

6. **CRITICAL_HIT**
   - Small shake (4px, 0.15s)
   - Yellow flash (0.3 alpha, 0.1s)

7. **LOW_HP_START**
   - Persistent red vignette (pulses)
   - Intensity: 0.5, pulsing at 2 Hz

8. **LOW_HP_END**
   - Stop vignette pulse

9. **DEATH**
   - Black flash (0.9 alpha, 2.0s)
   - Color grade: 'noir'
   - Slow motion (0.1× speed, 1.0s)

10. **VICTORY**
    - Slow motion (0.4× speed, 3.0s)
    - Golden flash (0.4 alpha, 2.0s)
    - Color grade: 'highNoon'

11. **POISONED**
    - Color grade: 'poison'
    - Green vignette pulse (persistent)

12. **POISON_END**
    - Color grade: 'normal'
    - Stop vignette

**Usage Example**:
```javascript
import { createScreenEffects, SCREEN_EFFECT_PRESETS } from './ScreenEffects';

const effects = createScreenEffects();

// Trigger preset
SCREEN_EFFECT_PRESETS.PLAYER_HIT(effects);

// Custom explosion with distance
const intensity = calculateExplosionIntensity(
  playerX, playerY,
  explosionX, explosionY
);
effects.triggerShake(15 * intensity, 0.4);

// Check active effects
const active = effects.getActiveEffects();
// { shake: true, flash: false, vignette: true, ... }
```

**Integration Triggers**:
- **Player damaged**: PLAYER_HIT preset
- **Explosion nearby**: EXPLOSION with distance calculation
- **Boss spawned**: BOSS_SPAWN (dramatic entrance)
- **Boss defeated**: BOSS_DEATH (epic conclusion)
- **Player level up**: LEVEL_UP (celebration)
- **Critical hit**: CRITICAL_HIT (impact feedback)
- **HP < 30%**: LOW_HP_START (danger warning)
- **HP recovered**: LOW_HP_END (safety)
- **Player death**: DEATH (game over)
- **Victory**: VICTORY (win celebration)
- **Poison DOT**: POISONED (status effect)
- **Poison cleared**: POISON_END

**Performance Notes**:
- Time scale affects game logic (multiply dt by timeScale)
- Effects stack (shake intensity adds, vignette takes max)
- Color grading uses CSS filters (GPU accelerated)
- Smooth transitions prevent jarring changes
- All effects auto-cleanup when duration expires

**Rendering Pipeline**:
```javascript
// 1. Apply color grading
effects.render(ctx, width, height);

// 2. Apply shake offset to camera
const shake = effects.getShakeOffset();
ctx.translate(shake.x, shake.y);

// 3. Render game objects with time scale
const dt = baseDt * effects.getTimeScale();

// 4. Reset shake
ctx.setTransform(1, 0, 0, 1, 0, 0);

// 5. Render overlays
effects.renderOverlays(ctx, width, height);
```

---

### 14. **Game Loop Orchestration** (`src/components/game/GameLoop.jsx`)

Ties all systems together:

**Player System**:
- WASD movement with boundary checking
- Invulnerability frames (0.5s after hit)
- Health regeneration
- Aim angle tracking
- Distance tracking for unlocks

**Weapon System**:
- Cooldown management
- Firing on mouse click
- Projectile spawning
- Fire rate tracking for unlocks

**Projectile System**:
- Movement and lifetime
- Range expiration
- Out-of-bounds removal

**Enemy System**:
- AI pathfinding toward player
- Position updates

**XP Gem System**:
- Pickup detection (50px * pickupRange)
- Magnetism (150px * pickupRange)
- Auto-collection
- XP distribution

**Particle System**:
- Hit effects (gold)
- Death explosions (8 particles)
- Velocity-based movement
- Fade-out over time

**Wave System**:
- Auto-spawn next wave
- Enemy count scaling
- 1 second delay between waves

**Collision System**:
- Projectile vs Enemy with damage
- Player vs Enemy with i-frames
- Piercing projectile support
- Hit/death particles
- Kill tracking
- Progress tracking

---

### 15. **Passive Ability System** (`src/systems/PassiveSystem.js`)

Manages character passive abilities and their effects on gameplay:

**PassiveManager Class**:
- **Damage Modifiers**: getDamageModifier(), getDamageReductionModifier(), getPoisonDamageModifier()
- **Movement Modifiers**: getSpeedModifier()
- **Weapon Modifiers**: getFireRateModifier(), getCooldownModifier()
- **Pickup Modifiers**: getPickupRangeModifier()
- **XP Modifiers**: getXpModifier(), getMaxHpModifier()

**Event Handlers**:
- `onEnemyKilled()`: Spawns gold nuggets for Prospector
- `onDamageDealt()`: Returns healing for Shaman's life steal
- `onXpCollected()`: Applies XP modifiers

**Integration Points**:
- Character selection: Creates PassiveManager, applies stat modifiers
- Movement: Speed modifiers (Ride Hard +20%)
- Damage dealt: Damage modifiers (Lone Wolf +10%, Noose Tightens +25%)
- Damage taken: Damage reduction (Law & Order -15%)
- XP collection: XP modifiers (Wanted Dead +20%)
- Pickup range: Range modifiers (Gold Rush +50%)
- Enemy kills: Gold spawns (Gold Rush 10% chance)
- Life steal: Healing on damage (Spirit Walk 5%)

**Statistics Tracking**:
- goldCollected, lifeStolenTotal, poisonDamageDealt
- bonusDamageDealt, damageReduced

---

## 📊 Progress & Unlocks

**Tracked Stats**:
- Total kills (Outlaw unlock)
- Max wave reached (Marshal unlock)
- Max XP in single run (Prospector unlock)
- Total poison damage (Shaman unlock)
- Distance traveled (Cavalry unlock)
- Projectiles fired (Gunslinger unlock)
- Bosses killed (Hangman unlock)

**Persistence**:
- localStorage for character progress
- Auto-save on game over
- Progress bars for locked characters

---

## 🎨 Visual Systems

### Particle System
- Hit particles on enemy damage
- Death explosions with color matching
- Configurable lifetime and fade
- Velocity-based physics

### Rendering
- Canvas-based 2D rendering
- Entity colors and sizes
- Weapon trail colors
- Particle alpha blending

---

## 🎨 UI Components

### Game HUD (`src/components/ui/HUD.jsx`)

Western-themed in-game heads-up display with comprehensive player information.

**TOP LEFT - Player Stats**:
```javascript
- Character Portrait
  - Circular frame with rope border decoration
  - Character icon display
  - Character name and level

- Health Bar
  - Heart icon (❤️)
  - Red gradient fill (dark to light)
  - Current HP / Max HP display
  - Damage flash effect (200ms red overlay)
  - Pulse effect when HP < 30%
  - Low HP warning (red vignette)

- XP Bar
  - Star icon (⭐)
  - Gold gradient fill
  - Current XP / Required XP
  - Sparkle effect when > 80% full
  - Smooth fill transition (500ms)
```

**TOP RIGHT - Game Stats**:
```javascript
- Wave Number
  - Large display (text-4xl)
  - Amber gradient with glow
  - "WAVE" label above number

- Kill Count
  - Skull icon (💀)
  - Running total of kills

- Timer
  - Clock icon (⏱️)
  - MM:SS format
  - Real-time game time tracking

- Gold Count
  - Coin icon (💰)
  - Running total of gold nuggets collected
```

**BOTTOM CENTER - Weapon Slots**:
```javascript
- Up to 6 weapon slots displayed
- Each slot shows:
  - Weapon icon (emoji or sprite)
  - Level badge (top-right corner)
  - Cooldown overlay (dark fill from bottom)
  - Active indicator (amber glow + scale 1.1x)

- Active weapon:
  - Amber border glow
  - Pulsing outline
  - Scaled up (110%)

- Empty slots:
  - Dashed border
  - Question mark (?)
```

**TOP CENTER - Boss Health** (conditional):
```javascript
// Only shown when boss is active
- Boss name with devil icon (👹)
- Phase indicator
- Large health bar:
  - Red gradient (dark to light)
  - Animated shimmer effect
  - Current HP / Max HP display
  - Percentage display
  - 300ms transition on damage
```

**CENTER - Announcements**:
```javascript
// 3-second display with animations
- Wave announcements:
  - "WAVE X" text
  - "Prepare yourself!" subtext
  - Amber gradient background

- Boss introductions:
  - Boss name
  - Red gradient background

- Achievement unlocks:
  - Achievement text
  - Green gradient background

- Features:
  - Animated entrance (scale + fade)
  - Animated exit (scale + fade)
  - 6 floating dust particles
  - Rope decorations (top + bottom)
  - Wooden texture background
```

**Visual Design**:
- **Backgrounds**: Wooden/parchment texture with diagonal stripes
- **Borders**: Rope/leather borders (2-4px amber)
- **Font**: Rye serif for western aesthetic
- **Shadows**: Multiple layers for depth
- **Gradients**: Amber, red, gold based on context
- **Animations**:
  - Damage flash (200ms red overlay)
  - Smooth transitions (300-500ms)
  - Pulse effects (2s infinite)
  - Shimmer effects (2s infinite)
  - Float animations for particles

**Reactive Features**:
```javascript
// Damage flash when player takes damage
useEffect(() => {
  if (hp < prevHp) {
    setDamageFlash(true);
    setTimeout(() => setDamageFlash(false), 200);
  }
}, [state.player.hp]);

// Wave announcement on wave change
useEffect(() => {
  if (wave > prevWave) {
    showAnnouncement({ type: 'wave', text: `WAVE ${wave}` });
  }
}, [state.wave]);
```

**Component Structure**:
- `HUD()` - Main component
- `WeaponSlot({ weapon, isActive })` - Individual weapon slot
- `AnnouncementBanner({ type, text, subtext })` - Center announcements

**Integration**:
- Uses `useGame()` hook for state access
- Automatically updates on state changes
- Calculates XP requirements: `100 * (1.5 ^ (level - 1))`
- Formats time as MM:SS
- Shows active boss from enemies array
- Responsive to all game events

---

## 🎯 Input System (`src/hooks/useInput.js`)

**Keyboard**:
- WASD / Arrow keys for movement
- Normalized diagonal movement
- Key state tracking

**Mouse**:
- Position tracking relative to canvas
- Button state management
- Aiming system integration

**Features**:
- Movement vector calculation
- Canvas reference management
- Event handler integration

---

## 🔊 Audio System (`src/systems/AudioSystem.js`)

Web Audio API-based sound system with procedurally generated sounds using oscillators.

**AudioSystem Class**:
```javascript
const audioSystem = createAudioSystem();

// Play sound effects
audioSystem.playSFX('SHOOT_PISTOL', volume=1.0, pitch=1.0);
audioSystem.playSFX('EXPLOSION');

// Spatial audio (volume based on distance)
audioSystem.playSpatial('ENEMY_DEATH', enemyX, enemyY, playerX, playerY, maxDistance=800);

// Music control
audioSystem.playMusic('GAME');
audioSystem.stopMusic();
audioSystem.setMusicVolume(0.5);

// Volume controls
audioSystem.setMasterVolume(0.7);
audioSystem.setMuted(true/false);
audioSystem.toggleMute();
```

**Sound Categories & Priorities**:
- **BOSS** (priority: 100) - Always plays, max 10 concurrent
- **PLAYER** (priority: 80) - Always plays, max 10 concurrent
- **UI** (priority: 60) - Max 5 concurrent
- **ENEMY** (priority: 40) - Max 5 concurrent (limited to prevent spam)
- **MUSIC** (priority: 20) - Background music

**13 Synthesized Sound Effects**:

1. **SHOOT_PISTOL**
   - Sharp square wave, 150Hz → 50Hz
   - Duration: 0.1s
   - Category: PLAYER

2. **SHOOT_SHOTGUN**
   - Deep sawtooth wave, 100Hz → 30Hz
   - Duration: 0.2s (longer than pistol)
   - Category: PLAYER

3. **SHOOT_GATLING**
   - Rapid square wave, 200Hz → 80Hz
   - Duration: 0.05s (very short)
   - Category: PLAYER

4. **EXPLOSION**
   - Low sawtooth boom, 80Hz → 20Hz
   - Duration: 0.6s with decay
   - Category: PLAYER

5. **ENEMY_HIT**
   - Triangle wave thwack, 400Hz → 200Hz
   - Duration: 0.08s
   - Category: ENEMY

6. **ENEMY_DEATH**
   - Descending sawtooth, 300Hz → 50Hz
   - Duration: 0.3s
   - Category: ENEMY

7. **PLAYER_HIT**
   - Impact square wave, 150Hz → 80Hz
   - Duration: 0.15s
   - Category: PLAYER

8. **XP_COLLECT**
   - Rising sine chime, 400Hz → 800Hz
   - Duration: 0.2s
   - Category: PLAYER

9. **LEVEL_UP**
   - Triumphant chord (C5, E5, G5)
   - Staggered notes (0.05s apart)
   - Duration: 0.5s
   - Category: PLAYER

10. **BOSS_INTRO**
    - Dramatic sawtooth sting
    - 100Hz → 50Hz → 100Hz oscillation
    - Duration: 1.0s
    - Category: BOSS

11. **BOSS_DEATH**
    - Epic explosion sequence
    - 3 overlapping explosions + triumphant rise
    - Rising sine 400Hz → 800Hz at end
    - Duration: 2.0s
    - Category: BOSS

12. **MENU_SELECT**
    - Quick square wave click, 600Hz
    - Duration: 0.05s
    - Category: UI

13. **MENU_CONFIRM**
    - Heavier click, 800Hz → 600Hz
    - Duration: 0.1s
    - Category: UI

**3 Background Music Tracks**:

1. **MENU**
   - Melody: C, E, G, E (peaceful)
   - Tempo: 0.6s per note
   - Loops continuously

2. **GAME**
   - Melody: G, A, B, C, B, A (energetic)
   - Tempo: 0.4s per note
   - Faster paced for action

3. **BOSS**
   - Melody: A, B, C, D (intense)
   - Tempo: 0.3s per note
   - Fastest for boss fights

**Sound Generation**:
```javascript
// Oscillator types used:
- Square: Sharp, percussive sounds (guns, impacts)
- Sawtooth: Rich, full sounds (explosions, deaths)
- Triangle: Softer sounds (enemy hits)
- Sine: Pure tones (music, chimes)

// Envelope control:
gainNode.gain.setValueAtTime(attack, now);
gainNode.gain.exponentialRampToValueAtTime(sustain, now + duration);
gainNode.gain.linearRampToValueAtTime(release, now + duration);

// Frequency modulation:
oscillator.frequency.setValueAtTime(startFreq * pitch, now);
oscillator.frequency.exponentialRampToValueAtTime(endFreq * pitch, now + duration);
```

**Spatial Audio**:
```javascript
// Volume calculated by distance (inverse square law)
const distance = Math.sqrt(dx*dx + dy*dy);
const distanceRatio = distance / maxDistance;
const volume = 1 - distanceRatio;

// Sounds beyond maxDistance (800px default) are not played
```

**Concurrent Sound Limiting**:
- Tracks active sounds per category
- Removes finished sounds from tracking
- Prevents new sounds when at limit
- Enemy sounds limited to 5 to prevent spam
- Player/Boss sounds have higher limits (10)

**Volume Controls**:
- Master volume (affects all categories)
- Per-category volume (PLAYER, ENEMY, BOSS, UI, MUSIC)
- Mute toggle (preserves previous volume)
- All volumes range 0.0 to 1.0

**Auto-Resume**:
```javascript
// Audio contexts may be suspended until user interaction
// System automatically resumes on first click or keypress
document.addEventListener('click', resumeAudio);
document.addEventListener('keydown', resumeAudio);
```

**Integration Points**:
- **Weapon firing**: Use weapon type to select sound
  - `getWeaponSound(weaponType)` helper
- **Enemy damage**: `playSpatial('ENEMY_HIT', x, y, playerX, playerY)`
- **Enemy death**: `playSpatial('ENEMY_DEATH', x, y, playerX, playerY)`
- **Player damage**: `playSFX('PLAYER_HIT')`
- **XP collection**: `playSFX('XP_COLLECT')`
- **Level up**: `playSFX('LEVEL_UP')`
- **Boss spawn**: `playSFX('BOSS_INTRO')` + `playMusic('BOSS')`
- **Boss death**: `playSFX('BOSS_DEATH')`
- **Menu interactions**: `playSFX('MENU_SELECT')`, `playSFX('MENU_CONFIRM')`

**Performance**:
- Lightweight oscillator synthesis (no file loading)
- Automatic cleanup of finished sounds
- Concurrent sound limiting prevents audio overload
- Category-based prioritization
- Web Audio API runs on separate thread

**Usage Example**:
```javascript
// Initialize
const audio = createAudioSystem();

// In game loop when shooting
audio.playSFX(getWeaponSound('pistol'), 1.0, 1.0);

// When enemy is hit (spatial)
audio.playSpatial('ENEMY_HIT', enemy.x, enemy.y, player.x, player.y);

// Background music
audio.playMusic('GAME');

// Settings
audio.setMasterVolume(0.7);
audio.setMusicVolume(0.5);
audio.toggleMute();

// Cleanup
audio.destroy();
```

---

## 🎵 Music System (`src/systems/MusicSystem.js`)

Dynamic music system that responds to gameplay with layered western-themed music.

**MusicSystem Class**:
```javascript
const musicSystem = new MusicSystem(audioContext, masterGain);

// Update music state based on gameplay
musicSystem.transitionTo(MUSIC_STATES.BOSS_FIGHT);

// Update in game loop
musicSystem.update(dt);

// Volume controls
musicSystem.setVolume(0.7);
musicSystem.stop();
```

**7 Music States**:

1. **MENU** - Main menu music
   - Calm arpeggiated chords
   - I-IV-V-I progression
   - Gentle, welcoming

2. **GAMEPLAY_CALM** - Normal gameplay
   - Light melodic pattern
   - Pentatonic scale (A minor)
   - Rhythmic accompaniment

3. **GAMEPLAY_ACTION** - High enemy count (>5 enemies)
   - Adds driving rhythm layer
   - Simulated kick drum pattern
   - Increased intensity

4. **BOSS_FIGHT** - Active boss present
   - Power chords with tremolo
   - Fast-paced rhythm
   - Intense, dramatic

5. **LOW_HP** - Player HP < 30%
   - Heartbeat pattern (lub-dub)
   - 100 BPM double beat
   - Tension building

6. **GAME_OVER** - Player defeated
   - Descending notes
   - Somber, final
   - Slow fade

7. **VICTORY** - Wave 50 complete
   - Ascending arpeggio
   - Triumphant sustained chord
   - Celebratory

**4 Music Layers** (can be mixed):

```javascript
MUSIC_LAYERS = {
  BASE: 'BASE',       // Always playing, sets mood
  ACTION: 'ACTION',   // Fades in during combat
  BOSS: 'BOSS',      // Replaces base during boss fights
  TENSION: 'TENSION', // Low HP warning (heartbeat)
}
```

**MusicLayer Class**:
- Individual layer with Web Audio nodes
- Fade in/out capabilities (0.5-2.0s transitions)
- Note playback with scheduling
- Volume control per layer
- Stop/cleanup functionality

**Musical Elements**:

**Pentatonic Scale** (A minor):
```javascript
const PENTATONIC_SCALE = {
  A: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33],
  NOTES: {
    I: 220.00,    // A (root)
    bIII: 261.63, // C (minor third)
    IV: 293.66,   // D (fourth)
    V: 329.63,    // E (fifth)
    bVII: 392.00, // G (minor seventh)
  }
}
```

**Western Chord Progressions**:
1. **CLASSIC**: I-IV-V-I (traditional western)
2. **MOODY**: I-bVII-IV-I (darker feel)
3. **DRAMATIC**: I-bIII-IV-V (tension building)

**State-Specific Implementations**:

**MENU State**:
- 4-bar loop, 120 BPM
- Arpeggiated chords (I, IV, V, I)
- BASE layer only
- Sine waves for smooth tone

**GAMEPLAY_CALM State**:
- 4-bar loop, 120 BPM
- Melodic pattern with pentatonic scale
- BASE layer: melody
- Light accompaniment

**GAMEPLAY_ACTION State**:
- Keeps BASE layer from CALM
- Adds ACTION layer: driving rhythm
- Simulated kick drum (low sine wave)
- Increases energy without replacing melody

**BOSS_FIGHT State**:
- 4-bar loop, 140 BPM (faster)
- BOSS layer replaces BASE
- Power chords (root + fifth)
- Fast tremolo rhythm (sawtooth wave)
- Heavy, intense sound

**LOW_HP State**:
- TENSION layer added to current music
- Heartbeat pattern: lub-dub
- 100 BPM (600ms per beat)
- Double beat: main (60Hz) + echo (50Hz)
- Staggered timing (0ms, 210ms)
- Continues until HP recovered

**GAME_OVER State**:
- BASE layer only
- Descending chromatic notes
- Root → bVII → bVI → V → IV
- Slow tempo, somber
- Fades to silence

**VICTORY State**:
- BASE layer only
- Ascending arpeggio
- Root → III → V → Octave
- Final sustained chord (major)
- Celebratory, triumphant

**Cross-Fade Transitions**:
```javascript
transitionTo(newState, fadeTime = 1.5) {
  // Fade out old state layers
  this.fadeOutState(prevState, fadeTime);

  // Fade in new state layers
  this.fadeInState(newState, fadeTime);

  // Smooth transitions prevent jarring changes
  // Different fade times for different transitions:
  // - Normal transitions: 1.5s
  // - Boss fight: 2.0s (dramatic entrance)
  // - Death: 1.0s (quicker)
}
```

**Layer Mixing**:
- Multiple layers can play simultaneously
- Each layer has independent volume
- Layers fade in/out independently
- Example: ACTION layer fades in over BASE layer

**Automatic State Detection**:
```javascript
// Helper function to determine state from game
getMusicStateFromGame(gameState) {
  const hasActiveBoss = gameState.enemies?.some(e => e.isBoss);
  const isLowHP = gameState.player?.hp < (gameState.player?.maxHp * 0.3);
  const enemyCount = gameState.enemies?.length || 0;

  if (hasActiveBoss) return MUSIC_STATES.BOSS_FIGHT;
  if (isLowHP && enemyCount > 0) return MUSIC_STATES.LOW_HP;
  if (enemyCount > 5) return MUSIC_STATES.GAMEPLAY_ACTION;
  if (gameState.gameStatus === 'playing') return MUSIC_STATES.GAMEPLAY_CALM;
  return MUSIC_STATES.MENU;
}
```

**Technical Implementation**:

**Oscillator Types Used**:
- **Sine**: Melodic lines, smooth tones, bass notes
- **Sawtooth**: Power chords, rich harmonics
- **Square**: Percussive elements, tremolo effects
- **Triangle**: Softer accompaniment

**Note Scheduling**:
```javascript
playNote(frequency, startTime, duration, waveType, volume) {
  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();

  oscillator.type = waveType;
  oscillator.frequency.value = frequency;

  // ADSR envelope
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);  // Attack
  gainNode.gain.setValueAtTime(volume, startTime + duration - 0.1); // Sustain
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);   // Release

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}
```

**Performance Features**:
- Scheduled playback (no real-time processing)
- Efficient note cleanup
- Minimal CPU usage
- Single AudioContext shared with AudioSystem
- No audio file loading required

**Integration Points**:
- Game start: Transition to MENU
- Gameplay start: Transition to GAMEPLAY_CALM
- Enemy count > 5: Transition to GAMEPLAY_ACTION
- Boss spawn: Transition to BOSS_FIGHT (with AudioSystem BOSS_INTRO sound)
- Boss death: Transition back to GAMEPLAY_ACTION or CALM
- Player HP < 30%: Add TENSION layer
- Player HP recovered: Remove TENSION layer
- Player death: Transition to GAME_OVER
- Victory (Wave 50): Transition to VICTORY

**Usage Example**:
```javascript
// Initialize (share AudioContext with AudioSystem)
const audioContext = audioSystem.audioContext;
const masterGain = audioSystem.masterVolume;
const musicSystem = new MusicSystem(audioContext, masterGain);

// In game loop
musicSystem.update(dt);

// State changes
useEffect(() => {
  const newState = getMusicStateFromGame(gameState);
  if (newState !== currentMusicState) {
    musicSystem.transitionTo(newState);
    setCurrentMusicState(newState);
  }
}, [gameState.enemies, gameState.player.hp, gameState.gameStatus]);

// Volume control
musicSystem.setVolume(settings.musicVolume);

// Cleanup
musicSystem.stop();
```

**Balancing Features**:
- Smooth transitions prevent jarring changes
- Layered approach allows gradual intensity increase
- Heartbeat at low HP creates tension without blocking music
- Boss music replaces normal music for focus
- Pentatonic scale creates authentic western feel
- Tempo changes reflect gameplay intensity
- Cross-fades respect player's immersion

---

## 📐 Utility Systems

### Math Utilities (`src/utils/math.js`)
- Distance, angle calculations
- Vector normalization
- Linear interpolation
- Circle/rectangle collision
- Degree/radian conversion
- Random ranges
- Velocity from angle

### Random Utilities (`src/utils/random.js`)
- Array element selection
- Array shuffling
- ID generation
- Probability checks
- Edge/canvas position generation

---

## 🏗️ Project Structure

```
src/
├── components/
│   ├── game/
│   │   ├── GameCanvas.jsx          # Canvas renderer
│   │   └── GameLoop.jsx            # Game orchestration
│   ├── ui/
│   │   ├── HUD.jsx                 # Health, score, wave
│   │   ├── Menu.jsx                # Main menu
│   │   └── GameOver.jsx            # Game over screen
│   └── entities/
│       ├── Player.js               # Player logic
│       ├── Enemy.js                # Enemy AI
│       └── Projectile.js           # Projectile physics
├── systems/
│   ├── PassiveSystem.js            # Passive ability manager
│   ├── PassiveSystem.example.js    # Integration examples
│   ├── WeaponEvolution.js          # Weapon evolution system
│   ├── WeaponEvolution.example.js  # Evolution integration examples
│   ├── WeaponRenderer.js           # Weapon visual effects renderer
│   ├── WeaponRenderer.example.js   # Renderer integration examples
│   ├── BossAI.js                   # Boss behavior and attack patterns
│   ├── WaveDirector.js             # Wave spawning and pacing
│   ├── LevelUpSystem.js            # Upgrade generation and stat bonuses
│   ├── MetaProgression.js          # Persistent progression and achievements
│   ├── ParticleSystem.js           # Particle effects with object pooling
│   ├── ScreenEffects.js            # Screen shake, flash, vignette, slow-mo, color grading
│   ├── AudioSystem.js              # Web Audio API sound system with synthesized sounds
│   ├── MusicSystem.js              # Dynamic music with layered western-themed tracks
│   ├── collision.js                # Collision detection
│   ├── spawning.js                 # Enemy/projectile spawning
│   ├── weapons.js                  # Weapon manager
│   └── upgrades.js                 # Upgrade system
├── data/
│   ├── characters.js               # 8 characters
│   ├── weapons.js                  # 15 weapons + 7 evolutions
│   ├── enemies.js                  # 12 enemy types
│   └── bosses.js                   # 10 legendary bosses
├── hooks/
│   ├── useGameLoop.js              # Game loop hook
│   └── useInput.js                 # Input handling
├── utils/
│   ├── math.js                     # Math utilities
│   └── random.js                   # Random generators
└── context/
    └── GameContext.jsx             # Game state management
```

---

## 🚀 Tech Stack

- **React 19.2.0** - UI framework
- **Vite 7.3.0** - Build tool & dev server
- **Tailwind CSS 4.1.18** - Styling
- **Canvas API** - 2D rendering
- **localStorage** - Progress persistence
- **requestAnimationFrame** - Game loop

---

## 📈 Performance Features

- Delta time capping (100ms max)
- Efficient state updates
- Particle cleanup
- Entity removal when dead/expired
- FPS monitoring
- Optimized collision checks

---

## 🎮 Game Features Implemented

✅ 8 Unique playable characters with unlock conditions
✅ 15 Different weapons with unique mechanics
✅ 7 Legendary weapon evolutions (combining max-level weapons)
✅ 12 Enemy types across 4 tiers (Common, Uncommon, Rare, Elite)
✅ 10 Legendary gunslinger bosses (every 5 waves)
✅ Character unlock system with 7 conditions
✅ **Passive ability system** - All 8 passives fully integrated
✅ **Weapon evolution system** - 7 evolved weapons with special abilities
✅ **Boss phase system** - Multi-phase encounters with dialogue
✅ **Boss AI system** - Sophisticated attack patterns, movement, and telegraphing
✅ **Wave Director system** - Intelligent spawning, 5 wave types, dynamic difficulty
✅ **Level Up system** - 4 upgrade types, 12 stat bonuses, priority-based selection
✅ **Meta Progression system** - Persistent upgrades, 2 currencies, 50+ achievements
✅ **Weapon renderer system** - Complete visual effects for all weapon types
✅ **Particle system** - 15 preset effects, object pooling, LOD optimization
✅ **Screen effects system** - Shake, flash, vignette, slow-mo, 6 color grades, 12 presets
✅ **Game HUD** - Western-themed UI with player stats, boss health, weapon slots, announcements
✅ Western-themed character selection screen
✅ Comprehensive state management
✅ 60 FPS game loop with delta time
✅ Enemy spawning and wave system
✅ Projectile physics and visual effects
✅ Collision detection
✅ XP gem collection with magnetism
✅ Health/invulnerability system
✅ Progress tracking and persistence
✅ Input handling (keyboard + mouse)
✅ **Audio system** - Web Audio API with 13 synthesized SFX, 3 music tracks, spatial audio
✅ **Music system** - Dynamic layered music, 7 states, western pentatonic scale, smooth transitions

---

## 📝 Next Steps

The foundation is complete! Ready to integrate:
- Enemy behaviors implementation (lunge, ranged, charge, phase, spawn)
- Boss spawning integration with WaveDirector
- ✅ **Level-up UI screen** - Integrated into App.jsx, shows when gameStatus is LEVEL_UP
- ✅ **Weapon upgrade system** - ADD_WEAPON, UPGRADE_WEAPON, EVOLVE_WEAPON actions implemented
- ✅ **Stat upgrade application** - APPLY_STAT_UPGRADE action implemented in game state
- ✅ **Meta progression UI** - Integrated into Menu with UPGRADES button, persists via localStorage
- Boss dialogue and phase transition UI
- Boss telegraph rendering (ground markers, warning lines, screen flash)
- Wave announcement UI display
- Weapon visual effects integration (WeaponRenderer in GameCanvas)
- Gold nugget drops from enemies
- Achievement unlock notifications
- Sound effects and music
- Camera shake implementation
- Mobile controls
