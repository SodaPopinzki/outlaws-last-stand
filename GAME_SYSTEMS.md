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

**16 Unique Weapons** across 5 types:

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

### 7. **Game Loop Orchestration** (`src/components/game/GameLoop.jsx`)

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

### 8. **Passive Ability System** (`src/systems/PassiveSystem.js`)

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

## 🔊 Audio System (`src/hooks/useAudio.js`)

**Features**:
- Sound effect loading and caching
- Music playback with looping
- Volume control (0-1)
- Mute toggle
- Overlapping sound support (cloning)

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
│   ├── collision.js                # Collision detection
│   ├── spawning.js                 # Enemy/projectile spawning
│   ├── weapons.js                  # Weapon manager
│   └── upgrades.js                 # Upgrade system
├── data/
│   ├── characters.js               # 8 characters
│   ├── weapons.js                  # 16 weapons
│   ├── enemies.js                  # Enemy types
│   └── bosses.js                   # Boss definitions
├── hooks/
│   ├── useGameLoop.js              # Game loop hook
│   ├── useInput.js                 # Input handling
│   └── useAudio.js                 # Audio manager
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

✅ 8 Unique playable characters
✅ 15 Different weapons with unique mechanics
✅ 7 Legendary weapon evolutions (combining max-level weapons)
✅ Character unlock system with 7 conditions
✅ **Passive ability system** - All 8 passives fully integrated
✅ **Weapon evolution system** - 7 evolved weapons with special abilities
✅ Western-themed character selection screen
✅ Comprehensive state management
✅ 60 FPS game loop with delta time
✅ Enemy spawning and wave system
✅ Projectile physics
✅ Collision detection
✅ XP gem collection with magnetism
✅ Particle effects system
✅ Health/invulnerability system
✅ Progress tracking and persistence
✅ Input handling (keyboard + mouse)
✅ Audio system foundation

---

## 📝 Next Steps

The foundation is complete! Ready to add:
- Boss encounters
- More enemy variety
- Upgrade/level-up UI
- Character selection screen
- Sound effects and music
- Additional weapons
- More particle effects
- Camera shake
- Mobile controls
