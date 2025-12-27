import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';

/**
 * HUD - Western-themed in-game heads-up display
 *
 * Shows all game information with wooden/parchment aesthetic
 */
export function HUD() {
  const { state } = useGame();
  const [damageFlash, setDamageFlash] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const prevHealthRef = useRef(state.player.health);
  const prevWaveRef = useRef(state.wave);

  // Damage flash effect
  useEffect(() => {
    if (state.player.health < prevHealthRef.current) {
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 200);
    }
    prevHealthRef.current = state.player.health;
  }, [state.player.health]);

  // Wave announcement
  useEffect(() => {
    if (state.wave > prevWaveRef.current) {
      setAnnouncement({
        type: 'wave',
        text: `WAVE ${state.wave}`,
        subtext: 'Prepare yourself!',
      });
      setTimeout(() => setAnnouncement(null), 3000);
    }
    prevWaveRef.current = state.wave;
  }, [state.wave]);

  // Calculate percentages
  const healthPercent = (state.player.health / state.player.maxHealth) * 100;
  const xpNeeded = Math.floor(100 * Math.pow(1.5, state.player.level - 1));
  const xpPercent = (state.player.xp / xpNeeded) * 100;

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get boss if active
  const activeBoss = state.enemies.find(e => e.isBoss);

  return (
    <div className="fixed inset-0 pointer-events-none select-none">
      {/* Damage flash overlay */}
      {damageFlash && (
        <div className="absolute inset-0 bg-red-600 opacity-30 animate-flash pointer-events-none" />
      )}

      {/* TOP LEFT - Player Stats */}
      <div className="absolute top-4 left-4 space-y-3 pointer-events-auto">
        {/* Character Portrait */}
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-full border-4 border-amber-600 bg-gradient-to-br from-amber-900 to-amber-950 shadow-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-3xl">
              {state.player.character?.icon || '🤠'}
            </div>
            {/* Rope decoration */}
            <div className="absolute inset-0 rounded-full border-2 border-amber-700/50"
                 style={{ borderStyle: 'dashed' }} />
          </div>

          <div className="text-left">
            <div className="text-sm font-bold text-amber-400 tracking-wide"
                 style={{ fontFamily: '"Rye", serif', textShadow: '1px 1px 2px #000' }}>
              {state.player.character?.name || 'Drifter'}
            </div>
            <div className="text-xs text-amber-200/80">
              Level {state.player.level}
            </div>
          </div>
        </div>

        {/* Health Bar */}
        <div className="bg-gradient-to-b from-amber-950 to-stone-900 p-3 rounded-lg border-2 border-amber-700 shadow-xl min-w-[280px]"
             style={{ backgroundImage: 'linear-gradient(135deg, rgba(120,53,15,0.3) 25%, transparent 25%, transparent 50%, rgba(120,53,15,0.3) 50%, rgba(120,53,15,0.3) 75%, transparent 75%)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">❤️</span>
            <span className="text-sm font-bold text-red-400" style={{ fontFamily: '"Rye", serif' }}>
              HEALTH
            </span>
          </div>
          <div className="relative h-8 bg-stone-950 rounded border-2 border-stone-700 overflow-hidden">
            {/* Health fill */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-700 to-red-500 transition-all duration-300 ease-out"
              style={{
                width: `${Math.max(0, healthPercent)}%`,
                boxShadow: healthPercent < 30 ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
              }}
            />
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            {/* HP text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                    style={{ fontFamily: '"Rye", serif' }}>
                {Math.max(0, Math.floor(state.player.health))} / {state.player.maxHealth}
              </span>
            </div>
            {/* Pulse effect when low HP */}
            {healthPercent < 30 && (
              <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse" />
            )}
          </div>
        </div>

        {/* XP Bar */}
        <div className="bg-gradient-to-b from-amber-950 to-stone-900 p-3 rounded-lg border-2 border-amber-700 shadow-xl min-w-[280px]"
             style={{ backgroundImage: 'linear-gradient(135deg, rgba(120,53,15,0.3) 25%, transparent 25%, transparent 50%, rgba(120,53,15,0.3) 50%, rgba(120,53,15,0.3) 75%, transparent 75%)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⭐</span>
            <span className="text-sm font-bold text-amber-400" style={{ fontFamily: '"Rye", serif' }}>
              EXPERIENCE
            </span>
          </div>
          <div className="relative h-6 bg-stone-950 rounded border-2 border-stone-700 overflow-hidden">
            {/* XP fill */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-600 to-amber-400 transition-all duration-500 ease-out"
              style={{
                width: `${Math.max(0, xpPercent)}%`,
                boxShadow: '0 0 8px rgba(251, 191, 36, 0.5)'
              }}
            />
            {/* Sparkle effect when near level up */}
            {xpPercent > 80 && (
              <div className="absolute inset-0 bg-yellow-300 opacity-10 animate-pulse" />
            )}
            {/* XP text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-xs drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                {Math.floor(state.player.xp)} / {xpNeeded}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP RIGHT - Game Stats */}
      <div className="absolute top-4 right-4 space-y-3 pointer-events-auto text-right">
        {/* Wave Number */}
        <div className="bg-gradient-to-b from-amber-950 to-stone-900 p-4 rounded-lg border-4 border-amber-600 shadow-xl"
             style={{ backgroundImage: 'linear-gradient(135deg, rgba(120,53,15,0.3) 25%, transparent 25%, transparent 50%, rgba(120,53,15,0.3) 50%, rgba(120,53,15,0.3) 75%, transparent 75%)' }}>
          <div className="text-xs text-amber-400 mb-1" style={{ fontFamily: '"Rye", serif' }}>
            WAVE
          </div>
          <div className="text-4xl font-bold text-amber-500 leading-none"
               style={{
                 fontFamily: '"Rye", serif',
                 textShadow: '0 0 10px rgba(251, 191, 36, 0.5), 2px 2px 4px #000'
               }}>
            {state.wave}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="bg-gradient-to-b from-amber-950 to-stone-900 p-3 rounded-lg border-2 border-amber-700 shadow-xl min-w-[200px]"
             style={{ backgroundImage: 'linear-gradient(135deg, rgba(120,53,15,0.3) 25%, transparent 25%, transparent 50%, rgba(120,53,15,0.3) 50%, rgba(120,53,15,0.3) 75%, transparent 75%)' }}>
          {/* Kill Count */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-amber-800">
            <div className="flex items-center gap-2">
              <span className="text-lg">💀</span>
              <span className="text-xs text-amber-400 font-bold" style={{ fontFamily: '"Rye", serif' }}>
                KILLS
              </span>
            </div>
            <span className="text-lg font-bold text-white" style={{ fontFamily: '"Rye", serif' }}>
              {state.kills}
            </span>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-amber-800">
            <div className="flex items-center gap-2">
              <span className="text-lg">⏱️</span>
              <span className="text-xs text-amber-400 font-bold" style={{ fontFamily: '"Rye", serif' }}>
                TIME
              </span>
            </div>
            <span className="text-lg font-bold text-white font-mono">
              {formatTime(state.gameTime)}
            </span>
          </div>

          {/* Gold Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <span className="text-xs text-amber-400 font-bold" style={{ fontFamily: '"Rye", serif' }}>
                GOLD
              </span>
            </div>
            <span className="text-lg font-bold text-yellow-400" style={{ fontFamily: '"Rye", serif' }}>
              {state.gold || 0}
            </span>
          </div>
        </div>
      </div>

      {/* TOP CENTER - Boss Health (when active) */}
      {activeBoss && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 animate-fade-in pointer-events-auto">
          <div className="bg-gradient-to-b from-red-950 to-stone-900 p-4 rounded-lg border-4 border-red-700 shadow-2xl min-w-[400px]"
               style={{ backgroundImage: 'linear-gradient(135deg, rgba(139,0,0,0.3) 25%, transparent 25%, transparent 50%, rgba(139,0,0,0.3) 50%, rgba(139,0,0,0.3) 75%, transparent 75%)' }}>
            {/* Boss name and phase */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👹</span>
                <div>
                  <div className="text-lg font-bold text-red-400"
                       style={{
                         fontFamily: '"Rye", serif',
                         textShadow: '0 0 10px rgba(220, 38, 38, 0.5)'
                       }}>
                    {activeBoss.name || 'BOSS'}
                  </div>
                  {activeBoss.phase && (
                    <div className="text-xs text-red-300">
                      Phase {activeBoss.phase}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-red-300 font-bold">
                {Math.floor((activeBoss.hp / activeBoss.maxHp) * 100)}%
              </div>
            </div>

            {/* Boss health bar */}
            <div className="relative h-10 bg-stone-950 rounded-lg border-3 border-red-900 overflow-hidden">
              {/* Health fill */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-800 via-red-600 to-red-500 transition-all duration-300"
                style={{
                  width: `${Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100)}%`,
                  boxShadow: '0 0 20px rgba(220, 38, 38, 0.7)'
                }}
              />
              {/* Animated shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              {/* HP text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                      style={{ fontFamily: '"Rye", serif' }}>
                  {Math.max(0, Math.floor(activeBoss.hp))} / {activeBoss.maxHp}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM CENTER - Weapon Slots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex items-center gap-3 bg-gradient-to-b from-amber-950 to-stone-900 p-3 rounded-lg border-2 border-amber-700 shadow-xl"
             style={{ backgroundImage: 'linear-gradient(135deg, rgba(120,53,15,0.3) 25%, transparent 25%, transparent 50%, rgba(120,53,15,0.3) 50%, rgba(120,53,15,0.3) 75%, transparent 75%)' }}>
          {state.player.weapons.map((weapon, index) => (
            <WeaponSlot
              key={weapon.id}
              weapon={weapon}
              isActive={index === state.player.activeWeaponIndex}
            />
          ))}
          {/* Empty slots */}
          {[...Array(Math.max(0, 6 - state.player.weapons.length))].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-16 h-16 bg-stone-900/50 rounded-lg border-2 border-stone-700 border-dashed flex items-center justify-center"
            >
              <span className="text-2xl text-stone-600">?</span>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER - Announcements */}
      {announcement && (
        <AnnouncementBanner
          type={announcement.type}
          text={announcement.text}
          subtext={announcement.subtext}
        />
      )}

      {/* Custom styles */}
      <style jsx>{`
        @keyframes flash {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-flash {
          animation: flash 0.2s ease-out;
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * Individual weapon slot component
 */
function WeaponSlot({ weapon, isActive }) {
  const cooldownPercent = weapon.cooldownProgress
    ? (weapon.cooldownProgress / weapon.cooldown) * 100
    : 0;

  return (
    <div className={`
      relative w-16 h-16 rounded-lg border-3 transition-all duration-200
      ${isActive
        ? 'border-amber-400 bg-amber-900/80 shadow-lg shadow-amber-500/50 scale-110'
        : 'border-amber-700 bg-stone-900/80 hover:border-amber-500'
      }
    `}>
      {/* Weapon icon */}
      <div className="absolute inset-0 flex items-center justify-center text-2xl">
        {weapon.icon || '🔫'}
      </div>

      {/* Level badge */}
      {weapon.level > 1 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-amber-800 flex items-center justify-center">
          <span className="text-xs font-bold text-white">
            {weapon.level}
          </span>
        </div>
      )}

      {/* Cooldown overlay */}
      {cooldownPercent > 0 && cooldownPercent < 100 && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 bg-stone-950/80 transition-all duration-100"
            style={{ height: `${100 - cooldownPercent}%` }}
          />
        </div>
      )}

      {/* Active indicator */}
      {isActive && (
        <div className="absolute -inset-1 rounded-lg border-2 border-amber-300 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}

/**
 * Announcement banner component
 */
function AnnouncementBanner({ type, text, subtext }) {
  const getColorClass = () => {
    switch (type) {
      case 'wave':
        return 'from-amber-600 to-amber-800 border-amber-500';
      case 'boss':
        return 'from-red-700 to-red-900 border-red-600';
      case 'achievement':
        return 'from-green-600 to-green-800 border-green-500';
      default:
        return 'from-amber-600 to-amber-800 border-amber-500';
    }
  };

  return (
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-announcement pointer-events-none">
      <div className={`
        bg-gradient-to-r ${getColorClass()}
        p-6 px-12 rounded-lg border-4 shadow-2xl
      `}
           style={{
             backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.3) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3) 75%, transparent 75%)',
             minWidth: '400px'
           }}>
        {/* Rope decoration */}
        <div className="absolute -top-2 left-8 right-8 h-1 bg-amber-800 rounded-full" />
        <div className="absolute -bottom-2 left-8 right-8 h-1 bg-amber-800 rounded-full" />

        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-2"
               style={{
                 fontFamily: '"Rye", serif',
                 textShadow: '0 0 20px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6)',
                 letterSpacing: '0.1em'
               }}>
            {text}
          </div>
          {subtext && (
            <div className="text-lg text-white/90"
                 style={{
                   fontFamily: '"Rye", serif',
                   textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                 }}>
              {subtext}
            </div>
          )}
        </div>

        {/* Dust particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-300/60 rounded-full animate-float"
            style={{
              left: `${20 + i * 12}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + Math.random()}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes announcement {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          10% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
          15% {
            transform: translate(-50%, -50%) scale(1);
          }
          85% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }
        .animate-announcement {
          animation: announcement 3s ease-out;
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
