import { useGame } from '../../context/GameContext';

export function HUD() {
  const { state } = useGame();
  const { player, wave, enemies } = state;

  const healthPercent = (player.health / player.maxHealth) * 100;

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
      {/* Left side - Health and Stats */}
      <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg border-2 border-amber-600">
        {/* Health Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white font-bold text-sm">Health</span>
            <span className="text-white text-sm">
              {Math.ceil(player.health)} / {player.maxHealth}
            </span>
          </div>
          <div className="w-48 h-6 bg-gray-800 rounded-full border-2 border-gray-600 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                healthPercent > 50
                  ? 'bg-green-500'
                  : healthPercent > 25
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-1 text-white text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Score:</span>
            <span className="font-bold text-amber-400">{player.score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Level:</span>
            <span className="font-bold text-amber-400">{player.level}</span>
          </div>
        </div>
      </div>

      {/* Right side - Wave Info */}
      <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg border-2 border-amber-600">
        <div className="text-center">
          <div className="text-gray-300 text-sm mb-1">Wave</div>
          <div className="text-3xl font-bold text-amber-400">{wave}</div>
          <div className="text-gray-300 text-xs mt-1">
            Enemies: {enemies.length}
          </div>
        </div>
      </div>
    </div>
  );
}
