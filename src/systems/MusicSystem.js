/**
 * Music System - Dynamic music that responds to gameplay
 *
 * Features:
 * - Layered music approach (base, action, boss, tension)
 * - State machine for different game states
 * - Smooth cross-fades between states (1-2s transitions)
 * - Procedurally generated western-themed music
 * - Pentatonic scale for authentic western feel
 * - Simple chord progressions
 */

// ========== MUSIC STATES ==========

export const MUSIC_STATES = {
  MENU: 'MENU',
  GAMEPLAY_CALM: 'GAMEPLAY_CALM',
  GAMEPLAY_ACTION: 'GAMEPLAY_ACTION',
  BOSS_FIGHT: 'BOSS_FIGHT',
  LOW_HP: 'LOW_HP',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY',
};

// ========== MUSIC LAYERS ==========

export const MUSIC_LAYERS = {
  BASE: 'BASE',           // Always playing, sets mood
  ACTION: 'ACTION',       // Fades in during combat
  BOSS: 'BOSS',          // Replaces base during boss fights
  TENSION: 'TENSION',     // Low HP warning (heartbeat)
};

// ========== WESTERN PENTATONIC SCALE ==========

// A minor pentatonic (classic western sound)
const PENTATONIC_SCALE = {
  A: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33],  // A, C, D, E, G, A, C, D
  ROOT: 220.00,  // A
  NOTES: {
    I: 220.00,    // A (root)
    bIII: 261.63, // C (minor third)
    IV: 293.66,   // D (fourth)
    V: 329.63,    // E (fifth)
    bVII: 392.00, // G (minor seventh)
  }
};

// Western chord progressions (I-IV-V-I, I-bVII-IV-I)
const CHORD_PROGRESSIONS = {
  CLASSIC: ['I', 'IV', 'V', 'I'],           // Classic western
  MOODY: ['I', 'bVII', 'IV', 'I'],         // Darker mood
  SIMPLE: ['I', 'V', 'I', 'V'],            // Simple back and forth
  DRAMATIC: ['I', 'bIII', 'IV', 'V'],      // More dramatic
};

// ========== MUSIC LAYER CLASS ==========

class MusicLayer {
  constructor(audioContext, destination, layerId) {
    this.audioContext = audioContext;
    this.layerId = layerId;

    // Create gain node for this layer
    this.gainNode = audioContext.createGain();
    this.gainNode.connect(destination);
    this.gainNode.gain.value = 0; // Start silent

    // Active oscillators and scheduled notes
    this.activeOscillators = [];
    this.isPlaying = false;
    this.targetVolume = 0;
    this.currentVolume = 0;
  }

  /**
   * Fade in layer
   */
  fadeIn(duration = 1.5, targetVolume = 0.3) {
    const now = this.audioContext.currentTime;
    this.targetVolume = targetVolume;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(targetVolume, now + duration);
    this.currentVolume = targetVolume;
  }

  /**
   * Fade out layer
   */
  fadeOut(duration = 1.5) {
    const now = this.audioContext.currentTime;
    this.targetVolume = 0;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + duration);
    this.currentVolume = 0;
  }

  /**
   * Play a note
   */
  playNote(frequency, startTime, duration, type = 'sine', volume = 1.0) {
    const oscillator = this.audioContext.createOscillator();
    const noteGain = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Envelope: attack, sustain, release
    const attack = 0.05;
    const release = 0.1;

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(volume, startTime + attack);
    noteGain.gain.setValueAtTime(volume, startTime + duration - release);
    noteGain.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.connect(noteGain);
    noteGain.connect(this.gainNode);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    this.activeOscillators.push({ oscillator, noteGain, endTime: startTime + duration });

    return { oscillator, noteGain };
  }

  /**
   * Stop all notes
   */
  stopAll() {
    const now = this.audioContext.currentTime;
    this.activeOscillators.forEach(({ oscillator }) => {
      try {
        oscillator.stop(now);
      } catch (e) {
        // Already stopped
      }
    });
    this.activeOscillators = [];
    this.isPlaying = false;
  }

  /**
   * Clean up finished oscillators
   */
  cleanup() {
    const now = this.audioContext.currentTime;
    this.activeOscillators = this.activeOscillators.filter(
      ({ endTime }) => endTime > now
    );
  }
}

// ========== MUSIC SYSTEM CLASS ==========

export class MusicSystem {
  constructor(audioContext, masterGain) {
    this.audioContext = audioContext;

    // Create music-specific gain node
    this.musicGain = audioContext.createGain();
    this.musicGain.connect(masterGain || audioContext.destination);
    this.musicGain.gain.value = 0.4; // Music is quieter than SFX

    // Create layers
    this.layers = {
      [MUSIC_LAYERS.BASE]: new MusicLayer(audioContext, this.musicGain, MUSIC_LAYERS.BASE),
      [MUSIC_LAYERS.ACTION]: new MusicLayer(audioContext, this.musicGain, MUSIC_LAYERS.ACTION),
      [MUSIC_LAYERS.BOSS]: new MusicLayer(audioContext, this.musicGain, MUSIC_LAYERS.BOSS),
      [MUSIC_LAYERS.TENSION]: new MusicLayer(audioContext, this.musicGain, MUSIC_LAYERS.TENSION),
    };

    // Current state
    this.currentState = null;
    this.isPlaying = false;
    this.loopInterval = null;

    // Music timing
    this.tempo = 120; // BPM
    this.beatDuration = 60 / this.tempo; // Seconds per beat
    this.barDuration = this.beatDuration * 4; // 4/4 time

    // Current musical time
    this.currentBeat = 0;
    this.currentBar = 0;
  }

  /**
   * Transition to new music state
   */
  transitionTo(newState, fadeTime = 1.5) {
    if (this.currentState === newState) return;

    console.log(`Music transition: ${this.currentState} → ${newState}`);

    const prevState = this.currentState;
    this.currentState = newState;

    // Stop current music with fade out
    if (prevState) {
      this.fadeOutState(prevState, fadeTime);
    }

    // Start new music with fade in
    this.fadeInState(newState, fadeTime);
  }

  /**
   * Fade out music state
   */
  fadeOutState(state, fadeTime) {
    switch (state) {
      case MUSIC_STATES.MENU:
      case MUSIC_STATES.GAMEPLAY_CALM:
        this.layers[MUSIC_LAYERS.BASE].fadeOut(fadeTime);
        break;

      case MUSIC_STATES.GAMEPLAY_ACTION:
        this.layers[MUSIC_LAYERS.BASE].fadeOut(fadeTime);
        this.layers[MUSIC_LAYERS.ACTION].fadeOut(fadeTime);
        break;

      case MUSIC_STATES.BOSS_FIGHT:
        this.layers[MUSIC_LAYERS.BOSS].fadeOut(fadeTime);
        break;

      case MUSIC_STATES.LOW_HP:
        this.layers[MUSIC_LAYERS.TENSION].fadeOut(fadeTime);
        break;

      case MUSIC_STATES.GAME_OVER:
      case MUSIC_STATES.VICTORY:
        Object.values(this.layers).forEach(layer => layer.fadeOut(fadeTime));
        break;
    }
  }

  /**
   * Fade in music state
   */
  fadeInState(state, fadeTime) {
    switch (state) {
      case MUSIC_STATES.MENU:
        this.playMenu();
        this.layers[MUSIC_LAYERS.BASE].fadeIn(fadeTime, 0.25);
        break;

      case MUSIC_STATES.GAMEPLAY_CALM:
        this.playGameplayCalam();
        this.layers[MUSIC_LAYERS.BASE].fadeIn(fadeTime, 0.3);
        break;

      case MUSIC_STATES.GAMEPLAY_ACTION:
        this.playGameplayAction();
        this.layers[MUSIC_LAYERS.BASE].fadeIn(fadeTime, 0.25);
        this.layers[MUSIC_LAYERS.ACTION].fadeIn(fadeTime, 0.35);
        break;

      case MUSIC_STATES.BOSS_FIGHT:
        this.playBossFight();
        this.layers[MUSIC_LAYERS.BOSS].fadeIn(fadeTime, 0.4);
        break;

      case MUSIC_STATES.LOW_HP:
        this.playLowHP();
        this.layers[MUSIC_LAYERS.TENSION].fadeIn(fadeTime, 0.3);
        break;

      case MUSIC_STATES.GAME_OVER:
        this.playGameOver();
        this.layers[MUSIC_LAYERS.BASE].fadeIn(fadeTime, 0.2);
        break;

      case MUSIC_STATES.VICTORY:
        this.playVictory();
        this.layers[MUSIC_LAYERS.BASE].fadeIn(fadeTime, 0.35);
        break;
    }
  }

  /**
   * Play menu music - Calm western ambience
   */
  playMenu() {
    const layer = this.layers[MUSIC_LAYERS.BASE];
    const startTime = this.audioContext.currentTime + 0.1;
    const progression = CHORD_PROGRESSIONS.CLASSIC;

    this.scheduleLoop(() => {
      if (this.currentState !== MUSIC_STATES.MENU) return false;

      const barStart = startTime + (this.currentBar * this.barDuration);
      const chordIndex = this.currentBar % progression.length;
      const rootNote = this.getChordRoot(progression[chordIndex]);

      // Simple arpeggiated chord
      [0, 0.5, 1, 1.5].forEach((beat, i) => {
        const noteTime = barStart + (beat * this.beatDuration);
        const frequency = rootNote * (i % 2 === 0 ? 1 : 1.5);
        layer.playNote(frequency, noteTime, this.beatDuration * 0.4, 'sine', 0.15);
      });

      this.currentBar++;
      return true; // Continue loop
    }, this.barDuration * 1000);
  }

  /**
   * Play calm gameplay music - Light guitar, sparse drums
   */
  playGameplayCalam() {
    const layer = this.layers[MUSIC_LAYERS.BASE];
    const startTime = this.audioContext.currentTime + 0.1;
    const progression = CHORD_PROGRESSIONS.CLASSIC;

    this.scheduleLoop(() => {
      if (![MUSIC_STATES.GAMEPLAY_CALM, MUSIC_STATES.GAMEPLAY_ACTION].includes(this.currentState)) {
        return false;
      }

      const barStart = startTime + (this.currentBar * this.barDuration);
      const chordIndex = this.currentBar % progression.length;
      const rootNote = this.getChordRoot(progression[chordIndex]);

      // Melody notes (pentatonic)
      const melody = [0, 2, 4, 2];
      melody.forEach((scaleIndex, i) => {
        const noteTime = barStart + (i * this.beatDuration);
        const frequency = PENTATONIC_SCALE.A[scaleIndex];
        layer.playNote(frequency, noteTime, this.beatDuration * 0.6, 'triangle', 0.2);
      });

      this.currentBar++;
      return true;
    }, this.barDuration * 1000);
  }

  /**
   * Play action gameplay music - Full drums, faster tempo
   */
  playGameplayAction() {
    const layer = this.layers[MUSIC_LAYERS.ACTION];
    const startTime = this.audioContext.currentTime + 0.1;

    this.scheduleLoop(() => {
      if (this.currentState !== MUSIC_STATES.GAMEPLAY_ACTION) return false;

      const barStart = startTime + (this.currentBar * this.barDuration);

      // Driving rhythm (kick drum simulation)
      [0, 1, 2, 3].forEach((beat) => {
        const noteTime = barStart + (beat * this.beatDuration);
        layer.playNote(80, noteTime, this.beatDuration * 0.2, 'sine', 0.25);
      });

      return true;
    }, this.barDuration * 1000);
  }

  /**
   * Play boss fight music - Intense standoff
   */
  playBossFight() {
    const layer = this.layers[MUSIC_LAYERS.BOSS];
    const startTime = this.audioContext.currentTime + 0.1;
    const progression = CHORD_PROGRESSIONS.DRAMATIC;

    this.scheduleLoop(() => {
      if (this.currentState !== MUSIC_STATES.BOSS_FIGHT) return false;

      const barStart = startTime + (this.currentBar * this.barDuration);
      const chordIndex = this.currentBar % progression.length;
      const rootNote = this.getChordRoot(progression[chordIndex]);

      // Power chord (root + fifth)
      const powerChord = [rootNote, rootNote * 1.5];
      powerChord.forEach((freq) => {
        layer.playNote(freq, barStart, this.barDuration * 0.8, 'sawtooth', 0.2);
      });

      // Fast tremolo rhythm
      [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75].forEach((beat) => {
        const noteTime = barStart + (beat * this.beatDuration);
        layer.playNote(rootNote * 2, noteTime, this.beatDuration * 0.15, 'square', 0.15);
      });

      this.currentBar++;
      return true;
    }, this.barDuration * 1000);
  }

  /**
   * Play low HP tension music - Heartbeat + minor key
   */
  playLowHP() {
    const layer = this.layers[MUSIC_LAYERS.TENSION];
    const startTime = this.audioContext.currentTime + 0.1;
    const heartbeatTempo = 100; // BPM (faster heartbeat)
    const heartbeatDuration = 60 / heartbeatTempo;

    this.scheduleLoop(() => {
      if (this.currentState !== MUSIC_STATES.LOW_HP) return false;

      const beatStart = startTime + (this.currentBeat * heartbeatDuration);

      // Double heartbeat (lub-dub)
      layer.playNote(60, beatStart, heartbeatDuration * 0.3, 'sine', 0.3);
      layer.playNote(50, beatStart + heartbeatDuration * 0.35, heartbeatDuration * 0.2, 'sine', 0.25);

      this.currentBeat++;
      return true;
    }, heartbeatDuration * 1000);
  }

  /**
   * Play game over music - Somber, fade out
   */
  playGameOver() {
    const layer = this.layers[MUSIC_LAYERS.BASE];
    const startTime = this.audioContext.currentTime + 0.1;

    // Descending notes (sad)
    const descendingNotes = [392.00, 329.63, 293.66, 261.63, 220.00]; // G, E, D, C, A

    descendingNotes.forEach((freq, i) => {
      const noteTime = startTime + (i * this.beatDuration * 1.5);
      layer.playNote(freq, noteTime, this.beatDuration * 1.2, 'sine', 0.25);
    });
  }

  /**
   * Play victory music - Triumphant finale
   */
  playVictory() {
    const layer = this.layers[MUSIC_LAYERS.BASE];
    const startTime = this.audioContext.currentTime + 0.1;

    // Triumphant ascending arpeggio
    const triumphantNotes = [220.00, 261.63, 329.63, 392.00, 440.00, 523.25]; // A, C, E, G, A, C

    triumphantNotes.forEach((freq, i) => {
      const noteTime = startTime + (i * this.beatDuration * 0.5);
      layer.playNote(freq, noteTime, this.beatDuration * 0.8, 'sine', 0.3);
    });

    // Final chord (after arpeggio)
    const finalChordTime = startTime + (triumphantNotes.length * this.beatDuration * 0.5);
    [220.00, 261.63, 329.63, 392.00].forEach((freq) => {
      layer.playNote(freq, finalChordTime, this.beatDuration * 3, 'sine', 0.25);
    });
  }

  /**
   * Get root frequency for chord symbol
   */
  getChordRoot(chordSymbol) {
    return PENTATONIC_SCALE.NOTES[chordSymbol] || PENTATONIC_SCALE.ROOT;
  }

  /**
   * Schedule a looping function
   */
  scheduleLoop(fn, intervalMs) {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
    }

    this.currentBar = 0;
    this.currentBeat = 0;

    // Call immediately
    fn();

    // Then schedule repeats
    this.loopInterval = setInterval(() => {
      const shouldContinue = fn();
      if (!shouldContinue) {
        clearInterval(this.loopInterval);
        this.loopInterval = null;
      }
    }, intervalMs);
  }

  /**
   * Set music volume
   */
  setVolume(volume) {
    const now = this.audioContext.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(volume, now + 0.1);
  }

  /**
   * Stop all music
   */
  stopAll() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }

    Object.values(this.layers).forEach(layer => {
      layer.fadeOut(0.5);
      layer.stopAll();
    });

    this.currentState = null;
    this.isPlaying = false;
  }

  /**
   * Update system (call in game loop for cleanup)
   */
  update() {
    Object.values(this.layers).forEach(layer => layer.cleanup());
  }

  /**
   * Destroy music system
   */
  destroy() {
    this.stopAll();
  }
}

// ========== HELPER FUNCTIONS ==========

/**
 * Create music system instance
 */
export function createMusicSystem(audioContext, masterGain) {
  return new MusicSystem(audioContext, masterGain);
}

/**
 * Determine music state from game state
 */
export function getMusicStateFromGame(gameState) {
  // Check for specific conditions
  const hasActiveBoss = gameState.enemies?.some(e => e.isBoss);
  const isLowHP = gameState.player?.hp < (gameState.player?.maxHp * 0.3);
  const enemyCount = gameState.enemies?.length || 0;

  // Priority order (highest priority first)
  if (gameState.gameStatus === 'gameOver') {
    return MUSIC_STATES.GAME_OVER;
  }

  if (gameState.gameStatus === 'victory') {
    return MUSIC_STATES.VICTORY;
  }

  if (gameState.gameStatus === 'menu') {
    return MUSIC_STATES.MENU;
  }

  // In-game states
  if (hasActiveBoss) {
    return MUSIC_STATES.BOSS_FIGHT;
  }

  if (isLowHP && enemyCount > 0) {
    return MUSIC_STATES.LOW_HP;
  }

  if (enemyCount > 5) {
    return MUSIC_STATES.GAMEPLAY_ACTION;
  }

  if (gameState.gameStatus === 'playing') {
    return MUSIC_STATES.GAMEPLAY_CALM;
  }

  return MUSIC_STATES.MENU;
}

// Export all
export default MusicSystem;
