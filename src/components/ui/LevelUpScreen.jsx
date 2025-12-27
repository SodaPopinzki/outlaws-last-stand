import React, { useState, useEffect, useMemo } from 'react';
import { useGame, GAME_STATUS, ACTIONS } from '../../context/GameContext';
import { LevelUpSystem, getRarityColor, getRarityBorderStyle } from '../../systems/LevelUpSystem';

/**
 * LevelUpScreen - Western-themed upgrade selection overlay
 *
 * Displays 4 upgrade options when player levels up
 * Pauses game and shows animated cards with western styling
 */
export default function LevelUpScreen() {
  const { state, dispatch } = useGame();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showParticles, setShowParticles] = useState(false);

  // Create LevelUpSystem instance and generate upgrade options
  const levelUpSystem = useMemo(() => new LevelUpSystem(), []);
  const upgradeOptions = useMemo(
    () => levelUpSystem.generateUpgradeOptions(state.player, state.wave),
    [state.player, state.wave, levelUpSystem]
  );

  useEffect(() => {
    // Show entry animation
    setShowParticles(true);
    const timer = setTimeout(() => setShowParticles(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (upgrade, index) => {
    setSelectedCard(index);

    // Play selection animation then apply upgrade
    setTimeout(() => {
      // Apply the upgrade using the LevelUpSystem
      levelUpSystem.applyUpgrade(state.player, upgrade, dispatch);

      // Return to playing
      dispatch({ type: ACTIONS.SET_GAME_STATUS, payload: GAME_STATUS.PLAYING });
      setSelectedCard(null);
    }, 300);
  };

  const getCardStyle = (index, rarity) => {
    const baseStyle = {
      transform: hoveredCard === index ? 'translateY(-10px) scale(1.05)' :
                 selectedCard === index ? 'scale(0.95)' : 'translateY(0) scale(1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
    };

    const rarityStyle = getRarityBorderStyle(rarity);

    return {
      ...baseStyle,
      ...rarityStyle,
      boxShadow: hoveredCard === index
        ? `0 10px 30px rgba(0,0,0,0.3), 0 0 20px ${getRarityColor(rarity)}`
        : selectedCard === index
        ? `0 5px 15px rgba(0,0,0,0.2)`
        : `0 4px 8px rgba(0,0,0,0.2)`,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Dust particles animation */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/50 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main container */}
      <div className="w-full max-w-6xl px-4 animate-fade-in">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-amber-400 mb-2 drop-shadow-lg animate-pulse-slow"
              style={{
                textShadow: '0 0 10px rgba(251, 191, 36, 0.5), 4px 4px 8px rgba(0,0,0,0.5)',
                fontFamily: '"Rye", serif',
              }}>
            ⭐ LEVEL UP! ⭐
          </h1>
          <p className="text-xl text-amber-200" style={{ fontFamily: '"Rye", serif' }}>
            Level {state.player.level} - Choose Your Power
          </p>
        </div>

        {/* Upgrade cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {upgradeOptions.map((upgrade, index) => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              index={index}
              isHovered={hoveredCard === index}
              isSelected={selectedCard === index}
              onHover={() => setHoveredCard(index)}
              onLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick(upgrade, index)}
              style={getCardStyle(index, upgrade.rarity)}
            />
          ))}
        </div>

        {/* Helper text */}
        <div className="text-center mt-6 text-amber-200/70 text-sm">
          Click a card to select • Hover to preview
        </div>
      </div>
    </div>
  );
}

/**
 * Individual upgrade card component
 */
function UpgradeCard({ upgrade, index, isHovered, isSelected, onHover, onLeave, onClick, style }) {
  const isEvolution = upgrade.type === 'weaponEvolution';
  const isNewWeapon = upgrade.type === 'newWeapon';
  const isWeaponUpgrade = upgrade.type === 'weaponUpgrade';
  const isStatUpgrade = upgrade.type === 'statUpgrade';

  return (
    <div
      className="relative bg-gradient-to-b from-amber-900 to-amber-950 rounded-lg p-6 border-4"
      style={style}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Rope border decoration */}
      <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-700 rounded-full" />
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-700 rounded-full" />
      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-700 rounded-full" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-700 rounded-full" />

      {/* Special badges */}
      {isEvolution && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-amber-950 px-4 py-1 rounded-full text-xs font-bold animate-pulse-slow border-2 border-yellow-300"
             style={{ boxShadow: '0 0 20px rgba(251, 191, 36, 0.8)' }}>
          ✨ EVOLUTION ✨
        </div>
      )}

      {isNewWeapon && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-green-400">
          NEW!
        </div>
      )}

      {/* Icon */}
      <div className="text-6xl text-center mb-4 transform transition-transform"
           style={{
             transform: isHovered ? 'scale(1.2) rotate(5deg)' : 'scale(1)',
             filter: isEvolution ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' : 'none'
           }}>
        {upgrade.icon}
      </div>

      {/* Name */}
      <h3 className="text-xl font-bold text-center mb-2 text-amber-100"
          style={{ fontFamily: '"Rye", serif' }}>
        {upgrade.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-amber-200/80 text-center mb-3 min-h-[3rem] flex items-center justify-center">
        {upgrade.description}
      </p>

      {/* Stack info for stat upgrades */}
      {isStatUpgrade && upgrade.stackInfo && (
        <div className="text-center mb-2">
          <span className="inline-block bg-amber-800/50 px-3 py-1 rounded-full text-xs text-amber-200">
            Level {upgrade.stackInfo}
          </span>
        </div>
      )}

      {/* Level progression for weapon upgrades */}
      {isWeaponUpgrade && (
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-amber-400 font-bold">Lv {upgrade.currentLevel || 1}</span>
          <span className="text-amber-600">→</span>
          <span className="text-green-400 font-bold">Lv {(upgrade.currentLevel || 1) + 1}</span>
        </div>
      )}

      {/* Rarity indicator */}
      <div className="text-center mt-3 pt-3 border-t border-amber-700/50">
        <span className="text-xs uppercase tracking-wider"
              style={{ color: getRarityColor(upgrade.rarity) }}>
          {upgrade.rarity}
        </span>
      </div>

      {/* Hover glow effect */}
      {isHovered && (
        <div className="absolute inset-0 rounded-lg pointer-events-none"
             style={{
               background: `radial-gradient(circle at center, ${getRarityColor(upgrade.rarity)}20, transparent)`,
             }}
        />
      )}

      {/* Selection flash */}
      {isSelected && (
        <div className="absolute inset-0 bg-white/30 rounded-lg animate-flash" />
      )}
    </div>
  );
}

/* Tailwind-compatible animations */
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
  }

  @keyframes pulse-slow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  @keyframes fade-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes flash {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }

  .animate-float {
    animation: float linear infinite;
  }

  .animate-pulse-slow {
    animation: pulse-slow 2s ease-in-out infinite;
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }

  .animate-flash {
    animation: flash 0.3s ease-out;
  }
`;

// Inject styles into document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
