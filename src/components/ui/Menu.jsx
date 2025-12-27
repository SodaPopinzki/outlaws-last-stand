import { useState, useMemo } from 'react';
import { useGame, GAME_STATUS } from '../../context/GameContext';
import MetaUpgradeShop from './MetaUpgradeShop';
import { MetaProgression } from '../../systems/MetaProgression';

export function Menu() {
  const { setGameStatus } = useGame();
  const [showUpgradeShop, setShowUpgradeShop] = useState(false);

  // Initialize MetaProgression system (persists across app sessions)
  const metaProgression = useMemo(() => new MetaProgression(), []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-stone-900">
      <div className="text-center space-y-8 p-8">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-7xl font-bold text-amber-400 tracking-wider drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
            OUTLAW'S
          </h1>
          <h1 className="text-7xl font-bold text-amber-400 tracking-wider drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
            LAST STAND
          </h1>
          <p className="text-xl text-amber-200 italic">Survive the endless waves</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setGameStatus(GAME_STATUS.CHARACTER_SELECT)}
            className="px-12 py-4 bg-amber-600 hover:bg-amber-500 text-white text-2xl font-bold rounded-lg
                       transform transition-all duration-200 hover:scale-110
                       shadow-[0_0_20px_rgba(251,191,36,0.5)] hover:shadow-[0_0_30px_rgba(251,191,36,0.8)]
                       border-4 border-amber-400"
          >
            START GAME
          </button>

          <button
            onClick={() => setShowUpgradeShop(true)}
            className="px-12 py-4 bg-emerald-700 hover:bg-emerald-600 text-white text-xl font-bold rounded-lg
                       transform transition-all duration-200 hover:scale-110
                       shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.8)]
                       border-4 border-emerald-500"
          >
            🏪 UPGRADES
          </button>
        </div>

        {/* Controls */}
        <div className="mt-12 bg-black/50 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
          <h3 className="text-amber-400 text-xl font-bold mb-4">Controls</h3>
          <div className="text-white space-y-2 text-left">
            <div className="flex justify-between gap-8">
              <span className="text-gray-300">Move:</span>
              <span className="font-mono">WASD / Arrow Keys</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-gray-300">Aim:</span>
              <span className="font-mono">Mouse</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-gray-300">Shoot:</span>
              <span className="font-mono">Left Click</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-gray-300">Pause:</span>
              <span className="font-mono">ESC</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-amber-200/50 text-sm mt-8">
          Made with React + Canvas
        </p>
      </div>

      {/* Meta Upgrade Shop Modal */}
      {showUpgradeShop && (
        <MetaUpgradeShop
          metaProgression={metaProgression}
          onClose={() => setShowUpgradeShop(false)}
          onPurchase={(upgradeType, id) => {
            // Purchase handled by MetaUpgradeShop component
            console.log('Purchased:', upgradeType, id);
          }}
        />
      )}
    </div>
  );
}
