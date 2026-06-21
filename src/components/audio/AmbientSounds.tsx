'use client';

import { useEffect, useRef, useState } from 'react';

interface AmbientSoundsProps {
  isPlaying: boolean;
  soundType: 'water' | 'ocean' | 'rain' | 'forest';
  volume?: number;
  onLoadComplete?: () => void;
}

export default function AmbientSounds({
  isPlaying,
  soundType,
  volume = 0.3,
  onLoadComplete
}: AmbientSoundsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sound URLs - using royalty-free/creative commons sounds or web audio API
  const soundUrls = {
    water: '/audio/ambient/flowing-water.mp3',
    ocean: '/audio/ambient/gentle-waves.mp3',
    rain: '/audio/ambient/soft-rain.mp3',
    forest: '/audio/ambient/forest-ambience.mp3'
  };

  // Create synthetic ambient sounds using Web Audio API as fallback
  const createSyntheticAmbient = (type: string): AudioBuffer | null => {
    if (typeof window === 'undefined') return null;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 10; // 10 seconds loop
      const sampleRate = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
      const data = buffer.getChannelData(0);

      switch (type) {
        case 'water':
          // Generate flowing water sound using pink noise with filtering
          for (let i = 0; i < data.length; i++) {
            const pink = Math.random() * 2 - 1;
            const flow = Math.sin(i * 0.001) * 0.3;
            data[i] = (pink * 0.1 + flow * 0.2) * Math.sin(i * 0.0005);
          }
          break;

        case 'ocean':
          // Generate gentle wave sounds
          for (let i = 0; i < data.length; i++) {
            const wave = Math.sin(i * 0.0008) * Math.sin(i * 0.00003);
            const noise = (Math.random() * 2 - 1) * 0.1;
            data[i] = wave * 0.3 + noise;
          }
          break;
      }

      return buffer;
    } catch (error) {
      console.error('Failed to create synthetic ambient sound:', error);
      return null;
    }
  };

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Try to load actual audio file first
    audio.src = soundUrls[soundType];
    audio.loop = true;
    audio.volume = volume;
    audio.preload = 'auto';

    const handleLoad = () => {
      setIsLoaded(true);
      setError(null);
      onLoadComplete?.();
    };

    const handleError = () => {
      console.warn(`Failed to load ${soundType} audio, using synthetic fallback`);
      setError(`Audio file not found, using synthetic ${soundType} sound`);

      // Create synthetic ambient sound as fallback
      const syntheticBuffer = createSyntheticAmbient(soundType);
      if (syntheticBuffer && typeof window !== 'undefined') {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContext.createBufferSource();
          const gainNode = audioContext.createGain();

          source.buffer = syntheticBuffer;
          source.loop = true;
          gainNode.gain.value = volume;

          source.connect(gainNode);
          gainNode.connect(audioContext.destination);

          // Store reference for play/pause control
          (audio as any).syntheticSource = source;
          (audio as any).syntheticGain = gainNode;
          (audio as any).audioContext = audioContext;
        } catch (synthError) {
          console.error('Failed to create synthetic audio:', synthError);
        }
      }

      setIsLoaded(true);
      onLoadComplete?.();
    };

    audio.addEventListener('canplaythrough', handleLoad);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplaythrough', handleLoad);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, [soundType, volume, onLoadComplete]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    if (isPlaying) {
      // Try to play actual audio first
      audio.play().catch(() => {
        // If actual audio fails, try synthetic
        const syntheticSource = (audio as any).syntheticSource;
        const audioContext = (audio as any).audioContext;

        if (syntheticSource && audioContext) {
          audioContext.resume().then(() => {
            syntheticSource.start();
          }).catch(console.error);
        }
      });
    } else {
      audio.pause();

      // Stop synthetic audio too
      const syntheticSource = (audio as any).syntheticSource;
      const audioContext = (audio as any).audioContext;

      if (syntheticSource && audioContext) {
        syntheticSource.stop();
        audioContext.suspend();
      }
    }
  }, [isPlaying, isLoaded]);

  // Update volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;

      const gainNode = (audio as any).syntheticGain;
      if (gainNode) {
        gainNode.gain.value = volume;
      }
    }
  }, [volume]);

  return null; // This is an invisible audio component
}