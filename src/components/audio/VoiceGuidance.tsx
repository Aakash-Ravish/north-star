'use client';

import { useEffect, useRef } from 'react';

interface VoiceGuidanceProps {
  phase: 'idle' | 'inhale' | 'hold' | 'exhale' | 'complete';
  enabled: boolean;
  volume?: number;
  voice?: 'calm' | 'gentle' | 'soothing';
}

export default function VoiceGuidance({
  phase,
  enabled,
  volume = 0.6,
  voice = 'gentle'
}: VoiceGuidanceProps) {
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  // Voice guidance texts
  const guidance = {
    inhale: {
      calm: "Breathe in slowly, like Pip taking a deep breath before diving",
      gentle: "Gentle breath in... feel your belly rise like a peaceful wave",
      soothing: "Inhale... drawing in calm energy through your nose"
    },
    hold: {
      calm: "Hold this breath gently, like Pip floating underwater",
      gentle: "Hold peacefully... let this moment be still and quiet",
      soothing: "Hold... feeling the fullness of your breath"
    },
    exhale: {
      calm: "Breathe out slowly, releasing all tension like bubbles rising to the surface",
      gentle: "Gentle exhale... let go of any worries with your breath",
      soothing: "Exhale... releasing and relaxing completely"
    }
  };

  // Voice settings for different moods
  const voiceSettings = {
    calm: {
      rate: 0.7,
      pitch: 1.0,
      voicePreference: ['female', 'english']
    },
    gentle: {
      rate: 0.6,
      pitch: 0.9,
      voicePreference: ['female', 'soft']
    },
    soothing: {
      rate: 0.5,
      pitch: 0.8,
      voicePreference: ['female', 'calm']
    }
  };

  const findBestVoice = (preferences: string[]): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;

    const voices = window.speechSynthesis.getVoices();

    // Look for voices matching preferences
    for (const pref of preferences) {
      const voice = voices.find(v =>
        v.name.toLowerCase().includes(pref) ||
        v.lang.toLowerCase().includes('en')
      );
      if (voice) return voice;
    }

    // Fallback to first available English voice
    return voices.find(v => v.lang.toLowerCase().includes('en')) || voices[0] || null;
  };

  const speak = (text: string) => {
    if (!enabled || !text || isPlayingRef.current) return;

    // Cancel any ongoing speech
    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const settings = voiceSettings[voice];

    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = volume;

    // Set voice if available
    const selectedVoice = findBestVoice(settings.voicePreference);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      isPlayingRef.current = true;
    };

    utterance.onend = () => {
      isPlayingRef.current = false;
    };

    utterance.onerror = () => {
      isPlayingRef.current = false;
      console.warn('Speech synthesis error');
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!enabled) return;

    // Provide voice guidance for breathing phases
    if (phase === 'inhale' || phase === 'hold' || phase === 'exhale') {
      const text = guidance[phase][voice];

      // Small delay to sync with visual animation
      const timer = setTimeout(() => {
        speak(text);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [phase, enabled, voice, volume]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      isPlayingRef.current = false;
    };
  }, []);

  return null; // This is an invisible audio component
}