/**
 * Save System
 *
 * Robust save/load system for all persistent data:
 * - Meta progression (permanent upgrades)
 * - Achievements and progress
 * - All-time statistics
 * - User settings
 * - Character/weapon unlocks
 * - Save versioning and migration
 * - Export/import via shareable codes
 *
 * Usage:
 * const saveSystem = new SaveSystem();
 * saveSystem.saveGame(gameData);
 * const data = saveSystem.loadGame();
 * const code = saveSystem.exportSave();
 * saveSystem.importSave(code);
 */

// Current save version for migration support
const SAVE_VERSION = '1.0.0';

// LocalStorage keys
const STORAGE_KEYS = {
  META_PROGRESS: 'outlaws_meta_progress',
  ACHIEVEMENTS: 'outlaws_achievements',
  STATISTICS: 'outlaws_statistics',
  SETTINGS: 'outlaws_settings',
  UNLOCKS: 'outlaws_unlocks',
  LAST_SAVE: 'outlaws_last_save_time',
};

/**
 * Default save data structure
 */
const DEFAULT_SAVE_DATA = {
  version: SAVE_VERSION,
  metaProgress: {
    goldNuggets: 0,
    bountyStars: 0,
    upgrades: {
      maxHp: 0,
      damage: 0,
      speed: 0,
      pickup: 0,
      luck: 0,
      startingLevel: 0,
      rerolls: 0,
      revivals: 0,
    },
  },
  achievements: {},
  statistics: {
    totalKills: 0,
    totalPlaytime: 0, // in seconds
    totalRuns: 0,
    totalDeaths: 0,
    highestWave: 0,
    longestSurvival: 0, // in seconds
    totalGoldEarned: 0,
    totalXpEarned: 0,
    totalDamageDealt: 0,
    bossesDefeated: {},
    evolutionsDiscovered: [],
    perfectWaves: 0,
    totalProjectilesFired: 0,
    totalDistanceTraveled: 0,
    fastestWave10: Infinity, // in seconds
    fastestWave20: Infinity,
    mostKillsInRun: 0,
    highestLevel: 0,
  },
  unlocks: {
    characters: ['drifter'], // Default character unlocked
    weapons: ['six_shooter'], // Default weapon unlocked
    evolutions: [],
  },
  settings: {
    musicVolume: 0.5,
    sfxVolume: 0.7,
    screenShake: true,
    showDamageNumbers: true,
    showFPS: false,
    difficulty: 'normal',
    autoSave: true,
  },
};

/**
 * Save System Class
 */
export class SaveSystem {
  constructor() {
    this.autoSaveInterval = null;
    this.lastSaveTime = this._getLastSaveTime();
  }

  /**
   * Save all game data to localStorage
   * @param {Object} data - Data to save (merged with existing)
   * @returns {boolean} Success status
   */
  saveGame(data = {}) {
    try {
      const saveData = this._mergeSaveData(data);

      // Save each section to its own key
      this._saveToStorage(STORAGE_KEYS.META_PROGRESS, saveData.metaProgress);
      this._saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, saveData.achievements);
      this._saveToStorage(STORAGE_KEYS.STATISTICS, saveData.statistics);
      this._saveToStorage(STORAGE_KEYS.SETTINGS, saveData.settings);
      this._saveToStorage(STORAGE_KEYS.UNLOCKS, saveData.unlocks);

      // Update last save time
      this._saveToStorage(STORAGE_KEYS.LAST_SAVE, Date.now());
      this.lastSaveTime = Date.now();

      console.log('[SaveSystem] Game saved successfully');
      return true;
    } catch (error) {
      console.error('[SaveSystem] Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load all game data from localStorage
   * @returns {Object} Complete save data with defaults
   */
  loadGame() {
    try {
      const metaProgress = this._loadFromStorage(
        STORAGE_KEYS.META_PROGRESS,
        DEFAULT_SAVE_DATA.metaProgress
      );
      const achievements = this._loadFromStorage(
        STORAGE_KEYS.ACHIEVEMENTS,
        DEFAULT_SAVE_DATA.achievements
      );
      const statistics = this._loadFromStorage(
        STORAGE_KEYS.STATISTICS,
        DEFAULT_SAVE_DATA.statistics
      );
      const settings = this._loadFromStorage(
        STORAGE_KEYS.SETTINGS,
        DEFAULT_SAVE_DATA.settings
      );
      const unlocks = this._loadFromStorage(
        STORAGE_KEYS.UNLOCKS,
        DEFAULT_SAVE_DATA.unlocks
      );

      const saveData = {
        version: SAVE_VERSION,
        metaProgress,
        achievements,
        statistics,
        settings,
        unlocks,
      };

      // Migrate old save versions if needed
      const migratedData = this._migrateSaveData(saveData);

      console.log('[SaveSystem] Game loaded successfully');
      return migratedData;
    } catch (error) {
      console.error('[SaveSystem] Failed to load game:', error);
      return { ...DEFAULT_SAVE_DATA };
    }
  }

  /**
   * Update specific section of save data
   * @param {string} section - Section key (metaProgress, achievements, etc.)
   * @param {Object} data - Data to save
   * @returns {boolean} Success status
   */
  updateSection(section, data) {
    try {
      const key = STORAGE_KEYS[section.toUpperCase()];
      if (!key) {
        console.error(`[SaveSystem] Invalid section: ${section}`);
        return false;
      }

      this._saveToStorage(key, data);
      this._saveToStorage(STORAGE_KEYS.LAST_SAVE, Date.now());
      this.lastSaveTime = Date.now();

      return true;
    } catch (error) {
      console.error(`[SaveSystem] Failed to update section ${section}:`, error);
      return false;
    }
  }

  /**
   * Update meta progression data
   * @param {Object} metaProgress - Meta progression data
   */
  saveMetaProgress(metaProgress) {
    return this.updateSection('metaProgress', metaProgress);
  }

  /**
   * Update achievements
   * @param {Object} achievements - Achievements data
   */
  saveAchievements(achievements) {
    return this.updateSection('achievements', achievements);
  }

  /**
   * Update statistics
   * @param {Object} statistics - Statistics data
   */
  saveStatistics(statistics) {
    return this.updateSection('statistics', statistics);
  }

  /**
   * Update settings
   * @param {Object} settings - Settings data
   */
  saveSettings(settings) {
    return this.updateSection('settings', settings);
  }

  /**
   * Update unlocks
   * @param {Object} unlocks - Unlocks data
   */
  saveUnlocks(unlocks) {
    return this.updateSection('unlocks', unlocks);
  }

  /**
   * Add statistics from a completed run
   * @param {Object} runStats - Run statistics
   */
  addRunStatistics(runStats) {
    try {
      const stats = this._loadFromStorage(
        STORAGE_KEYS.STATISTICS,
        DEFAULT_SAVE_DATA.statistics
      );

      // Update statistics
      stats.totalKills += runStats.kills || 0;
      stats.totalPlaytime += runStats.playTime || 0;
      stats.totalRuns += 1;
      stats.totalDeaths += runStats.died ? 1 : 0;
      stats.highestWave = Math.max(stats.highestWave, runStats.wave || 0);
      stats.longestSurvival = Math.max(stats.longestSurvival, runStats.playTime || 0);
      stats.totalGoldEarned += runStats.goldEarned || 0;
      stats.totalXpEarned += runStats.xpEarned || 0;
      stats.totalDamageDealt += runStats.damageDealt || 0;
      stats.totalProjectilesFired += runStats.projectilesFired || 0;
      stats.totalDistanceTraveled += runStats.distanceTraveled || 0;
      stats.perfectWaves += runStats.perfectWaves || 0;
      stats.mostKillsInRun = Math.max(stats.mostKillsInRun, runStats.kills || 0);
      stats.highestLevel = Math.max(stats.highestLevel, runStats.level || 0);

      // Update bosses defeated
      if (runStats.bossesDefeated) {
        runStats.bossesDefeated.forEach((bossId) => {
          stats.bossesDefeated[bossId] = (stats.bossesDefeated[bossId] || 0) + 1;
        });
      }

      // Update evolutions discovered
      if (runStats.evolutionsDiscovered) {
        runStats.evolutionsDiscovered.forEach((evoId) => {
          if (!stats.evolutionsDiscovered.includes(evoId)) {
            stats.evolutionsDiscovered.push(evoId);
          }
        });
      }

      // Update speed records
      if (runStats.wave >= 10) {
        stats.fastestWave10 = Math.min(stats.fastestWave10, runStats.playTime);
      }
      if (runStats.wave >= 20) {
        stats.fastestWave20 = Math.min(stats.fastestWave20, runStats.playTime);
      }

      this.saveStatistics(stats);
      return true;
    } catch (error) {
      console.error('[SaveSystem] Failed to add run statistics:', error);
      return false;
    }
  }

  /**
   * Reset all progress (with confirmation)
   * @param {boolean} confirmed - Must be true to actually reset
   * @returns {boolean} Success status
   */
  resetProgress(confirmed = false) {
    if (!confirmed) {
      console.warn('[SaveSystem] Reset requires confirmation');
      return false;
    }

    try {
      // Clear all storage keys
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });

      console.log('[SaveSystem] All progress reset');
      return true;
    } catch (error) {
      console.error('[SaveSystem] Failed to reset progress:', error);
      return false;
    }
  }

  /**
   * Export save data as shareable code
   * @returns {string} Base64 encoded save data
   */
  exportSave() {
    try {
      const saveData = this.loadGame();
      const jsonString = JSON.stringify(saveData);
      const base64 = btoa(jsonString);

      console.log('[SaveSystem] Save exported successfully');
      return base64;
    } catch (error) {
      console.error('[SaveSystem] Failed to export save:', error);
      return null;
    }
  }

  /**
   * Import save data from shareable code
   * @param {string} code - Base64 encoded save data
   * @returns {boolean} Success status
   */
  importSave(code) {
    try {
      if (!code || typeof code !== 'string') {
        throw new Error('Invalid save code');
      }

      const jsonString = atob(code);
      const saveData = JSON.parse(jsonString);

      // Validate save data structure
      if (!this._validateSaveData(saveData)) {
        throw new Error('Invalid save data structure');
      }

      // Migrate if necessary
      const migratedData = this._migrateSaveData(saveData);

      // Save imported data
      this.saveGame(migratedData);

      console.log('[SaveSystem] Save imported successfully');
      return true;
    } catch (error) {
      console.error('[SaveSystem] Failed to import save:', error);
      return false;
    }
  }

  /**
   * Enable auto-save at regular intervals
   * @param {number} interval - Auto-save interval in milliseconds
   * @param {Function} getDataCallback - Function that returns current game data
   */
  enableAutoSave(interval = 60000, getDataCallback) {
    this.disableAutoSave(); // Clear any existing interval

    this.autoSaveInterval = setInterval(() => {
      if (getDataCallback) {
        const data = getDataCallback();
        this.saveGame(data);
      }
    }, interval);

    console.log(`[SaveSystem] Auto-save enabled (${interval}ms interval)`);
  }

  /**
   * Disable auto-save
   */
  disableAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('[SaveSystem] Auto-save disabled');
    }
  }

  /**
   * Get save file info
   * @returns {Object} Save file information
   */
  getSaveInfo() {
    const data = this.loadGame();
    const lastSave = this._getLastSaveTime();

    return {
      version: data.version,
      lastSaveTime: lastSave,
      lastSaveDate: lastSave ? new Date(lastSave).toLocaleString() : 'Never',
      totalKills: data.statistics.totalKills,
      totalPlaytime: data.statistics.totalPlaytime,
      totalRuns: data.statistics.totalRuns,
      highestWave: data.statistics.highestWave,
      goldNuggets: data.metaProgress.goldNuggets,
      bountyStars: data.metaProgress.bountyStars,
      achievementsUnlocked: Object.values(data.achievements).filter((a) => a.unlocked)
        .length,
      charactersUnlocked: data.unlocks.characters.length,
      weaponsUnlocked: data.unlocks.weapons.length,
    };
  }

  /**
   * Private: Save to localStorage with error handling
   * @private
   */
  _saveToStorage(key, data) {
    try {
      const jsonString = JSON.stringify(data);
      localStorage.setItem(key, jsonString);
    } catch (error) {
      // Handle quota exceeded errors
      if (error.name === 'QuotaExceededError') {
        console.error('[SaveSystem] Storage quota exceeded');
        throw new Error('Storage quota exceeded. Please free up space.');
      }
      throw error;
    }
  }

  /**
   * Private: Load from localStorage with defaults
   * @private
   */
  _loadFromStorage(key, defaultValue) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return { ...defaultValue };

      const parsed = JSON.parse(item);
      // Merge with defaults to ensure all properties exist
      return { ...defaultValue, ...parsed };
    } catch (error) {
      console.error(`[SaveSystem] Failed to load ${key}:`, error);
      return { ...defaultValue };
    }
  }

  /**
   * Private: Get last save time
   * @private
   */
  _getLastSaveTime() {
    try {
      const time = localStorage.getItem(STORAGE_KEYS.LAST_SAVE);
      return time ? parseInt(time, 10) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Private: Merge new data with existing save
   * @private
   */
  _mergeSaveData(newData) {
    const existing = this.loadGame();
    return {
      version: SAVE_VERSION,
      metaProgress: { ...existing.metaProgress, ...newData.metaProgress },
      achievements: { ...existing.achievements, ...newData.achievements },
      statistics: { ...existing.statistics, ...newData.statistics },
      settings: { ...existing.settings, ...newData.settings },
      unlocks: { ...existing.unlocks, ...newData.unlocks },
    };
  }

  /**
   * Private: Validate save data structure
   * @private
   */
  _validateSaveData(data) {
    // Check required top-level properties
    const requiredProps = ['version', 'metaProgress', 'achievements', 'statistics', 'settings', 'unlocks'];
    for (const prop of requiredProps) {
      if (!(prop in data)) {
        console.error(`[SaveSystem] Missing required property: ${prop}`);
        return false;
      }
    }

    // Basic type checks
    if (typeof data.metaProgress !== 'object') return false;
    if (typeof data.achievements !== 'object') return false;
    if (typeof data.statistics !== 'object') return false;
    if (typeof data.settings !== 'object') return false;
    if (typeof data.unlocks !== 'object') return false;

    return true;
  }

  /**
   * Private: Migrate save data from old versions
   * @private
   */
  _migrateSaveData(data) {
    const version = data.version || '0.0.0';

    // Example migration: 0.x.x -> 1.0.0
    if (version < '1.0.0') {
      console.log('[SaveSystem] Migrating save from version', version, 'to 1.0.0');
      // Add any new fields that didn't exist in old versions
      data.metaProgress.upgrades = {
        ...DEFAULT_SAVE_DATA.metaProgress.upgrades,
        ...data.metaProgress.upgrades,
      };
      data.statistics = {
        ...DEFAULT_SAVE_DATA.statistics,
        ...data.statistics,
      };
      data.version = '1.0.0';
    }

    // Future migrations would go here
    // if (version < '1.1.0') { ... }

    return data;
  }

  /**
   * Get formatted playtime string
   * @param {number} seconds - Total playtime in seconds
   * @returns {string} Formatted time (e.g., "12h 34m")
   */
  static formatPlaytime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} True if localStorage is available
   */
  static isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage usage information
   * @returns {Object} Storage usage info
   */
  static getStorageUsage() {
    let totalSize = 0;
    const sizes = {};

    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const item = localStorage.getItem(key);
      if (item) {
        const size = new Blob([item]).size;
        sizes[name] = size;
        totalSize += size;
      }
    });

    return {
      totalBytes: totalSize,
      totalKB: (totalSize / 1024).toFixed(2),
      breakdown: sizes,
      percentUsed: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2), // Assume 5MB limit
    };
  }
}

/**
 * Singleton instance for easy access
 */
let saveSystemInstance = null;

export function getSaveSystem() {
  if (!saveSystemInstance) {
    saveSystemInstance = new SaveSystem();
  }
  return saveSystemInstance;
}

export { STORAGE_KEYS, DEFAULT_SAVE_DATA, SAVE_VERSION };
export default SaveSystem;
