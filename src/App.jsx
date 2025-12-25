import { GameProvider, useGame, GAME_STATES } from './context/GameContext';
import { GameCanvas } from './components/game/GameCanvas';
import { Menu } from './components/ui/Menu';
import { GameOver } from './components/ui/GameOver';
import { HUD } from './components/ui/HUD';

function GameContent() {
  const { state } = useGame();

  return (
    <div className="w-full min-h-screen bg-stone-900 flex items-center justify-center">
      {state.gameState === GAME_STATES.MENU && <Menu />}

      {state.gameState === GAME_STATES.PLAYING && (
        <div className="relative">
          <HUD />
          <GameCanvas />
        </div>
      )}

      {state.gameState === GAME_STATES.GAME_OVER && <GameOver />}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
