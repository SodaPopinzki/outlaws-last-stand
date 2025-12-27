import { useState, useEffect } from 'react';
import { useGame, GAME_STATUS } from '../../context/GameContext';

/**
 * In-Game Pause Menu
 *
 * Features:
 * - ESC/P to toggle pause
 * - Semi-transparent overlay with blur
 * - Current run stats display
 * - Resume, Settings, Give Up options
 * - Settings sub-panel with volume/toggle controls
 * - Give up confirmation dialog
 */
export function PauseMenu() {
  const { state, setGameStatus } = useGame();
  const [showSettings, setShowSettings] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('outlaws_settings');
    return saved ? JSON.parse(saved) : {
      soundVolume: 0.7,
      musicVolume: 0.5,
      screenShake: true,
      showDamageNumbers: true,
      showFPS: false,
    };
  });

  // Listen for ESC key to toggle pause
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (state.gameStatus === GAME_STATUS.PLAYING) {
          setGameStatus(GAME_STATUS.PAUSED);
        } else if (state.gameStatus === GAME_STATUS.PAUSED) {
          handleResume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.gameStatus, setGameStatus]);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('outlaws_settings', JSON.stringify(newSettings));

    // TODO: Apply settings to AudioSystem
    // if (key === 'soundVolume') audioSystem.setSFXVolume(value);
    // if (key === 'musicVolume') audioSystem.setMusicVolume(value);
  };

  const handleResume = () => {
    setShowSettings(false);
    setShowGiveUpConfirm(false);
    setGameStatus(GAME_STATUS.PLAYING);
  };

  const handleGiveUp = () => {
    setGameStatus(GAME_STATUS.GAME_OVER);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render if not paused
  if (state.gameStatus !== GAME_STATUS.PAUSED) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={handleResume}
      />

      {/* Main pause panel */}
      <div className="relative z-10 bg-gradient-to-b from-stone-800 to-stone-900 border-4 border-amber-600 rounded-lg shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 border-b-4 border-amber-800">
          <h2
            className="text-4xl font-bold text-center text-white tracking-wider"
            style={{
              fontFamily: 'Rye, serif',
              textShadow: '3px 3px 0px rgba(0,0,0,0.5)',
            }}
          >
            PAUSED
          </h2>
        </div>

        {/* Content */}
        {!showSettings && !showGiveUpConfirm && (
          <div className="p-6 space-y-6">
            {/* Current Run Stats */}
            <div className="bg-black/30 rounded-lg p-4 border-2 border-amber-800/50">
              <h3 className="text-xl font-bold text-amber-400 mb-3 text-center">
                Current Run
              </h3>
              <div className="grid grid-cols-2 gap-3 text-amber-200">
                <StatDisplay
                  icon="⏱️"
                  label="Time"
                  value={formatTime(state.gameTime || 0)}
                />
                <StatDisplay
                  icon="🌊"
                  label="Wave"
                  value={state.wave || 1}
                />
                <StatDisplay
                  icon="💀"
                  label="Kills"
                  value={state.kills || 0}
                />
                <StatDisplay
                  icon="⭐"
                  label="Level"
                  value={state.player?.level || 1}
                />
              </div>
            </div>

            {/* Menu Options */}
            <div className="space-y-3">
              <MenuButton
                text="RESUME"
                icon="▶️"
                onClick={handleResume}
                primary
                subtitle="Press ESC"
              />
              <MenuButton
                text="SETTINGS"
                icon="⚙️"
                onClick={() => setShowSettings(true)}
              />
              <MenuButton
                text="GIVE UP"
                icon="🏳️"
                onClick={() => setShowGiveUpConfirm(true)}
                danger
              />
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-amber-400">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-white rounded border-2 border-stone-500 text-sm"
              >
                Back
              </button>
            </div>

            {/* Music Volume */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-amber-200 font-semibold">🎵 Music Volume</label>
                <span className="text-amber-400 font-mono text-sm">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => updateSetting('musicVolume', parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* SFX Volume */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-amber-200 font-semibold">🔊 SFX Volume</label>
                <span className="text-amber-400 font-mono text-sm">
                  {Math.round(settings.soundVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => updateSetting('soundVolume', parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
              <ToggleSetting
                label="Screen Shake"
                icon="📳"
                enabled={settings.screenShake}
                onToggle={() => updateSetting('screenShake', !settings.screenShake)}
              />
              <ToggleSetting
                label="Damage Numbers"
                icon="💥"
                enabled={settings.showDamageNumbers}
                onToggle={() => updateSetting('showDamageNumbers', !settings.showDamageNumbers)}
              />
              <ToggleSetting
                label="Show FPS"
                icon="📊"
                enabled={settings.showFPS}
                onToggle={() => updateSetting('showFPS', !settings.showFPS)}
              />
            </div>
          </div>
        )}

        {/* Give Up Confirmation */}
        {showGiveUpConfirm && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="text-6xl">⚠️</div>
              <h3 className="text-2xl font-bold text-amber-400">Give Up?</h3>
              <p className="text-amber-200">
                Are you sure you want to end this run?
              </p>
              <p className="text-gray-400 text-sm">
                You'll lose all progress for this run.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowGiveUpConfirm(false)}
                className="px-6 py-3 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-lg border-2 border-stone-500 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleGiveUp}
                className="px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg border-2 border-red-500 transition-all"
              >
                Give Up
              </button>
            </div>
          </div>
        )}

        {/* Footer hint */}
        {!showSettings && !showGiveUpConfirm && (
          <div className="px-6 py-3 border-t-2 border-stone-700 bg-black/20">
            <p className="text-center text-gray-400 text-sm">
              Press <kbd className="px-2 py-1 bg-stone-700 rounded border border-stone-500 font-mono text-xs">ESC</kbd> to resume
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Rye&display=swap');
      `}</style>
    </div>
  );
}

/**
 * Stat Display Component
 */
function StatDisplay({ icon, label, value }) {
  return (
    <div className="bg-stone-800/50 rounded px-3 py-2 border border-amber-900/30">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <div className="flex-1">
          <div className="text-xs text-gray-400">{label}</div>
          <div className="text-lg font-bold text-amber-300">{value}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Menu Button Component
 */
function MenuButton({ text, icon, onClick, primary = false, danger = false, subtitle = null }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full px-6 py-4 rounded-lg font-bold text-xl border-2
        transform transition-all duration-200 hover:scale-105
        ${primary ? 'bg-gradient-to-r from-green-600 to-green-700 border-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.7)]' : ''}
        ${danger ? 'bg-gradient-to-r from-red-700 to-red-800 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.7)]' : ''}
        ${!primary && !danger ? 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-500 text-white shadow-[0_0_20px_rgba(217,119,6,0.5)] hover:shadow-[0_0_30px_rgba(217,119,6,0.7)]' : ''}
      `}
      style={{
        fontFamily: 'Rye, serif',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center justify-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 text-center">
          <div>{text}</div>
          {subtitle && (
            <div className="text-xs opacity-75 font-normal">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * Toggle Setting Component
 */
function ToggleSetting({ label, icon, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between bg-stone-800/50 rounded-lg px-4 py-3 border border-amber-900/30">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-amber-200 font-semibold">{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={`
          relative w-14 h-7 rounded-full transition-all duration-300
          ${enabled ? 'bg-green-600' : 'bg-stone-600'}
        `}
      >
        <div
          className={`
            absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300
            ${enabled ? 'left-8' : 'left-1'}
          `}
        />
      </button>
    </div>
  );
}

export default PauseMenu;
