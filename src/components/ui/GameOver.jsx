import { useGame } from '../../context/GameContext';

export function GameOver() {
  const { state, resetGame } = useGame();
  const { player } = state;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-red-900 via-stone-900 to-black">
      <div className="text-center space-y-8 p-8">
        {/* Game Over Title */}
        <div className="space-y-4">
          <h1 className="text-7xl font-bold text-red-500 tracking-wider drop-shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse">
            GAME OVER
          </h1>
          <p className="text-xl text-red-200 italic">The outlaws got you...</p>
        </div>

        {/* Stats */}
        <div className="bg-black/70 backdrop-blur-sm p-8 rounded-lg border-4 border-red-600 space-y-4">
          <h2 className="text-3xl font-bold text-amber-400 mb-6">Final Stats</h2>

          <div className="space-y-3 text-white text-xl">
            <div className="flex justify-between gap-12">
              <span className="text-gray-300">Final Score:</span>
              <span className="font-bold text-amber-400">{player.score}</span>
            </div>
            <div className="flex justify-between gap-12">
              <span className="text-gray-300">Wave Reached:</span>
              <span className="font-bold text-amber-400">{player.level}</span>
            </div>
            <div className="flex justify-between gap-12">
              <span className="text-gray-300">Upgrades:</span>
              <span className="font-bold text-amber-400">{player.upgrades?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Try Again Button */}
        <button
          onClick={resetGame}
          className="px-12 py-4 bg-red-600 hover:bg-red-500 text-white text-2xl font-bold rounded-lg
                     transform transition-all duration-200 hover:scale-110
                     shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]
                     border-4 border-red-400"
        >
          TRY AGAIN
        </button>

        {/* Tip */}
        <p className="text-gray-400 text-sm mt-8 italic">
          "Keep moving and aim true, partner."
        </p>
      </div>
    </div>
  );
}
