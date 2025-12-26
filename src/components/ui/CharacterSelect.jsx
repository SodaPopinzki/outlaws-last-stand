import { useState, useEffect } from 'react';
import { useGame, GAME_STATUS } from '../../context/GameContext';
import {
  getAllCharacters,
  getUnlockProgress,
  DEFAULT_CHARACTER,
} from '../../data/characters';
import { getWeaponById } from '../../data/weapons';

export function CharacterSelect() {
  const { setGameStatus, updatePlayer } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState(DEFAULT_CHARACTER);
  const [hoveredCharacter, setHoveredCharacter] = useState(null);
  const [particles, setParticles] = useState([]);

  const characters = getAllCharacters();

  // Generate dust particles on hover
  useEffect(() => {
    if (hoveredCharacter) {
      const interval = setInterval(() => {
        const newParticle = {
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          opacity: Math.random() * 0.5 + 0.3,
          duration: Math.random() * 2 + 1,
        };
        setParticles((prev) => [...prev.slice(-10), newParticle]);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [hoveredCharacter]);

  const handleCharacterClick = (character) => {
    if (character.isUnlocked) {
      setSelectedCharacter(character);
      // Play selection sound (placeholder)
      // playSound('character_select');
    }
  };

  const handleStartGame = () => {
    // Initialize player with selected character
    const weapon = getWeaponById(selectedCharacter.startingWeapon);
    updatePlayer({
      character: selectedCharacter,
      hp: selectedCharacter.baseStats.hp,
      maxHp: selectedCharacter.baseStats.hp,
      speed: selectedCharacter.baseStats.speed,
      weapons: [weapon],
      activeWeaponIndex: 0,
    });
    setGameStatus(GAME_STATUS.PLAYING);
  };

  const handleBack = () => {
    setGameStatus(GAME_STATUS.MENU);
  };

  const getStatBar = (value, max = 250, color = 'amber') => {
    const percentage = (value / max) * 100;
    const colorClass = {
      amber: 'bg-amber-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      red: 'bg-red-500',
    }[color];

    return (
      <div className="w-full h-3 bg-stone-800 border-2 border-amber-800 rounded overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-stone-900 to-stone-950 p-8 overflow-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-amber-400 tracking-wider mb-2 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
          CHOOSE YOUR OUTLAW
        </h1>
        <p className="text-xl text-amber-200 italic">Each fighter has a unique story...</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Character Grid - Left Side */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {characters.map((character) => {
              const isLocked = !character.isUnlocked;
              const isSelected = selectedCharacter.id === character.id;
              const isHovered = hoveredCharacter?.id === character.id;
              const progress = isLocked ? getUnlockProgress(character) : 1;

              return (
                <div
                  key={character.id}
                  className={`
                    relative aspect-square cursor-pointer transition-all duration-300
                    ${isSelected ? 'scale-105 z-10' : 'scale-100'}
                    ${isHovered && !isLocked ? 'scale-102' : ''}
                  `}
                  onClick={() => handleCharacterClick(character)}
                  onMouseEnter={() => setHoveredCharacter(character)}
                  onMouseLeave={() => setHoveredCharacter(null)}
                >
                  {/* Wooden frame background */}
                  <div
                    className={`
                    absolute inset-0
                    bg-gradient-to-br from-amber-800 via-amber-900 to-stone-900
                    border-4 ${isSelected ? 'border-amber-400' : 'border-amber-700'}
                    rounded-lg shadow-2xl
                    ${isSelected ? 'shadow-amber-500/50' : 'shadow-black/50'}
                  `}
                  >
                    {/* Wood grain effect */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="w-full h-1 bg-amber-950 mt-4" />
                      <div className="w-full h-1 bg-amber-950 mt-8" />
                      <div className="w-full h-1 bg-amber-950 mt-12" />
                    </div>

                    {/* Character representation */}
                    <div className="relative h-full flex flex-col items-center justify-center p-4">
                      {/* Character circle/portrait */}
                      <div
                        className={`
                        w-20 h-20 rounded-full mb-2
                        border-4 ${isLocked ? 'border-stone-700' : 'border-amber-600'}
                        ${isLocked ? 'opacity-30' : 'opacity-100'}
                        transition-all duration-300
                      `}
                        style={{
                          backgroundColor: isLocked
                            ? '#2d2d2d'
                            : character.appearance.primaryColor,
                          boxShadow: isLocked
                            ? 'none'
                            : `0 0 20px ${character.appearance.accentColor}`,
                        }}
                      >
                        {/* Character icon/initial */}
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                          {isLocked ? '🔒' : character.name.charAt(4)}
                        </div>
                      </div>

                      {/* Character name */}
                      <h3
                        className={`
                        text-sm font-bold text-center mb-1
                        ${isLocked ? 'text-stone-500' : 'text-amber-200'}
                      `}
                      >
                        {character.name}
                      </h3>

                      {/* Lock status */}
                      {isLocked && (
                        <div className="text-center">
                          <div className="text-xs text-stone-400 mb-1">
                            {character.unlockCondition.description}
                          </div>
                          <div className="w-full h-1 bg-stone-800 rounded overflow-hidden">
                            <div
                              className="h-full bg-amber-600 transition-all duration-500"
                              style={{ width: `${progress * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Selected indicator */}
                      {isSelected && !isLocked && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full border-4 border-amber-900 flex items-center justify-center">
                          <span className="text-amber-900 text-lg">✓</span>
                        </div>
                      )}

                      {/* Hover particles */}
                      {isHovered && !isLocked && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          {particles.slice(-5).map((particle) => (
                            <div
                              key={particle.id}
                              className="absolute w-1 h-1 bg-amber-400 rounded-full animate-float"
                              style={{
                                left: `${particle.x}%`,
                                top: `${particle.y}%`,
                                opacity: particle.opacity,
                                animation: `float ${particle.duration}s ease-out forwards`,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Character Details - Right Side */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950 border-4 border-amber-700 rounded-lg p-6 shadow-2xl sticky top-8">
            {/* Character portrait */}
            <div className="mb-6">
              <div
                className="w-32 h-32 mx-auto rounded-full border-4 border-amber-600 shadow-lg mb-4"
                style={{
                  backgroundColor: selectedCharacter.appearance.primaryColor,
                  boxShadow: `0 0 30px ${selectedCharacter.appearance.accentColor}`,
                }}
              >
                <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white">
                  {selectedCharacter.name.charAt(4)}
                </div>
              </div>

              <h2 className="text-3xl font-bold text-amber-400 text-center mb-1">
                {selectedCharacter.name}
              </h2>
              <p className="text-lg text-amber-300 text-center italic mb-2">
                {selectedCharacter.title}
              </p>
              <p className="text-sm text-amber-200/80 text-center">
                {selectedCharacter.description}
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-6">
              <div>
                <div className="flex justify-between text-sm text-amber-200 mb-1">
                  <span>Health</span>
                  <span className="font-bold">{selectedCharacter.baseStats.hp}</span>
                </div>
                {getStatBar(selectedCharacter.baseStats.hp, 150, 'red')}
              </div>

              <div>
                <div className="flex justify-between text-sm text-amber-200 mb-1">
                  <span>Speed</span>
                  <span className="font-bold">{selectedCharacter.baseStats.speed}</span>
                </div>
                {getStatBar(selectedCharacter.baseStats.speed, 250, 'blue')}
              </div>

              <div>
                <div className="flex justify-between text-sm text-amber-200 mb-1">
                  <span>Pickup Range</span>
                  <span className="font-bold">{selectedCharacter.baseStats.pickup}</span>
                </div>
                {getStatBar(selectedCharacter.baseStats.pickup, 150, 'green')}
              </div>

              <div>
                <div className="flex justify-between text-sm text-amber-200 mb-1">
                  <span>Damage</span>
                  <span className="font-bold">
                    {(selectedCharacter.baseStats.damage * 100).toFixed(0)}%
                  </span>
                </div>
                {getStatBar(selectedCharacter.baseStats.damage * 100, 150, 'amber')}
              </div>
            </div>

            {/* Starting Weapon */}
            <div className="bg-stone-950/50 border-2 border-amber-800 rounded p-3 mb-4">
              <h3 className="text-sm font-bold text-amber-400 mb-2">Starting Weapon</h3>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-700 rounded border-2 border-amber-600 flex items-center justify-center">
                  <span className="text-white text-lg">🔫</span>
                </div>
                <div>
                  <div className="text-amber-200 font-bold text-sm">
                    {getWeaponById(selectedCharacter.startingWeapon).name}
                  </div>
                  <div className="text-amber-300/60 text-xs">
                    {getWeaponById(selectedCharacter.startingWeapon).description}
                  </div>
                </div>
              </div>
            </div>

            {/* Passive Ability */}
            <div className="bg-stone-950/50 border-2 border-amber-800 rounded p-3 mb-6">
              <h3 className="text-sm font-bold text-amber-400 mb-2">Passive Ability</h3>
              <div className="text-amber-200 font-bold text-sm mb-1">
                {selectedCharacter.passive.name}
              </div>
              <div className="text-amber-300/80 text-xs">
                {selectedCharacter.passive.description}
              </div>
            </div>

            {/* Select Button - Wooden Sign Style */}
            <button
              onClick={handleStartGame}
              disabled={!selectedCharacter.isUnlocked}
              className={`
                w-full py-4 px-6 rounded-lg
                font-bold text-xl tracking-wider
                transition-all duration-300
                relative overflow-hidden
                ${
                  selectedCharacter.isUnlocked
                    ? 'bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 text-amber-100 hover:from-amber-600 hover:via-amber-700 hover:to-amber-800 shadow-lg hover:shadow-amber-500/50 border-4 border-amber-600 hover:scale-105'
                    : 'bg-stone-800 text-stone-600 border-4 border-stone-700 cursor-not-allowed'
                }
              `}
            >
              {/* Wood grain effect */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-1 bg-amber-950 mt-2" />
                <div className="w-full h-1 bg-amber-950 mt-4" />
              </div>

              <span className="relative z-10">
                {selectedCharacter.isUnlocked ? '⚡ RIDE OUT ⚡' : '🔒 LOCKED 🔒'}
              </span>
            </button>

            {/* Back Button */}
            <button
              onClick={handleBack}
              className="w-full mt-3 py-2 px-4 rounded
                bg-stone-800 hover:bg-stone-700
                text-amber-300 hover:text-amber-200
                border-2 border-stone-700 hover:border-amber-800
                transition-all duration-200 text-sm font-bold"
            >
              ← BACK TO TOWN
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
