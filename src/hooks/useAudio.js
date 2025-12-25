import { useRef, useCallback, useState } from 'react';

/**
 * Audio management hook
 */
export function useAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const soundsRef = useRef({});
  const musicRef = useRef(null);

  /**
   * Load and cache a sound effect
   */
  const loadSound = useCallback((name, url) => {
    const audio = new Audio(url);
    audio.volume = volume;
    soundsRef.current[name] = audio;
  }, [volume]);

  /**
   * Play a sound effect
   */
  const playSound = useCallback(
    (name, volumeOverride = null) => {
      if (isMuted) return;

      const sound = soundsRef.current[name];
      if (sound) {
        // Clone the audio to allow overlapping sounds
        const soundClone = sound.cloneNode();
        soundClone.volume = volumeOverride !== null ? volumeOverride : volume;
        soundClone.play().catch((err) => {
          console.warn(`Failed to play sound ${name}:`, err);
        });
      }
    },
    [isMuted, volume]
  );

  /**
   * Play background music
   */
  const playMusic = useCallback(
    (url, loop = true) => {
      if (isMuted) return;

      if (musicRef.current) {
        musicRef.current.pause();
      }

      musicRef.current = new Audio(url);
      musicRef.current.volume = volume * 0.5; // Music quieter than SFX
      musicRef.current.loop = loop;
      musicRef.current.play().catch((err) => {
        console.warn('Failed to play music:', err);
      });
    },
    [isMuted, volume]
  );

  /**
   * Stop background music
   */
  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  }, []);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    if (musicRef.current) {
      musicRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  /**
   * Update volume
   */
  const updateVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);

    // Update all cached sounds
    Object.values(soundsRef.current).forEach((sound) => {
      sound.volume = clampedVolume;
    });

    // Update music
    if (musicRef.current) {
      musicRef.current.volume = clampedVolume * 0.5;
    }
  }, []);

  return {
    isMuted,
    volume,
    loadSound,
    playSound,
    playMusic,
    stopMusic,
    toggleMute,
    updateVolume,
  };
}
