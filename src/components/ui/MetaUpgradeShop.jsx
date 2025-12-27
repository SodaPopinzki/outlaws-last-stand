import React, { useState, useEffect } from 'react';
import {
  PERMANENT_STATS,
  CURRENCIES,
  getCurrencyIcon,
  formatCurrency
} from '../../systems/MetaProgression';

/**
 * MetaUpgradeShop - Between-runs permanent upgrade shop
 *
 * Accessed from main menu for purchasing permanent upgrades
 * Uses Gold Nuggets to buy stat boosts
 */
export default function MetaUpgradeShop({
  metaProgression,
  onClose,
  onPurchase
}) {
  const [selectedCategory, setSelectedCategory] = useState('stats');
  const [purchasingUpgrade, setPurchasingUpgrade] = useState(null);
  const [coinAnimation, setCoinAnimation] = useState(null);

  const goldNuggets = metaProgression?.getCurrency(CURRENCIES.GOLD_NUGGETS) || 0;
  const bountyStars = metaProgression?.getCurrency(CURRENCIES.BOUNTY_STARS) || 0;

  const categories = [
    { id: 'stats', name: 'Stat Upgrades', icon: '📈' },
    { id: 'weapons', name: 'Weapon Unlocks', icon: '🔫' },
    { id: 'characters', name: 'Characters', icon: '🤠' },
  ];

  const handlePurchase = (statId) => {
    if (!metaProgression) return;

    const cost = metaProgression.getUpgradeCost(statId);
    if (goldNuggets >= cost) {
      // Start purchase animation
      setPurchasingUpgrade(statId);
      setCoinAnimation({ from: 'upgrade', to: 'currency' });

      setTimeout(() => {
        const success = metaProgression.purchaseUpgrade(statId);
        if (success && onPurchase) {
          onPurchase(statId);
        }

        setPurchasingUpgrade(null);
        setCoinAnimation(null);
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Coin animation particles */}
      {coinAnimation && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-coin-fly"
              style={{
                left: '50%',
                top: '50%',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              💰
            </div>
          ))}
        </div>
      )}

      {/* Main container */}
      <div className="w-full max-w-7xl h-5/6 bg-gradient-to-b from-amber-950 to-stone-950 rounded-xl border-4 border-amber-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 px-8 py-6 border-b-4 border-amber-700 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-amber-100"
                style={{ fontFamily: '"Rye", serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              🏪 Gunslinger's General Store
            </h1>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-red-800 hover:bg-red-700 text-white rounded-lg font-bold transition-all hover:scale-105 border-2 border-red-600"
            >
              ✕ Close
            </button>
          </div>

          {/* Currency display */}
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2 bg-amber-950/50 px-4 py-2 rounded-lg border-2 border-amber-700">
              <span className="text-2xl">{getCurrencyIcon(CURRENCIES.GOLD_NUGGETS)}</span>
              <span className="text-xl font-bold text-amber-200">
                {formatCurrency(goldNuggets)}
              </span>
              <span className="text-sm text-amber-400">Gold Nuggets</span>
            </div>

            <div className="flex items-center gap-2 bg-amber-950/50 px-4 py-2 rounded-lg border-2 border-amber-700">
              <span className="text-2xl">{getCurrencyIcon(CURRENCIES.BOUNTY_STARS)}</span>
              <span className="text-xl font-bold text-amber-200">
                {bountyStars}
              </span>
              <span className="text-sm text-amber-400">Bounty Stars</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Categories */}
          <div className="w-64 bg-amber-900/30 border-r-4 border-amber-700 p-4 overflow-y-auto">
            <h2 className="text-lg font-bold text-amber-200 mb-4 uppercase"
                style={{ fontFamily: '"Rye", serif' }}>
              Categories
            </h2>

            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all
                    ${selectedCategory === category.id
                      ? 'bg-amber-700 text-white border-2 border-amber-500'
                      : 'bg-amber-950/50 text-amber-300 hover:bg-amber-900/50 border-2 border-amber-800'
                    }`}
                >
                  <span className="text-xl mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right panel - Upgrades */}
          <div className="flex-1 p-8 overflow-y-auto">
            {selectedCategory === 'stats' && (
              <StatUpgradesPanel
                metaProgression={metaProgression}
                goldNuggets={goldNuggets}
                purchasingUpgrade={purchasingUpgrade}
                onPurchase={handlePurchase}
              />
            )}

            {selectedCategory === 'weapons' && (
              <WeaponUnlocksPanel metaProgression={metaProgression} />
            )}

            {selectedCategory === 'characters' && (
              <CharacterUnlocksPanel
                metaProgression={metaProgression}
                bountyStars={bountyStars}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Stat upgrades panel
 */
function StatUpgradesPanel({ metaProgression, goldNuggets, purchasingUpgrade, onPurchase }) {
  const stats = Object.values(PERMANENT_STATS);

  return (
    <div>
      <h2 className="text-2xl font-bold text-amber-200 mb-6"
          style={{ fontFamily: '"Rye", serif' }}>
        📈 Permanent Stat Upgrades
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.map((stat) => {
          const currentLevel = metaProgression?.getUpgradeLevel(stat.id) || 0;
          const cost = metaProgression?.getUpgradeCost(stat.id) || 0;
          const isMaxLevel = currentLevel >= stat.maxLevel;
          const canAfford = goldNuggets >= cost;
          const isPurchasing = purchasingUpgrade === stat.id;

          return (
            <div
              key={stat.id}
              className={`bg-gradient-to-br from-amber-900/50 to-stone-900/50 rounded-lg p-6 border-2 transition-all
                ${isMaxLevel ? 'border-green-600 opacity-75' : 'border-amber-700 hover:border-amber-500'}
                ${isPurchasing ? 'scale-95 opacity-75' : 'scale-100'}
              `}
            >
              {/* Icon and title */}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">{stat.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-100">{stat.name}</h3>
                  <p className="text-sm text-amber-300">{stat.description}</p>
                </div>
              </div>

              {/* Level progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-amber-400">
                    Level {currentLevel} / {stat.maxLevel}
                  </span>
                  <span className="text-sm text-amber-400">
                    {Math.round((currentLevel / stat.maxLevel) * 100)}%
                  </span>
                </div>

                <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
                    style={{ width: `${(currentLevel / stat.maxLevel) * 100}%` }}
                  />
                </div>
              </div>

              {/* Current bonus */}
              {currentLevel > 0 && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
                  <div className="text-sm text-green-300">
                    Current Bonus: <span className="font-bold text-green-200">
                      {stat.value > 1 || stat.id === 'starting_level' || stat.id === 'reroll' || stat.id === 'revival'
                        ? `+${stat.value * currentLevel}`
                        : `+${(stat.value * currentLevel * 100).toFixed(0)}%`
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Purchase button */}
              {!isMaxLevel ? (
                <button
                  onClick={() => onPurchase(stat.id)}
                  disabled={!canAfford || isPurchasing}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition-all border-2
                    ${canAfford
                      ? 'bg-amber-700 hover:bg-amber-600 text-white border-amber-500 hover:scale-105'
                      : 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'
                    }
                    ${isPurchasing ? 'opacity-50 cursor-wait' : ''}
                  `}
                >
                  {isPurchasing ? (
                    'Purchasing...'
                  ) : (
                    <>
                      {getCurrencyIcon(CURRENCIES.GOLD_NUGGETS)} {formatCurrency(cost)} Gold
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full py-3 bg-green-800 text-green-200 rounded-lg font-bold text-center border-2 border-green-600">
                  ✓ MAX LEVEL
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Weapon unlocks panel
 */
function WeaponUnlocksPanel({ metaProgression }) {
  const unlockedWeapons = metaProgression?.getUnlockedWeapons() || [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-amber-200 mb-6"
          style={{ fontFamily: '"Rye", serif' }}>
        🔫 Unlocked Weapons
      </h2>

      <div className="bg-amber-900/30 rounded-lg p-6 border-2 border-amber-700 mb-6">
        <p className="text-amber-200">
          Weapons are unlocked by finding them during a run. Once unlocked, you can start future runs with any weapon you've discovered!
        </p>
      </div>

      {unlockedWeapons.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {unlockedWeapons.map((weaponId) => (
            <div
              key={weaponId}
              className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-lg p-4 border-2 border-green-600 text-center"
            >
              <div className="text-4xl mb-2">🔫</div>
              <div className="text-sm font-semibold text-green-200">
                {weaponId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className="text-xs text-green-400 mt-1">✓ Unlocked</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-amber-400">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-xl">No weapons unlocked yet!</p>
          <p className="text-sm mt-2">Find weapons during runs to unlock them permanently.</p>
        </div>
      )}
    </div>
  );
}

/**
 * Character unlocks panel
 */
function CharacterUnlocksPanel({ metaProgression, bountyStars }) {
  const characters = [
    { id: 'drifter', name: 'The Drifter', icon: '🤠', cost: 0, description: 'Starting character' },
    { id: 'outlaw', name: 'The Outlaw', icon: '🔫', cost: 5, description: '+20% XP, Fast speed' },
    { id: 'marshal', name: 'The Marshal', icon: '⭐', cost: 10, description: 'High HP, Damage reduction' },
    { id: 'prospector', name: 'The Prospector', icon: '⛏️', cost: 15, description: 'Gold drops, Wide pickup' },
    { id: 'shaman', name: 'The Shaman', icon: '🪶', cost: 20, description: 'Poison boost, Life steal' },
    { id: 'cavalry', name: 'The Cavalry', icon: '🐎', cost: 25, description: 'Very fast, Low cooldowns' },
    { id: 'gunslinger', name: 'The Gunslinger', icon: '🎯', cost: 30, description: 'High fire rate, Glass cannon' },
    { id: 'hangman', name: 'The Hangman', icon: '🪢', cost: 35, description: 'Bonus vs slowed enemies' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-amber-200 mb-6"
          style={{ fontFamily: '"Rye", serif' }}>
        🤠 Character Unlocks
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {characters.map((character) => {
          const isUnlocked = metaProgression?.isCharacterUnlocked(character.id) || character.cost === 0;
          const canAfford = bountyStars >= character.cost;

          return (
            <div
              key={character.id}
              className={`bg-gradient-to-br from-amber-900/50 to-stone-900/50 rounded-lg p-6 border-2 transition-all
                ${isUnlocked ? 'border-green-600' : 'border-amber-700 hover:border-amber-500'}
              `}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">{character.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-100">{character.name}</h3>
                  <p className="text-sm text-amber-300">{character.description}</p>
                </div>
              </div>

              {isUnlocked ? (
                <div className="w-full py-3 bg-green-800 text-green-200 rounded-lg font-bold text-center border-2 border-green-600">
                  ✓ UNLOCKED
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (canAfford) {
                      metaProgression?.unlockCharacter(character.id, character.cost);
                    }
                  }}
                  disabled={!canAfford}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition-all border-2
                    ${canAfford
                      ? 'bg-purple-700 hover:bg-purple-600 text-white border-purple-500 hover:scale-105'
                      : 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed'
                    }
                  `}
                >
                  {getCurrencyIcon(CURRENCIES.BOUNTY_STARS)} {character.cost} Stars
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Coin animation styles */
const styles = `
  @keyframes coin-fly {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(calc(var(--tx, 0) * 1px), calc(var(--ty, -300) * 1px)) scale(0.3);
      opacity: 0;
    }
  }

  .animate-coin-fly {
    animation: coin-fly 0.6s ease-out forwards;
    --tx: calc((Math.random() - 0.5) * 200);
    --ty: -300;
  }
`;

// Inject styles into document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
