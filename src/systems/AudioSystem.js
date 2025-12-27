/**
 * Audio System - Web Audio API-based sound system
 *
 * Features:
 * - Procedurally generated sound effects using oscillators
 * - Music playback with volume control
 * - Spatial audio (volume based on distance)
 * - Sound priorities and limiting
 * - Volume controls per category
 */

// Sound categories for priority and limiting
const SOUND_CATEGORIES = {
  PLAYER: 'player',
  ENEMY: 'enemy',
  BOSS: 'boss',
  UI: 'ui',
  MUSIC: 'music',
};

// Sound priorities (higher = more important)
const SOUND_PRIORITIES = {
  [SOUND_CATEGORIES.BOSS]: 100,
  [SOUND_CATEGORIES.PLAYER]: 80,
  [SOUND_CATEGORIES.UI]: 60,
  [SOUND_CATEGORIES.ENEMY]: 40,
  [SOUND_CATEGORIES.MUSIC]: 20,
};

// Max concurrent sounds per category
const MAX_CONCURRENT_SOUNDS = {
  [SOUND_CATEGORIES.PLAYER]: 10,
  [SOUND_CATEGORIES.ENEMY]: 5,
  [SOUND_CATEGORIES.BOSS]: 10,
  [SOUND_CATEGORIES.UI]: 5,
};

// ========== AUDIO SYSTEM CLASS ==========

export class AudioSystem {
  constructor() {
    // Create audio context
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.error('Web Audio API not supported:', e);
      this.audioContext = null;
    }

    // Master volume controls
    this.masterVolume = this.audioContext ? this.audioContext.createGain() : null;
    if (this.masterVolume) {
      this.masterVolume.connect(this.audioContext.destination);
      this.masterVolume.gain.value = 0.7;
    }

    // Category volume nodes
    this.categoryGains = {};
    if (this.audioContext) {
      Object.values(SOUND_CATEGORIES).forEach(category => {
        const gain = this.audioContext.createGain();
        gain.connect(this.masterVolume);
        gain.gain.value = 1.0;
        this.categoryGains[category] = gain;
      });
    }

    // Track active sounds per category
    this.activeSounds = {
      [SOUND_CATEGORIES.PLAYER]: [],
      [SOUND_CATEGORIES.ENEMY]: [],
      [SOUND_CATEGORIES.BOSS]: [],
      [SOUND_CATEGORIES.UI]: [],
    };

    // Music state
    this.currentMusic = null;
    this.musicOscillator = null;

    // Mute state
    this.muted = false;
    this.previousVolume = 0.7;

    // Auto-resume audio context on user interaction
    if (this.audioContext && this.audioContext.state === 'suspended') {
      const resumeAudio = () => {
        this.audioContext.resume();
        document.removeEventListener('click', resumeAudio);
        document.removeEventListener('keydown', resumeAudio);
      };
      document.addEventListener('click', resumeAudio);
      document.addEventListener('keydown', resumeAudio);
    }
  }

  /**
   * Play sound effect
   */
  playSFX(soundId, volume = 1.0, pitch = 1.0) {
    if (!this.audioContext || this.muted) return null;

    const soundDef = SOUND_DEFINITIONS[soundId];
    if (!soundDef) {
      console.warn(`Unknown sound: ${soundId}`);
      return null;
    }

    // Check concurrent sound limit
    const category = soundDef.category;
    const maxConcurrent = MAX_CONCURRENT_SOUNDS[category];

    if (maxConcurrent && this.activeSounds[category]) {
      // Remove finished sounds
      this.activeSounds[category] = this.activeSounds[category].filter(
        sound => sound.endTime > this.audioContext.currentTime
      );

      // Check if at limit
      if (this.activeSounds[category].length >= maxConcurrent) {
        // Don't play new sound if at limit
        return null;
      }
    }

    // Generate sound
    const sound = this.generateSound(soundDef, volume, pitch);

    // Track active sound
    if (this.activeSounds[category]) {
      this.activeSounds[category].push({
        endTime: this.audioContext.currentTime + soundDef.duration,
        sound,
      });
    }

    return sound;
  }

  /**
   * Play spatial sound (volume based on distance)
   */
  playSpatial(soundId, x, y, playerX, playerY, maxDistance = 800) {
    if (!this.audioContext || this.muted) return null;

    // Calculate distance
    const dx = x - playerX;
    const dy = y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate volume based on distance (inverse square law)
    const distanceRatio = Math.min(1, distance / maxDistance);
    const volume = Math.max(0, 1 - distanceRatio);

    if (volume <= 0.01) return null; // Too far away

    return this.playSFX(soundId, volume);
  }

  /**
   * Generate synthesized sound
   */
  generateSound(soundDef, volume = 1.0, pitch = 1.0) {
    const { generator } = soundDef;
    return generator.call(this, soundDef, volume, pitch);
  }

  /**
   * Play background music
   */
  playMusic(trackId) {
    if (!this.audioContext || this.muted) return;

    // Stop current music
    this.stopMusic();

    const trackDef = MUSIC_TRACKS[trackId];
    if (!trackDef) {
      console.warn(`Unknown music track: ${trackId}`);
      return;
    }

    this.currentMusic = trackId;

    // Generate looping music
    this.musicOscillator = trackDef.generator.call(this, trackDef);
  }

  /**
   * Stop background music
   */
  stopMusic() {
    if (this.musicOscillator) {
      this.musicOscillator.stop();
      this.musicOscillator = null;
    }
    this.currentMusic = null;
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume) {
    if (this.categoryGains[SOUND_CATEGORIES.MUSIC]) {
      this.categoryGains[SOUND_CATEGORIES.MUSIC].gain.value = volume;
    }
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume) {
    if (this.masterVolume) {
      this.masterVolume.gain.value = volume;
      this.previousVolume = volume;
    }
  }

  /**
   * Mute/unmute all audio
   */
  setMuted(muted) {
    this.muted = muted;
    if (this.masterVolume) {
      if (muted) {
        this.masterVolume.gain.value = 0;
      } else {
        this.masterVolume.gain.value = this.previousVolume;
      }
    }
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopMusic();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// ========== SOUND GENERATORS ==========

/**
 * Generate pistol shot sound
 */
function generatePistolShot(soundDef, volume, pitch) {
  const now = this.audioContext.currentTime;
  const duration = 0.1;

  // Sharp attack with noise
  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(150 * pitch, now);
  oscillator.frequency.exponentialRampToValueAtTime(50 * pitch, now + duration);

  gainNode.gain.setValueAtTime(0.3 * volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(this.categoryGains[soundDef.category]);

  oscillator.start(now);
  oscillator.stop(now + duration);

  return { oscillator, gainNode };
}

/**
 * Generate shotgun blast sound
 */
function generateShotgunBlast(soundDef, volume, pitch) {
  const now = this.audioContext.currentTime;
  const duration = 0.2;

  // Deeper, longer sound
  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(100 * pitch, now);
  oscillator.frequency.exponentialRampToValueAtTime(30 * pitch, now + duration);

  gainNode.gain.setValueAtTime(0.4 * volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(this.categoryGains[soundDef.category]);

  oscillator.start(now);
  oscillator.stop(now + duration);

  return { oscillator, gainNode };
}

/**
 * Generate gatling gun sound
 */
function generateGatlingGun(soundDef, volume, pitch) {
  const now = this.audioContext.currentTime;
  const duration = 0.05;

  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(200 * pitch, now);
  oscillator.frequency.exponentialRampToValueAtTime(80 * pitch, now + duration);

  gainNode.gain.setValueAtTime(0.2 * volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(this.categoryGains[soundDef.category]);

  oscillator.start(now);
  oscillator.stop(now + duration);

  return { oscillator, gainNode };
}

/**
 * Generate explosion sound
 */
function generateExplosion(soundDef, volume, pitch) {
  const now = this.audioContext.currentTime;
  const duration = 0.6;

  // Low frequency boom
  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(80 * pitch, now);
  oscillator.frequency.exponentialRampToValueAtTime(20 * pitch, now + duration);

  gainNode.gain.setValueAtTime(0.5 * volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(this.categoryGains[soundDef.category]);

  oscillator.start(now);
  oscillator.stop(now + duration);

  return { oscillator, gainNode };
}

/**
 * Generate enemy hit sound
 */
function generateEnemyHit(soundDef, volume, pitch) {
  const now = this.audioContext.currentTime;
  const duration = 0.08;

  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(400 * pitch, now);
  oscillator.frequency.linearRampToValueAtTime(200 * pitch, now + duration);

  gainNode.gain.setValueAtTime(0.15 * volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(this.categoryGains[soundDef.category]);

  oscillator.start(now);
  oscillator.stop(now + duration);

  return { oscillator, gainNode };
}

/**
 * Generate enemy death sound
 */
function generateEnemyDeath(soundDef, volume, pitch) {
  const now = this.audioContext.currentTime;
  const duration = 0.3;

  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(300 * pitch, now);
  oscillator.frequency.exponentialRampToValueAtTime(50 * pitch, now + duration);

  gainNode.gain.setValueAtTime(0.2 * volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(this.categoryGains[soundDef.category]);

  oscillator.start(now);
  oscillator.stop(now + duration);

  return { oscillator, gainNode };
}

/**
 * Generate player hit sound
 */
function generatePlayerHit(soundDef, volume, pitch) {
  const now = this.audioContext.currentTime;
  const duration = 0.15;

  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(150 * pitch, now);
  oscillator.frequency.linearRampToValueAtTime(80 * pitch, now + duration);

  gainNode.gain.setValueAtTime(0.35 * volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(this.categoryGains[soundDef.category]);

  oscillator.start(now);
  oscillator.stop(now + duration);

  return { oscillator, gainNode };
}

/**
 * Generate XP collect chime
 */
function generateXPCollect(soundDef, volume, pitch) {
  const now = this.audioContext.currentTime;
  const duration = 0.2;

  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(400 * pitch, now);
  oscillator.frequency.linearRampToValueAtTime(800 * pitch, now + duration);

  gainNode.gain.setValueAtTime(0.2 * volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(this.categoryGains[soundDef.category]);

  oscillator.start(now);
  oscillator.stop(now + duration);

  return { oscillator, gainNode };
}

/**
 * Generate level up fanfare
 */
function generateLevelUp(soundDef, volume, pitch) {
  const now = this.audioContext.currentTime;
  const notes = [523, 659, 784]; // C5, E5, G5 chord
  const duration = 0.5;

  const oscillators = notes.map((freq, i) => {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * pitch, now);

    gain.gain.setValueAtTime(0.15 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(this.categoryGains[soundDef.category]);

    osc.start(now + i * 0.05);
    osc.stop(now + duration);

    return { oscillator: osc, gainNode: gain };
  });

  return oscillators[0]; // Return first one
}

/**
 * Generate boss intro sting
 */
function generateBossIntro(soundDef, volume, pitch) {
  const now = this.audioContext.currentTime;
  const duration = 1.0;

  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(100 * pitch, now);
  oscillator.frequency.linearRampToValueAtTime(50 * pitch, now + 0.5);
  oscillator.frequency.linearRampToValueAtTime(100 * pitch, now + duration);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.4 * volume, now + 0.1);
  gainNode.gain.linearRampToValueAtTime(0.3 * volume, now + 0.5);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(this.categoryGains[soundDef.category]);

  oscillator.start(now);
  oscillator.stop(now + duration);

  return { oscillator, gainNode };
}

/**
 * Generate boss death explosion sequence
 */
function generateBossDeath(soundDef, volume, pitch) {
  const now = this.audioContext.currentTime;
  const duration = 2.0;

  // Multiple overlapping explosions
  for (let i = 0; i < 3; i++) {
    const startTime = now + i * 0.2;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60 * pitch, startTime);
    osc.frequency.exponentialRampToValueAtTime(20 * pitch, startTime + 0.5);

    gain.gain.setValueAtTime(0.4 * volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

    osc.connect(gain);
    gain.connect(this.categoryGains[soundDef.category]);

    osc.start(startTime);
    osc.stop(startTime + 0.5);
  }

  // Triumphant rise at end
  const finalOsc = this.audioContext.createOscillator();
  const finalGain = this.audioContext.createGain();

  finalOsc.type = 'sine';
  finalOsc.frequency.setValueAtTime(400 * pitch, now + 0.8);
  finalOsc.frequency.linearRampToValueAtTime(800 * pitch, now + duration);

  finalGain.gain.setValueAtTime(0, now + 0.8);
  finalGain.gain.linearRampToValueAtTime(0.3 * volume, now + 1.0);
  finalGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  finalOsc.connect(finalGain);
  finalGain.connect(this.categoryGains[soundDef.category]);

  finalOsc.start(now + 0.8);
  finalOsc.stop(now + duration);

  return { oscillator: finalOsc, gainNode: finalGain };
}

/**
 * Generate menu select click
 */
function generateMenuSelect(soundDef, volume, pitch) {
  const now = this.audioContext.currentTime;
  const duration = 0.05;

  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(600 * pitch, now);

  gainNode.gain.setValueAtTime(0.15 * volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(this.categoryGains[soundDef.category]);

  oscillator.start(now);
  oscillator.stop(now + duration);

  return { oscillator, gainNode };
}

/**
 * Generate menu confirm click
 */
function generateMenuConfirm(soundDef, volume, pitch) {
  const now = this.audioContext.currentTime;
  const duration = 0.1;

  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(800 * pitch, now);
  oscillator.frequency.linearRampToValueAtTime(600 * pitch, now + duration);

  gainNode.gain.setValueAtTime(0.25 * volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(this.categoryGains[soundDef.category]);

  oscillator.start(now);
  oscillator.stop(now + duration);

  return { oscillator, gainNode };
}

/**
 * Generate simple background music loop
 */
function generateBackgroundMusic(trackDef) {
  // Simple repeating melody
  const now = this.audioContext.currentTime;
  const melody = trackDef.melody || [261.63, 329.63, 392, 523.25]; // C, E, G, C
  const tempo = trackDef.tempo || 0.5; // seconds per note

  let currentTime = now;

  const playNote = (frequency, duration) => {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, currentTime);

    gain.gain.setValueAtTime(0, currentTime);
    gain.gain.linearRampToValueAtTime(0.1, currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0.08, currentTime + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, currentTime + duration);

    osc.connect(gain);
    gain.connect(this.categoryGains[SOUND_CATEGORIES.MUSIC]);

    osc.start(currentTime);
    osc.stop(currentTime + duration);

    currentTime += duration;
  };

  // Play melody once
  melody.forEach(freq => playNote(freq, tempo));

  // Schedule next loop
  const loopDuration = melody.length * tempo;
  setTimeout(() => {
    if (this.currentMusic === trackDef.id) {
      this.musicOscillator = trackDef.generator.call(this, trackDef);
    }
  }, loopDuration * 1000);

  return { stop: () => {} }; // Dummy stop function
}

// ========== SOUND DEFINITIONS ==========

export const SOUND_DEFINITIONS = {
  SHOOT_PISTOL: {
    id: 'SHOOT_PISTOL',
    category: SOUND_CATEGORIES.PLAYER,
    duration: 0.1,
    generator: generatePistolShot,
  },
  SHOOT_SHOTGUN: {
    id: 'SHOOT_SHOTGUN',
    category: SOUND_CATEGORIES.PLAYER,
    duration: 0.2,
    generator: generateShotgunBlast,
  },
  SHOOT_GATLING: {
    id: 'SHOOT_GATLING',
    category: SOUND_CATEGORIES.PLAYER,
    duration: 0.05,
    generator: generateGatlingGun,
  },
  EXPLOSION: {
    id: 'EXPLOSION',
    category: SOUND_CATEGORIES.PLAYER,
    duration: 0.6,
    generator: generateExplosion,
  },
  ENEMY_HIT: {
    id: 'ENEMY_HIT',
    category: SOUND_CATEGORIES.ENEMY,
    duration: 0.08,
    generator: generateEnemyHit,
  },
  ENEMY_DEATH: {
    id: 'ENEMY_DEATH',
    category: SOUND_CATEGORIES.ENEMY,
    duration: 0.3,
    generator: generateEnemyDeath,
  },
  PLAYER_HIT: {
    id: 'PLAYER_HIT',
    category: SOUND_CATEGORIES.PLAYER,
    duration: 0.15,
    generator: generatePlayerHit,
  },
  XP_COLLECT: {
    id: 'XP_COLLECT',
    category: SOUND_CATEGORIES.PLAYER,
    duration: 0.2,
    generator: generateXPCollect,
  },
  LEVEL_UP: {
    id: 'LEVEL_UP',
    category: SOUND_CATEGORIES.PLAYER,
    duration: 0.5,
    generator: generateLevelUp,
  },
  BOSS_INTRO: {
    id: 'BOSS_INTRO',
    category: SOUND_CATEGORIES.BOSS,
    duration: 1.0,
    generator: generateBossIntro,
  },
  BOSS_DEATH: {
    id: 'BOSS_DEATH',
    category: SOUND_CATEGORIES.BOSS,
    duration: 2.0,
    generator: generateBossDeath,
  },
  MENU_SELECT: {
    id: 'MENU_SELECT',
    category: SOUND_CATEGORIES.UI,
    duration: 0.05,
    generator: generateMenuSelect,
  },
  MENU_CONFIRM: {
    id: 'MENU_CONFIRM',
    category: SOUND_CATEGORIES.UI,
    duration: 0.1,
    generator: generateMenuConfirm,
  },
};

// ========== MUSIC TRACKS ==========

export const MUSIC_TRACKS = {
  MENU: {
    id: 'MENU',
    melody: [261.63, 329.63, 392, 329.63], // C, E, G, E
    tempo: 0.6,
    generator: generateBackgroundMusic,
  },
  GAME: {
    id: 'GAME',
    melody: [392, 440, 493.88, 523.25, 493.88, 440], // G, A, B, C, B, A
    tempo: 0.4,
    generator: generateBackgroundMusic,
  },
  BOSS: {
    id: 'BOSS',
    melody: [220, 246.94, 261.63, 293.66], // A, B, C, D
    tempo: 0.3,
    generator: generateBackgroundMusic,
  },
};

// ========== HELPER FUNCTIONS ==========

/**
 * Create audio system instance
 */
export function createAudioSystem() {
  return new AudioSystem();
}

/**
 * Get sound ID for weapon type
 */
export function getWeaponSound(weaponType) {
  const soundMap = {
    pistol: 'SHOOT_PISTOL',
    shotgun: 'SHOOT_SHOTGUN',
    gatling: 'SHOOT_GATLING',
    rifle: 'SHOOT_PISTOL',
    default: 'SHOOT_PISTOL',
  };

  return soundMap[weaponType] || soundMap.default;
}

// Export all
export default AudioSystem;
