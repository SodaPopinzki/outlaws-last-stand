import { useState, useEffect, useMemo } from 'react';
import { useGame, GAME_STATUS } from '../../context/GameContext';
import { MetaProgression } from '../../systems/MetaProgression';

/**
 * Dramatic Game Over Screen
 *
 * Features:
 * - Animated sequence (sepia → fade in → stats roll)
 * - Comprehensive run statistics
 * - Personal best highlights
 * - Rewards summary (gold, stars, achievements)
 * - Three action buttons
 */
export function GameOverScreen() {
  const { state, resetGame, setGameStatus } = useGame();
  const [animationPhase, setAnimationPhase] = useState('initial'); // initial → sepia → fadeIn → statsRoll → complete
  const [visibleStats, setVisibleStats] = useState([]);
  const [newRecords, setNewRecords] = useState([]);
  const [newAchievements, setNewAchievements] = useState([]);
  const [rewards, setRewards] = useState({ gold: 0, stars: 0 });

  // Initialize MetaProgression
  const metaProgression = useMemo(() => new MetaProgression(), []);

  // Load previous best stats
  const previousBests = useMemo(() => {
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
      maxWave: 0,
      maxKills: 0,
      maxTime: 0,
      maxLevel: 0,
      totalKills: 0,
      totalGold: 0,
    };
  }, []);

  // Current run stats
  const runStats = useMemo(() => {
    const timeInSeconds = state.gameTime || 0;
    return {
      time: timeInSeconds,
      wave: state.wave || 1,
      kills: state.kills || 0,
      bossesDefeated: 0, // TODO: Track from game state
      damageDealt: 0, // TODO: Track from game state
      xpCollected: state.player?.xp || 0,
      goldEarned: state.gold || 0,
      level: state.player?.level || 1,
    };
  }, [state]);

  // Check for new records
  useEffect(() => {
    const records = [];
    if (runStats.wave > previousBests.maxWave) records.push('wave');
    if (runStats.kills > previousBests.maxKills) records.push('kills');
    if (runStats.time > previousBests.maxTime) records.push('time');
    if (runStats.level > previousBests.maxLevel) records.push('level');
    setNewRecords(records);

    // Save new records
    const newBests = {
      highScore: Math.max(runStats.kills * runStats.wave, previousBests.highScore),
      maxWave: Math.max(runStats.wave, previousBests.maxWave),
      maxKills: Math.max(runStats.kills, previousBests.maxKills),
      maxTime: Math.max(runStats.time, previousBests.maxTime),
      maxLevel: Math.max(runStats.level, previousBests.maxLevel),
      totalKills: previousBests.totalKills + runStats.kills,
      totalGold: previousBests.totalGold + runStats.goldEarned,
      lastCharacter: state.player?.character?.name || 'Unknown',
    };
    localStorage.setItem('outlaws_game_stats', JSON.stringify(newBests));
  }, [runStats, previousBests, state.player]);

  // Update meta progression and check achievements
  useEffect(() => {
    // Update run stats in meta progression
    metaProgression.updateRunStats({
      kills: runStats.kills,
      wave: runStats.wave,
      time: runStats.time,
      goldEarned: runStats.goldEarned,
    });

    // Check for new achievements
    const allAchievements = metaProgression.getAllAchievements();
    const newlyUnlocked = allAchievements.filter(
      (a) => a.unlocked && !a.wasUnlockedBefore
    );
    setNewAchievements(newlyUnlocked);

    // Calculate rewards
    const goldEarned = runStats.goldEarned;
    const starsEarned = newlyUnlocked.reduce((sum, a) => sum + a.reward, 0);
    setRewards({ gold: goldEarned, stars: starsEarned });
  }, [metaProgression, runStats]);

  // Animation sequence
  useEffect(() => {
    const timeline = [
      { phase: 'sepia', delay: 500 },
      { phase: 'fadeIn', delay: 1500 },
      { phase: 'statsRoll', delay: 2500 },
      { phase: 'complete', delay: 5500 },
    ];

    let timeouts = [];
    timeline.forEach(({ phase, delay }) => {
      const timeout = setTimeout(() => setAnimationPhase(phase), delay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Stats roll-in animation
  useEffect(() => {
    if (animationPhase === 'statsRoll') {
      const stats = [
        'time',
        'wave',
        'kills',
        'bossesDefeated',
        'damageDealt',
        'xpCollected',
        'goldEarned',
        'level',
      ];

      stats.forEach((stat, index) => {
        setTimeout(() => {
          setVisibleStats((prev) => [...prev, stat]);
        }, index * 300);
      });
    }
  }, [animationPhase]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTryAgain = () => {
    resetGame();
    setGameStatus(GAME_STATUS.PLAYING);
  };

  const handleChangeCharacter = () => {
    resetGame();
    setGameStatus(GAME_STATUS.CHARACTER_SELECT);
  };

  const handleMainMenu = () => {
    resetGame();
    setGameStatus(GAME_STATUS.MENU);
  };

  return (
    <div
      className={`
        fixed inset-0 flex items-center justify-center
        transition-all duration-1000
        ${animationPhase === 'initial' ? 'bg-stone-900' : ''}
        ${animationPhase === 'sepia' ? 'bg-gradient-to-b from-amber-950 via-stone-900 to-black' : ''}
        ${animationPhase !== 'initial' ? 'bg-gradient-to-b from-red-950 via-stone-900 to-black' : ''}
      `}
      style={{
        filter:
          animationPhase === 'sepia'
            ? 'sepia(0.6) contrast(1.2)'
            : animationPhase === 'initial'
            ? 'sepia(0)'
            : 'sepia(0)',
      }}
    >
      {/* Dust particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-200/20 rounded-full animate-float-dust"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl w-full mx-4">
        {/* Game Over Title */}
        <div
          className={`
            text-center mb-8 transition-all duration-1000
            ${animationPhase === 'fadeIn' || animationPhase === 'statsRoll' || animationPhase === 'complete' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}
          `}
        >
          <h1
            className="text-8xl font-bold mb-4 animate-pulse"
            style={{
              fontFamily: 'Rye, serif',
              color: '#dc2626',
              textShadow: `
                0 0 20px rgba(220, 38, 38, 0.8),
                0 0 40px rgba(220, 38, 38, 0.6),
                0 0 60px rgba(220, 38, 38, 0.4),
                4px 4px 0px #7f1d1d,
                8px 8px 0px #450a0a
              `,
            }}
          >
            GAME OVER
          </h1>
          <p className="text-2xl text-red-200 italic" style={{ fontFamily: 'Georgia, serif' }}>
            {state.player?.character?.name || 'The Outlaw'} has fallen...
          </p>
        </div>

        {/* Stats Panel */}
        <div
          className={`
            bg-gradient-to-b from-stone-800/90 to-stone-900/90 backdrop-blur-sm
            border-4 border-amber-600 rounded-lg p-8 mb-8
            transition-all duration-1000
            ${animationPhase === 'statsRoll' || animationPhase === 'complete' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
        >
          <h2
            className="text-3xl font-bold text-amber-400 mb-6 text-center"
            style={{ fontFamily: 'Rye, serif' }}
          >
            Run Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <StatRow
              icon="⏱️"
              label="Time Survived"
              value={formatTime(runStats.time)}
              visible={visibleStats.includes('time')}
              isRecord={newRecords.includes('time')}
            />
            <StatRow
              icon="🌊"
              label="Wave Reached"
              value={runStats.wave}
              visible={visibleStats.includes('wave')}
              isRecord={newRecords.includes('wave')}
            />
            <StatRow
              icon="💀"
              label="Enemies Killed"
              value={runStats.kills}
              visible={visibleStats.includes('kills')}
              isRecord={newRecords.includes('kills')}
            />
            <StatRow
              icon="👹"
              label="Bosses Defeated"
              value={runStats.bossesDefeated}
              visible={visibleStats.includes('bossesDefeated')}
            />
            <StatRow
              icon="⚔️"
              label="Damage Dealt"
              value={runStats.damageDealt.toLocaleString()}
              visible={visibleStats.includes('damageDealt')}
            />
            <StatRow
              icon="⭐"
              label="XP Collected"
              value={runStats.xpCollected.toLocaleString()}
              visible={visibleStats.includes('xpCollected')}
            />
            <StatRow
              icon="💰"
              label="Gold Earned"
              value={runStats.goldEarned}
              visible={visibleStats.includes('goldEarned')}
            />
            <StatRow
              icon="📊"
              label="Level Reached"
              value={runStats.level}
              visible={visibleStats.includes('level')}
              isRecord={newRecords.includes('level')}
            />
          </div>

          {/* New Records Banner */}
          {newRecords.length > 0 && animationPhase === 'complete' && (
            <div className="bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg p-4 border-2 border-yellow-400 animate-pulse">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">🏆</span>
                <span className="text-xl font-bold text-white" style={{ fontFamily: 'Rye, serif' }}>
                  NEW RECORD{newRecords.length > 1 ? 'S' : ''}!
                </span>
                <span className="text-3xl">🏆</span>
              </div>
            </div>
          )}
        </div>

        {/* Rewards Summary */}
        {animationPhase === 'complete' && (rewards.gold > 0 || rewards.stars > 0 || newAchievements.length > 0) && (
          <div className="bg-gradient-to-b from-emerald-900/90 to-stone-900/90 backdrop-blur-sm border-4 border-emerald-600 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-emerald-400 mb-4 text-center" style={{ fontFamily: 'Rye, serif' }}>
              Rewards Earned
            </h3>

            <div className="flex justify-center gap-8 mb-4">
              {rewards.gold > 0 && (
                <div className="text-center">
                  <div className="text-4xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-yellow-400">{rewards.gold}</div>
                  <div className="text-sm text-gray-300">Gold Nuggets</div>
                </div>
              )}
              {rewards.stars > 0 && (
                <div className="text-center">
                  <div className="text-4xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-yellow-400">{rewards.stars}</div>
                  <div className="text-sm text-gray-300">Bounty Stars</div>
                </div>
              )}
            </div>

            {/* New Achievements */}
            {newAchievements.length > 0 && (
              <div className="space-y-2">
                <p className="text-center text-emerald-300 font-semibold mb-2">
                  New Achievements Unlocked!
                </p>
                {newAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-stone-800/50 rounded px-4 py-2 border border-emerald-500 flex items-center gap-3"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-emerald-200">{achievement.name}</div>
                      <div className="text-xs text-gray-400">{achievement.description}</div>
                    </div>
                    <div className="text-yellow-400">+{achievement.reward} ⭐</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {animationPhase === 'complete' && (
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <ActionButton
              text="TRY AGAIN"
              icon="🔄"
              onClick={handleTryAgain}
              primary
            />
            <ActionButton
              text="CHANGE CHARACTER"
              icon="👤"
              onClick={handleChangeCharacter}
            />
            <ActionButton
              text="MAIN MENU"
              icon="🏠"
              onClick={handleMainMenu}
            />
          </div>
        )}

        {/* Random Western Quote */}
        {animationPhase === 'complete' && (
          <p className="text-center text-gray-400 italic mt-8">
            "{getRandomQuote()}"
          </p>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Rye&display=swap');

        @keyframes float-dust {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translate(${Math.random() * 100 - 50}px, -100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-float-dust {
          animation: float-dust linear infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Stat Row Component
 */
function StatRow({ icon, label, value, visible = true, isRecord = false }) {
  return (
    <div
      className={`
        bg-stone-800/50 rounded-lg p-4 border-2
        transition-all duration-500 transform
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}
        ${isRecord ? 'border-yellow-500 bg-gradient-to-r from-yellow-900/30 to-amber-900/30' : 'border-stone-700'}
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <div className="text-sm text-gray-400">{label}</div>
          <div className={`text-2xl font-bold ${isRecord ? 'text-yellow-400' : 'text-amber-300'}`}>
            {value}
            {isRecord && (
              <span className="ml-2 text-sm text-yellow-400 animate-pulse">NEW!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Action Button Component
 */
function ActionButton({ text, icon, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-8 py-4 rounded-lg font-bold text-xl border-4
        transform transition-all duration-300 hover:scale-105
        ${primary
          ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-400 text-white shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:shadow-[0_0_40px_rgba(220,38,38,0.8)]'
          : 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-400 text-white shadow-[0_0_20px_rgba(217,119,6,0.5)] hover:shadow-[0_0_30px_rgba(217,119,6,0.7)]'
        }
      `}
      style={{
        fontFamily: 'Rye, serif',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      }}
    >
      <span className="mr-2">{icon}</span>
      {text}
    </button>
  );
}

/**
 * Random Western Quotes
 */
function getRandomQuote() {
  const quotes = [
    "Even the fastest gun has to reload.",
    "It ain't about how fast you draw, it's about survival.",
    "Every outlaw falls eventually.",
    "The desert claims all who wander unprepared.",
    "Dust to dust, gunslinger.",
    "Your legend ends here, partner.",
    "Not every sunset is worth chasing.",
    "The frontier doesn't forgive mistakes.",
    "Better luck next time, cowpoke.",
    "Even legends fade in the western sun.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export default GameOverScreen;
