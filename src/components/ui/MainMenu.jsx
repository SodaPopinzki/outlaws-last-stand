import { useState, useEffect, useMemo, useRef } from 'react';
import { useGame, GAME_STATUS } from '../../context/GameContext';
import MetaUpgradeShop from './MetaUpgradeShop';
import { MetaProgression } from '../../systems/MetaProgression';

/**
 * Atmospheric Western Main Menu
 *
 * Features:
 * - Sunset desert scene with parallax
 * - Animated tumbleweeds and dust particles
 * - Wooden sign menu options with swing animations
 * - Sound effects integration
 * - Stats display (version, high score, last character)
 */
export function MainMenu() {
  const { setGameStatus } = useGame();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showUpgradeShop, setShowUpgradeShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [dustParticles, setDustParticles] = useState([]);
  const menuRef = useRef(null);

  // Initialize MetaProgression system
  const metaProgression = useMemo(() => new MetaProgression(), []);

  // Get stats from localStorage
  const stats = useMemo(() => {
    try {
      const saved = localStorage.getItem('outlaws_game_stats');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
    return {
      highScore: 0,
      lastCharacter: null,
      totalKills: 0,
      maxWave: 0,
    };
  }, []);

  // Mouse movement parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!menuRef.current) return;
      const rect = menuRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate dust particles
  useEffect(() => {
    const particles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.3 + 0.1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }));
    setDustParticles(particles);
  }, []);

  // Play sound effect (placeholder - will integrate with AudioSystem)
  const playSound = (soundType) => {
    // TODO: Integrate with AudioSystem
    // audioSystem.playSFX(soundType);
    console.log('Sound:', soundType);
  };

  const handleMenuClick = (action, soundType = 'MENU_SELECT') => {
    playSound(soundType);
    action();
  };

  return (
    <div
      ref={menuRef}
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden select-none"
      style={{
        background: `linear-gradient(
          to bottom,
          #1e1b4b 0%,
          #312e81 20%,
          #7c2d12 40%,
          #dc2626 60%,
          #ea580c 70%,
          #f59e0b 80%,
          #78350f 90%,
          #1c1917 100%
        )`,
      }}
    >
      {/* Parallax Background Layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${mousePos.x * 5}px, ${mousePos.y * 5}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* Distant Mountains */}
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 320"
          style={{ opacity: 0.3 }}
        >
          <path
            fill="#1c1917"
            d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,133.3C672,128,768,160,864,165.3C960,171,1056,149,1152,144C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>

        {/* Mid-ground Hills */}
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 200"
          style={{ opacity: 0.5 }}
        >
          <path
            fill="#292524"
            d="M0,96L48,106.7C96,117,192,139,288,138.7C384,139,480,117,576,112C672,107,768,117,864,128C960,139,1056,149,1152,144C1248,139,1344,117,1392,106.7L1440,96L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"
          />
        </svg>

        {/* Cacti Silhouettes */}
        <div className="absolute bottom-20 left-10 opacity-40">
          <CactusIcon size={80} />
        </div>
        <div className="absolute bottom-32 right-20 opacity-30">
          <CactusIcon size={120} />
        </div>
        <div className="absolute bottom-16 left-1/4 opacity-35">
          <CactusIcon size={60} />
        </div>
        <div className="absolute bottom-24 right-1/3 opacity-25">
          <CactusIcon size={100} />
        </div>
      </div>

      {/* Dust Particles */}
      {dustParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-amber-200/20 pointer-events-none animate-float-dust"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Tumbleweeds */}
      <Tumbleweed delay={0} duration={25} startY={60} />
      <Tumbleweed delay={8} duration={30} startY={70} />
      <Tumbleweed delay={15} duration={28} startY={55} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-12 p-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1
            className="text-8xl font-bold tracking-wider animate-flicker-glow"
            style={{
              fontFamily: 'Rye, serif',
              color: '#fbbf24',
              textShadow: `
                0 0 20px rgba(251, 191, 36, 0.8),
                0 0 40px rgba(251, 191, 36, 0.6),
                0 0 60px rgba(251, 191, 36, 0.4),
                0 0 80px rgba(251, 191, 36, 0.2),
                4px 4px 0px #78350f,
                8px 8px 0px #451a03
              `,
            }}
          >
            OUTLAW'S LAST STAND
          </h1>
          <p
            className="text-2xl italic text-amber-200/90"
            style={{
              fontFamily: 'Georgia, serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            A Western Survival Tale
          </p>
        </div>

        {/* Menu Options (Wooden Signs) */}
        <div className="flex flex-col gap-6 mt-8">
          <WoodenSign
            text="PLAY"
            icon="🎮"
            onClick={() => handleMenuClick(() => setGameStatus(GAME_STATUS.CHARACTER_SELECT), 'MENU_CONFIRM')}
            primary
          />
          <WoodenSign
            text="UPGRADES"
            icon="⭐"
            onClick={() => handleMenuClick(() => setShowUpgradeShop(true))}
          />
          <WoodenSign
            text="ACHIEVEMENTS"
            icon="🏆"
            onClick={() => handleMenuClick(() => setShowAchievements(true))}
          />
          <WoodenSign
            text="SETTINGS"
            icon="⚙️"
            onClick={() => handleMenuClick(() => setShowSettings(true))}
          />
          <WoodenSign
            text="CREDITS"
            icon="📜"
            onClick={() => handleMenuClick(() => setShowCredits(true))}
          />
        </div>
      </div>

      {/* Bottom Corner Stats */}
      <div className="absolute bottom-4 left-4 space-y-1 text-amber-200/60 text-sm">
        <div>v1.0.0</div>
        {stats.highScore > 0 && (
          <div>High Score: {stats.highScore.toLocaleString()}</div>
        )}
        {stats.lastCharacter && (
          <div>Last: {stats.lastCharacter}</div>
        )}
      </div>

      {/* Bottom Corner Total Stats */}
      <div className="absolute bottom-4 right-4 text-right space-y-1 text-amber-200/60 text-sm">
        {stats.totalKills > 0 && (
          <div>💀 {stats.totalKills.toLocaleString()} Total Kills</div>
        )}
        {stats.maxWave > 0 && (
          <div>🌊 Wave {stats.maxWave} Best</div>
        )}
      </div>

      {/* Modals */}
      {showUpgradeShop && (
        <MetaUpgradeShop
          metaProgression={metaProgression}
          onClose={() => {
            playSound('MENU_SELECT');
            setShowUpgradeShop(false);
          }}
        />
      )}

      {showAchievements && (
        <AchievementGallery
          metaProgression={metaProgression}
          onClose={() => {
            playSound('MENU_SELECT');
            setShowAchievements(false);
          }}
        />
      )}

      {showSettings && (
        <SettingsPanel
          onClose={() => {
            playSound('MENU_SELECT');
            setShowSettings(false);
          }}
        />
      )}

      {showCredits && (
        <CreditsScreen
          onClose={() => {
            playSound('MENU_SELECT');
            setShowCredits(false);
          }}
        />
      )}

      {/* Add custom animations */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Rye&display=swap');

        @keyframes flicker-glow {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 20px rgba(251, 191, 36, 0.8));
          }
          50% {
            filter: brightness(1.1) drop-shadow(0 0 30px rgba(251, 191, 36, 1));
          }
        }

        @keyframes float-dust {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(10px, -20px) rotate(90deg);
          }
          50% {
            transform: translate(-5px, -40px) rotate(180deg);
          }
          75% {
            transform: translate(15px, -60px) rotate(270deg);
          }
          100% {
            transform: translate(0, -80px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes swing {
          0%, 100% {
            transform: rotate(-2deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }

        .animate-flicker-glow {
          animation: flicker-glow 3s ease-in-out infinite;
        }

        .animate-float-dust {
          animation: float-dust linear infinite;
        }

        .animate-swing {
          animation: swing 2s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>
    </div>
  );
}

/**
 * Wooden Sign Button Component
 */
function WoodenSign({ text, icon, onClick, primary = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDust, setShowDust] = useState(false);

  const handleClick = () => {
    setShowDust(true);
    setTimeout(() => setShowDust(false), 600);
    onClick();
  };

  return (
    <div className="relative">
      {/* Dust puff on click */}
      {showDust && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-ping w-20 h-20 rounded-full bg-amber-400/30" />
        </div>
      )}

      {/* Rope hanging the sign */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-0.5 h-8 bg-amber-900/60" />

      {/* Wooden sign */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative px-12 py-4 rounded-lg border-4 font-bold text-2xl
          transform transition-all duration-300
          ${isHovered ? 'animate-swing scale-105' : ''}
          ${primary ? 'border-amber-400 bg-gradient-to-b from-amber-600 to-amber-800 text-white shadow-[0_0_30px_rgba(251,191,36,0.8)]' : 'border-amber-700 bg-gradient-to-b from-amber-800 to-amber-950 text-amber-100 shadow-[0_0_20px_rgba(120,53,15,0.5)]'}
        `}
        style={{
          fontFamily: 'Rye, serif',
          backgroundImage: `
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(0, 0, 0, 0.1) 50%,
              transparent 100%
            ),
            repeating-linear-gradient(
              90deg,
              ${primary ? '#d97706' : '#78350f'} 0px,
              ${primary ? '#b45309' : '#451a03'} 2px,
              ${primary ? '#d97706' : '#78350f'} 4px
            )
          `,
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        }}
      >
        <span className="mr-3">{icon}</span>
        {text}

        {/* Wood grain texture overlay */}
        <div
          className="absolute inset-0 rounded-lg opacity-20 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.1) 2px,
              rgba(0, 0, 0, 0.1) 4px
            )`,
          }}
        />

        {/* Nails in corners */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-700 border border-gray-900" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-700 border border-gray-900" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-gray-700 border border-gray-900" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-gray-700 border border-gray-900" />
      </button>
    </div>
  );
}

/**
 * Animated Tumbleweed Component
 */
function Tumbleweed({ delay = 0, duration = 20, startY = 60 }) {
  return (
    <div
      className="absolute pointer-events-none opacity-40"
      style={{
        bottom: `${startY}%`,
        animation: `tumble ${duration}s linear ${delay}s infinite`,
      }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="none" stroke="#78350f" strokeWidth="2" />
        <circle cx="20" cy="20" r="12" fill="none" stroke="#78350f" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="6" fill="none" stroke="#78350f" strokeWidth="1" />
        <line x1="20" y1="2" x2="20" y2="38" stroke="#78350f" strokeWidth="1" />
        <line x1="2" y1="20" x2="38" y2="20" stroke="#78350f" strokeWidth="1" />
        <line x1="6" y1="6" x2="34" y2="34" stroke="#78350f" strokeWidth="0.5" />
        <line x1="6" y1="34" x2="34" y2="6" stroke="#78350f" strokeWidth="0.5" />
      </svg>

      <style jsx>{`
        @keyframes tumble {
          0% {
            transform: translateX(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.4;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateX(calc(100vw + 100px)) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Cactus Silhouette Icon
 */
function CactusIcon({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 100" fill="#1c1917">
      {/* Main trunk */}
      <rect x="23" y="30" width="14" height="70" rx="2" />
      {/* Left arm */}
      <rect x="8" y="40" width="10" height="30" rx="2" />
      <rect x="8" y="40" width="20" height="10" rx="2" />
      {/* Right arm */}
      <rect x="42" y="50" width="10" height="25" rx="2" />
      <rect x="32" y="50" width="20" height="10" rx="2" />
      {/* Spikes */}
      <circle cx="18" cy="45" r="1.5" />
      <circle cx="15" cy="52" r="1.5" />
      <circle cx="12" cy="60" r="1.5" />
      <circle cx="30" cy="35" r="1.5" />
      <circle cx="26" cy="45" r="1.5" />
      <circle cx="33" cy="55" r="1.5" />
      <circle cx="47" cy="55" r="1.5" />
      <circle cx="44" cy="65" r="1.5" />
    </svg>
  );
}

/**
 * Achievement Gallery Modal
 */
function AchievementGallery({ metaProgression, onClose }) {
  const achievements = metaProgression.getAllAchievements();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-amber-900 to-stone-900 border-4 border-amber-600 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-amber-400" style={{ fontFamily: 'Rye, serif' }}>
            🏆 Achievements
          </h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded border-2 border-red-500"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 ${
                achievement.unlocked
                  ? 'bg-amber-800/50 border-amber-500'
                  : 'bg-gray-800/50 border-gray-600 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-200">{achievement.name}</h3>
                  <p className="text-sm text-gray-300">{achievement.description}</p>
                  <div className="mt-2 text-xs text-amber-400">
                    Reward: {achievement.reward} {achievement.rewardType === 'stars' ? '⭐' : '💰'}
                  </div>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="mt-1 text-xs text-gray-400">
                      Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Settings Panel Modal
 */
function SettingsPanel({ onClose }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('outlaws_settings');
    return saved ? JSON.parse(saved) : {
      soundVolume: 0.7,
      musicVolume: 0.5,
      sfxEnabled: true,
      musicEnabled: true,
      difficulty: 'normal',
    };
  });

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('outlaws_settings', JSON.stringify(newSettings));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-amber-900 to-stone-900 border-4 border-amber-600 rounded-lg max-w-2xl w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-amber-400" style={{ fontFamily: 'Rye, serif' }}>
            ⚙️ Settings
          </h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded border-2 border-red-500"
          >
            Close
          </button>
        </div>

        <div className="space-y-6">
          {/* Sound Volume */}
          <div>
            <label className="block text-amber-200 mb-2">Sound Effects Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.soundVolume}
              onChange={(e) => updateSetting('soundVolume', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-400">{Math.round(settings.soundVolume * 100)}%</div>
          </div>

          {/* Music Volume */}
          <div>
            <label className="block text-amber-200 mb-2">Music Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.musicVolume}
              onChange={(e) => updateSetting('musicVolume', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-400">{Math.round(settings.musicVolume * 100)}%</div>
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between">
            <span className="text-amber-200">Sound Effects</span>
            <button
              onClick={() => updateSetting('sfxEnabled', !settings.sfxEnabled)}
              className={`px-4 py-2 rounded border-2 ${
                settings.sfxEnabled
                  ? 'bg-green-700 border-green-500 text-white'
                  : 'bg-gray-700 border-gray-500 text-gray-300'
              }`}
            >
              {settings.sfxEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-amber-200">Music</span>
            <button
              onClick={() => updateSetting('musicEnabled', !settings.musicEnabled)}
              className={`px-4 py-2 rounded border-2 ${
                settings.musicEnabled
                  ? 'bg-green-700 border-green-500 text-white'
                  : 'bg-gray-700 border-gray-500 text-gray-300'
              }`}
            >
              {settings.musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-amber-200 mb-2">Difficulty</label>
            <div className="flex gap-2">
              {['easy', 'normal', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => updateSetting('difficulty', diff)}
                  className={`flex-1 px-4 py-2 rounded border-2 capitalize ${
                    settings.difficulty === diff
                      ? 'bg-amber-600 border-amber-400 text-white'
                      : 'bg-gray-700 border-gray-500 text-gray-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Credits Screen Modal
 */
function CreditsScreen({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-amber-900 to-stone-900 border-4 border-amber-600 rounded-lg max-w-2xl w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-amber-400" style={{ fontFamily: 'Rye, serif' }}>
            📜 Credits
          </h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded border-2 border-red-500"
          >
            Close
          </button>
        </div>

        <div className="space-y-6 text-amber-200">
          <div>
            <h3 className="text-2xl font-bold mb-2 text-amber-400">Outlaw's Last Stand</h3>
            <p className="text-gray-300">A western-themed survivor-like game</p>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Game Design & Development</h4>
            <p className="text-gray-300">Created with React, Canvas API, and Web Audio</p>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Technologies</h4>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>React 19.2.0</li>
              <li>Vite 7.3.0</li>
              <li>Tailwind CSS 4.1.18</li>
              <li>Canvas API for rendering</li>
              <li>Web Audio API for sound</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Special Thanks</h4>
            <p className="text-gray-300">To all the legendary outlaws of the Wild West who inspired this game</p>
          </div>

          <div className="text-center pt-4 border-t border-amber-700">
            <p className="text-sm text-gray-400">Made with ❤️ for western fans everywhere</p>
            <p className="text-xs text-gray-500 mt-2">© 2024 Outlaw's Last Stand</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
