/**
 * Save System Integration Examples
 *
 * This file demonstrates how to integrate the SaveSystem
 * into the game for persistent data management.
 */

import { SaveSystem, getSaveSystem, STORAGE_KEYS } from './SaveSystem';
import { MetaProgression } from './MetaProgression';

/**
 * EXAMPLE 1: Initialize Save System
 */
function initializeSaveSystem() {
  // Get singleton instance
  const saveSystem = getSaveSystem();

  // Check if storage is available
  if (!SaveSystem.isStorageAvailable()) {
    console.error('localStorage is not available!');
    return null;
  }

  // Load existing save data
  const saveData = saveSystem.loadGame();
  console.log('Loaded save:', saveData);

  return saveSystem;
}

/**
 * EXAMPLE 2: Load Game on Startup
 */
function loadGameOnStartup() {
  const saveSystem = getSaveSystem();
  const saveData = saveSystem.loadGame();

  // Apply settings
  applySettings(saveData.settings);

  // Initialize meta progression
  const metaProgression = new MetaProgression();
  metaProgression.goldNuggets = saveData.metaProgress.goldNuggets;
  metaProgression.bountyStars = saveData.metaProgress.bountyStars;
  metaProgression.upgrades = saveData.metaProgress.upgrades;

  // Load achievements
  metaProgression.achievements = saveData.achievements;

  // Load unlocks
  const unlockedCharacters = saveData.unlocks.characters;
  const unlockedWeapons = saveData.unlocks.weapons;

  return {
    saveData,
    metaProgression,
    unlockedCharacters,
    unlockedWeapons,
  };
}

function applySettings(settings) {
  // Apply to audio system
  if (window.audioSystem) {
    window.audioSystem.setMusicVolume(settings.musicVolume);
    window.audioSystem.setSFXVolume(settings.sfxVolume);
  }

  // Apply to performance manager
  if (window.performanceManager) {
    window.performanceManager.settings.enableScreenShake = settings.screenShake;
  }

  // Apply other settings...
  console.log('Settings applied:', settings);
}

/**
 * EXAMPLE 3: Save After Run Completion
 */
function saveAfterRun(runStats, metaProgression) {
  const saveSystem = getSaveSystem();

  // Add run statistics
  saveSystem.addRunStatistics({
    kills: runStats.kills,
    wave: runStats.wave,
    playTime: runStats.gameTime,
    died: runStats.died,
    goldEarned: runStats.goldEarned,
    xpEarned: runStats.xpCollected,
    damageDealt: runStats.damageDealt || 0,
    projectilesFired: runStats.projectilesFired || 0,
    distanceTraveled: runStats.distanceTraveled || 0,
    perfectWaves: runStats.perfectWaves || 0,
    level: runStats.playerLevel,
    bossesDefeated: runStats.bossesDefeated || [],
    evolutionsDiscovered: runStats.evolutionsDiscovered || [],
  });

  // Save meta progression
  saveSystem.saveMetaProgress({
    goldNuggets: metaProgression.goldNuggets,
    bountyStars: metaProgression.bountyStars,
    upgrades: metaProgression.getUpgradeLevels(),
  });

  // Save achievements
  saveSystem.saveAchievements(metaProgression.achievements);

  console.log('Run saved successfully');
}

/**
 * EXAMPLE 4: Save Settings Changes
 */
function saveSettingsChanges(newSettings) {
  const saveSystem = getSaveSystem();

  // Update only settings section
  saveSystem.saveSettings(newSettings);

  console.log('Settings saved:', newSettings);
}

/**
 * EXAMPLE 5: Unlock Character
 */
function unlockCharacter(characterId) {
  const saveSystem = getSaveSystem();
  const saveData = saveSystem.loadGame();

  // Add to unlocks if not already unlocked
  if (!saveData.unlocks.characters.includes(characterId)) {
    saveData.unlocks.characters.push(characterId);
    saveSystem.saveUnlocks(saveData.unlocks);
    console.log(`Character unlocked: ${characterId}`);
    return true;
  }

  return false;
}

/**
 * EXAMPLE 6: Unlock Weapon
 */
function unlockWeapon(weaponId) {
  const saveSystem = getSaveSystem();
  const saveData = saveSystem.loadGame();

  if (!saveData.unlocks.weapons.includes(weaponId)) {
    saveData.unlocks.weapons.push(weaponId);
    saveSystem.saveUnlocks(saveData.unlocks);
    console.log(`Weapon unlocked: ${weaponId}`);
    return true;
  }

  return false;
}

/**
 * EXAMPLE 7: Unlock Evolution
 */
function unlockEvolution(evolutionId) {
  const saveSystem = getSaveSystem();
  const saveData = saveSystem.loadGame();

  if (!saveData.unlocks.evolutions.includes(evolutionId)) {
    saveData.unlocks.evolutions.push(evolutionId);
    saveSystem.saveUnlocks(saveData.unlocks);
    console.log(`Evolution unlocked: ${evolutionId}`);
    return true;
  }

  return false;
}

/**
 * EXAMPLE 8: Auto-Save During Gameplay
 */
function setupAutoSave(getGameDataCallback) {
  const saveSystem = getSaveSystem();

  // Enable auto-save every 60 seconds
  saveSystem.enableAutoSave(60000, () => {
    const gameData = getGameDataCallback();
    return {
      statistics: gameData.statistics,
      metaProgress: gameData.metaProgress,
    };
  });

  console.log('Auto-save enabled');
}

function disableAutoSaveOnGameEnd() {
  const saveSystem = getSaveSystem();
  saveSystem.disableAutoSave();
  console.log('Auto-save disabled');
}

/**
 * EXAMPLE 9: Export Save for Sharing
 */
function exportSaveCode() {
  const saveSystem = getSaveSystem();
  const code = saveSystem.exportSave();

  if (code) {
    // Copy to clipboard
    navigator.clipboard.writeText(code).then(() => {
      console.log('Save code copied to clipboard!');
      alert('Save code copied to clipboard!');
    });
  }

  return code;
}

/**
 * EXAMPLE 10: Import Save from Code
 */
function importSaveFromCode(code) {
  const saveSystem = getSaveSystem();

  if (!code || code.trim() === '') {
    alert('Please enter a valid save code');
    return false;
  }

  const success = saveSystem.importSave(code);

  if (success) {
    alert('Save imported successfully! Please refresh the page.');
    // Optionally reload the page
    window.location.reload();
  } else {
    alert('Failed to import save. The code may be invalid or corrupted.');
  }

  return success;
}

/**
 * EXAMPLE 11: Reset Progress with Confirmation
 */
function resetAllProgress() {
  const confirmed = window.confirm(
    'Are you sure you want to reset ALL progress? This cannot be undone!'
  );

  if (confirmed) {
    const doubleConfirmed = window.confirm(
      'This will delete all your upgrades, achievements, and statistics. Are you ABSOLUTELY sure?'
    );

    if (doubleConfirmed) {
      const saveSystem = getSaveSystem();
      const success = saveSystem.resetProgress(true);

      if (success) {
        alert('All progress has been reset.');
        window.location.reload();
      }
    }
  }
}

/**
 * EXAMPLE 12: Display Save Info
 */
function displaySaveInfo() {
  const saveSystem = getSaveSystem();
  const info = saveSystem.getSaveInfo();

  console.log('=== Save File Info ===');
  console.log(`Version: ${info.version}`);
  console.log(`Last Save: ${info.lastSaveDate}`);
  console.log(`Total Kills: ${info.totalKills.toLocaleString()}`);
  console.log(`Total Playtime: ${SaveSystem.formatPlaytime(info.totalPlaytime)}`);
  console.log(`Total Runs: ${info.totalRuns}`);
  console.log(`Highest Wave: ${info.highestWave}`);
  console.log(`Gold Nuggets: ${info.goldNuggets}`);
  console.log(`Bounty Stars: ${info.bountyStars}`);
  console.log(`Achievements: ${info.achievementsUnlocked}`);
  console.log(`Characters: ${info.charactersUnlocked}`);
  console.log(`Weapons: ${info.weaponsUnlocked}`);

  return info;
}

/**
 * EXAMPLE 13: Check Storage Usage
 */
function checkStorageUsage() {
  const usage = SaveSystem.getStorageUsage();

  console.log('=== Storage Usage ===');
  console.log(`Total: ${usage.totalKB} KB`);
  console.log(`Percent Used: ${usage.percentUsed}%`);
  console.log('Breakdown:', usage.breakdown);

  return usage;
}

/**
 * EXAMPLE 14: React Component Integration
 */
function SaveSystemProvider({ children }) {
  const [saveSystem] = useState(() => getSaveSystem());
  const [saveData, setSaveData] = useState(null);

  useEffect(() => {
    // Load save on mount
    const data = saveSystem.loadGame();
    setSaveData(data);

    // Enable auto-save
    saveSystem.enableAutoSave(60000, () => {
      // Return current game state
      return {
        metaProgress: window.metaProgress,
        statistics: window.statistics,
      };
    });

    // Cleanup on unmount
    return () => {
      saveSystem.disableAutoSave();
    };
  }, [saveSystem]);

  const value = {
    saveSystem,
    saveData,
    reload: () => setSaveData(saveSystem.loadGame()),
  };

  return (
    <SaveSystemContext.Provider value={value}>
      {children}
    </SaveSystemContext.Provider>
  );
}

function useSaveSystem() {
  const context = useContext(SaveSystemContext);
  if (!context) {
    throw new Error('useSaveSystem must be used within SaveSystemProvider');
  }
  return context;
}

/**
 * EXAMPLE 15: Settings Panel with Save
 */
function SettingsPanel() {
  const { saveSystem } = useSaveSystem();
  const [settings, setSettings] = useState(() => {
    const data = saveSystem.loadGame();
    return data.settings;
  });

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSystem.saveSettings(newSettings);
  };

  return (
    <div>
      <h2>Settings</h2>
      <label>
        Music Volume:
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.musicVolume}
          onChange={(e) => updateSetting('musicVolume', parseFloat(e.target.value))}
        />
      </label>
      {/* More settings... */}
    </div>
  );
}

/**
 * EXAMPLE 16: Achievement Unlock with Save
 */
function unlockAchievement(achievementId, metaProgression) {
  const saveSystem = getSaveSystem();

  // Unlock in meta progression
  const unlocked = metaProgression.unlockAchievement(achievementId);

  if (unlocked) {
    // Save achievements
    saveSystem.saveAchievements(metaProgression.achievements);

    // Save updated bounty stars
    saveSystem.saveMetaProgress({
      goldNuggets: metaProgression.goldNuggets,
      bountyStars: metaProgression.bountyStars,
      upgrades: metaProgression.getUpgradeLevels(),
    });

    console.log(`Achievement unlocked: ${achievementId}`);
  }

  return unlocked;
}

/**
 * EXAMPLE 17: Purchase Upgrade with Save
 */
function purchaseUpgrade(upgradeId, metaProgression) {
  const saveSystem = getSaveSystem();

  // Purchase in meta progression
  const purchased = metaProgression.purchaseUpgrade(upgradeId);

  if (purchased) {
    // Save meta progress
    saveSystem.saveMetaProgress({
      goldNuggets: metaProgression.goldNuggets,
      bountyStars: metaProgression.bountyStars,
      upgrades: metaProgression.getUpgradeLevels(),
    });

    console.log(`Upgrade purchased: ${upgradeId}`);
  }

  return purchased;
}

/**
 * EXAMPLE 18: Migration Test
 */
function testSaveMigration() {
  const saveSystem = getSaveSystem();

  // Simulate old save data
  const oldSave = {
    version: '0.9.0',
    metaProgress: {
      goldNuggets: 1000,
      bountyStars: 50,
      upgrades: {
        maxHp: 5,
        damage: 3,
      },
    },
    achievements: {},
    statistics: {
      totalKills: 5000,
      highestWave: 25,
    },
    settings: {
      musicVolume: 0.7,
    },
    unlocks: {
      characters: ['drifter', 'outlaw'],
      weapons: ['six_shooter', 'rifle'],
    },
  };

  // Import old save (triggers migration)
  const code = btoa(JSON.stringify(oldSave));
  const success = saveSystem.importSave(code);

  if (success) {
    const newSave = saveSystem.loadGame();
    console.log('Migration successful:', newSave);
    console.log('Version:', newSave.version); // Should be 1.0.0
  }
}

export {
  initializeSaveSystem,
  loadGameOnStartup,
  saveAfterRun,
  saveSettingsChanges,
  unlockCharacter,
  unlockWeapon,
  unlockEvolution,
  setupAutoSave,
  disableAutoSaveOnGameEnd,
  exportSaveCode,
  importSaveFromCode,
  resetAllProgress,
  displaySaveInfo,
  checkStorageUsage,
  SaveSystemProvider,
  useSaveSystem,
  SettingsPanel,
  unlockAchievement,
  purchaseUpgrade,
  testSaveMigration,
};
