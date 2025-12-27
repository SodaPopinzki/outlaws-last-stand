# 🤠 Outlaw's Last Stand

A high-octane western-themed survivor-like game built with React and Vite. Fight off waves of outlaws, gunslingers, and legendary bosses in a fast-paced bullet hell experience set in the Wild West!

## 🎮 Play Now

**[Live Demo](https://SodaPopinzki.github.io/outlaws-last-stand/)**

## ✨ Features

### 🎯 Core Gameplay
- **8 Unique Characters** - Each with distinct abilities and playstyles
- **15 Base Weapons** - From six-shooters to dynamite
- **7 Legendary Evolutions** - Discover powerful weapon combinations
- **12 Enemy Types** - Bandits, gunslingers, desperados, and more
- **10 Epic Boss Fights** - Face legendary outlaws with unique mechanics
- **Waves of Chaos** - Survive 50+ waves of increasing difficulty

### 🎨 Visual & Audio
- **Western-Themed UI** - Authentic frontier aesthetic with wooden signs and rope borders
- **Dynamic Particle System** - Explosions, muzzle flashes, dust, and blood effects
- **Screen Effects** - Camera shake, flashes, vignette, and slow-motion
- **Procedural Music** - Dynamic western soundtrack with layered instruments
- **Synthesized SFX** - 13 unique sound effects using Web Audio API

### 🏆 Meta Progression
- **Permanent Upgrades** - Spend Gold Nuggets on persistent stat boosts
- **Achievement System** - 30+ achievements with Bounty Star rewards
- **Character Unlocks** - Unlock new characters by completing challenges
- **Weapon Unlocks** - Discover and permanently unlock rare weapons
- **Statistics Tracking** - Detailed run history and personal bests

### ⚡ Performance
- **60 FPS Gameplay** - Optimized with object pooling and spatial partitioning
- **LOD System** - Dynamic quality adjustment based on performance
- **Render Culling** - Only draw what's visible on screen
- **Enemy AI Culling** - Smart AI updates for off-screen enemies

### 💾 Save System
- **Auto-Save** - Progress automatically saved every 60 seconds
- **LocalStorage** - All data persists between sessions
- **Export/Import** - Share your progress with shareable codes
- **Version Migration** - Automatic save data updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/SodaPopinzki/outlaws-last-stand.git
cd outlaws-last-stand

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to play!

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 📦 Project Structure

```
outlaws-last-stand/
├── src/
│   ├── components/
│   │   └── ui/              # React UI components
│   │       ├── MainMenu.jsx
│   │       ├── CharacterSelect.jsx
│   │       ├── GameHUD.jsx
│   │       ├── PauseMenu.jsx
│   │       ├── LevelUpScreen.jsx
│   │       ├── GameOverScreen.jsx
│   │       ├── MetaUpgradeShop.jsx
│   │       └── AchievementList.jsx
│   ├── systems/             # Core game systems
│   │   ├── GameLoop.js
│   │   ├── CharacterSystem.js
│   │   ├── WeaponSystem.js
│   │   ├── EnemySystem.js
│   │   ├── BossSystem.js
│   │   ├── ParticleSystem.js
│   │   ├── ScreenEffects.js
│   │   ├── AudioSystem.js
│   │   ├── MusicSystem.js
│   │   ├── MetaProgression.js
│   │   ├── PerformanceManager.js
│   │   └── SaveSystem.js
│   ├── context/
│   │   └── GameContext.jsx  # Global state management
│   ├── App.jsx
│   └── main.jsx
├── docs/
│   ├── GAME_SYSTEMS.md      # Technical documentation
│   ├── POLISH_CHECKLIST.md  # QA testing guide
│   └── DEPLOYMENT_GUIDE.md  # Deployment instructions
└── package.json
```

## 🎯 Controls

- **WASD** - Movement
- **Mouse** - Aim
- **Left Click** - Shoot (for some weapons)
- **ESC / P** - Pause
- **Click** - Select upgrades on level up

## 🛠️ Tech Stack

- **React 19.2.0** - UI framework with hooks
- **Vite 7.3.0** - Build tool and dev server
- **Tailwind CSS 4.1.18** - Utility-first CSS
- **Web Audio API** - Procedural sound synthesis
- **Canvas API** - 2D rendering
- **LocalStorage API** - Data persistence

## 📖 Documentation

- **[Game Systems Guide](docs/GAME_SYSTEMS.md)** - Complete technical documentation
- **[Polish Checklist](docs/POLISH_CHECKLIST.md)** - Quality assurance testing guide
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - GitHub Pages deployment instructions

## 🎮 Gameplay Tips

1. **Start Simple** - Begin with the Drifter character to learn the basics
2. **Move Constantly** - Standing still is death in this game
3. **Weapon Synergy** - Combine weapons strategically for evolutions
4. **Boss Patterns** - Learn boss attack patterns to survive
5. **Meta Upgrades** - Invest in permanent upgrades early
6. **Achievements** - Complete achievements for Bounty Stars

## 🏆 Achievements

Track 30+ achievements including:
- **First Blood** - Kill your first enemy
- **Quick Draw** - Defeat a boss in under 30 seconds
- **Untouchable** - Complete a wave without taking damage
- **Arsenal Master** - Discover all weapon evolutions
- **Legendary Outlaw** - Reach wave 50

## 🎨 Characters

| Character | Ability | Playstyle |
|-----------|---------|-----------|
| **The Drifter** | Extra speed | Beginner-friendly |
| **The Outlaw** | More damage | Aggressive |
| **The Gunslinger** | Faster fire rate | Fast-paced |
| **The Marshal** | Higher max HP | Tanky |
| **The Gambler** | Lucky critical hits | High-risk |
| **The Bounty Hunter** | Gold bonuses | Meta progression |
| **The Sharpshooter** | Increased range | Sniper |
| **The Desperado** | Multi-weapon master | Advanced |

## 📊 Stats

- **56 Files Created** - ~24,870 lines of code
- **Version** - 1.0.0
- **Development Time** - Built with Claude Code
- **License** - MIT

## 🚀 Deployment

See **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** for complete instructions on deploying to GitHub Pages.

Quick deploy:
```bash
git push -u origin main
# Then enable GitHub Pages in repository settings
```

## 🤝 Contributing

This is a personal project, but feel free to fork and modify! If you create something cool, let me know.

## 📜 License

MIT License - Feel free to use this project for learning or your own games!

## 🎉 Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Vite](https://vite.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Western font: [Rye](https://fonts.google.com/specimen/Rye) by Google Fonts

---

**Saddle up and take your last stand! 🤠🔫**
