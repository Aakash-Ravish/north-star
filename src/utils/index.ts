import { MoodLevel, PipTone, MoodEntry, PipMood } from '@/types';

// Mood utilities
export const getMoodEmoji = (mood: MoodLevel): string => {
  const moodEmojis = {
    1: '😔',
    2: '😕',
    3: '😐',
    4: '😊',
    5: '😄'
  };
  return moodEmojis[mood];
};

export const getMoodColor = (mood: MoodLevel): string => {
  const moodColors = {
    1: '#EF4444', // red-500
    2: '#F97316', // orange-500
    3: '#EAB308', // yellow-500
    4: '#22C55E', // green-500
    5: '#10B981'  // emerald-500
  };
  return moodColors[mood];
};

export const getMoodLabel = (mood: MoodLevel): string => {
  const moodLabels = {
    1: 'Very Low',
    2: 'Low',
    3: 'Okay',
    4: 'Good',
    5: 'Excellent'
  };
  return moodLabels[mood];
};

// Pip mood utilities
export const getPipMoodFromLevel = (level: MoodLevel): PipMood => {
  const moodMapping = {
    1: 'sad',
    2: 'concerned',
    3: 'calm',
    4: 'happy',
    5: 'playful'
  } as const;
  return moodMapping[level];
};

export const getMoodLevelFromPip = (pipMood: PipMood): MoodLevel => {
  const levelMapping = {
    'sad': 1,
    'concerned': 2,
    'calm': 3,
    'happy': 4,
    'playful': 5
  } as const;
  return levelMapping[pipMood];
};

export const getPipMoodColor = (mood: PipMood): string => {
  const moodColors = {
    'happy': '#4ADE80',      // green-400
    'sad': '#60A5FA',        // blue-400
    'calm': '#A78BFA',       // violet-400
    'playful': '#FDE047',    // yellow-300
    'concerned': '#C084FC'   // purple-400
  };
  return moodColors[mood];
};

export const getPipMoodEmoji = (mood: PipMood): string => {
  const moodEmojis = {
    'happy': '😊',
    'sad': '😢',
    'calm': '😌',
    'playful': '😄',
    'concerned': '😟'
  };
  return moodEmojis[mood];
};

// Date utilities
export const formatDate = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const isToday = (date: Date | string): boolean => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

export const isYesterday = (date: Date | string): boolean => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateObj.toDateString() === yesterday.toDateString();
};

export const getRelativeTime = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isToday(dateObj)) return 'Today';
  if (isYesterday(dateObj)) return 'Yesterday';

  const diffTime = Math.abs(new Date().getTime() - dateObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
};

// Pip personality utilities
export const getPipResponse = (tone: PipTone, context: 'greeting' | 'encouragement' | 'concern' | 'celebration'): string => {
  const responses = {
    cheerful: {
      greeting: "Hi there! I'm Pip, and I'm so excited to be here with you today! 🐧✨",
      encouragement: "You're doing amazing! Every small step forward is worth celebrating! 🌟",
      concern: "I'm here for you, friend. It's okay to have tough days - we'll get through this together! 💙",
      celebration: "Woohoo! That's fantastic news! I'm doing a little penguin dance for you! 🎉"
    },
    calm: {
      greeting: "Hello there. I'm Pip, your peaceful companion. I'm here to listen and support you. 🐧💙",
      encouragement: "Take things one moment at a time. You have more strength than you realize.",
      concern: "I sense you might be struggling. That's completely okay. Let's take this slowly together.",
      celebration: "That's wonderful. Take a moment to appreciate this positive step in your journey."
    },
    supportive: {
      greeting: "Hello! I'm Pip, and I'm honored to be part of your wellness journey. You're not alone. 🐧❤️",
      encouragement: "I believe in you. Every challenge you face is an opportunity to grow stronger.",
      concern: "I want you to know that your feelings are valid. I'm here to support you through this.",
      celebration: "I'm so proud of you! This achievement shows your resilience and determination."
    },
    playful: {
      greeting: "Hey hey! Pip the penguin here! Ready for some fun adventures in feeling good? 🐧🎮",
      encouragement: "You're like a superhero in training! Every day you're leveling up your awesome skills! 💫",
      concern: "Even superheroes have tough days! But guess what? We make a great team! 🦸‍♀️🐧",
      celebration: "YASSS! Time for the penguin victory waddle! You absolutely nailed it! 🏆🐧"
    }
  };

  return responses[tone][context];
};

// Mood analytics utilities
export const calculateAverageMood = (entries: MoodEntry[]): number => {
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, entry) => sum + entry.mood, 0);
  return Math.round((total / entries.length) * 10) / 10;
};

export const getMoodTrend = (entries: MoodEntry[]): 'improving' | 'declining' | 'stable' => {
  if (entries.length < 2) return 'stable';

  const recent = entries.slice(-7); // Last 7 entries
  const older = entries.slice(-14, -7); // Previous 7 entries

  if (older.length === 0) return 'stable';

  const recentAvg = calculateAverageMood(recent);
  const olderAvg = calculateAverageMood(older);

  const difference = recentAvg - olderAvg;

  if (difference > 0.3) return 'improving';
  if (difference < -0.3) return 'declining';
  return 'stable';
};

// Local storage utilities
export const saveToStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// ID generation utility
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Daily quote utilities
export interface DailyQuote {
  quote: string;
  date: string;
  tone: string;
  generated: boolean;
  fallback?: boolean;
}

export const getDailyQuote = async (userTone: string): Promise<DailyQuote> => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const cacheKey = 'northstar_daily_quote';

  try {
    // Check for cached quote
    const cached = loadFromStorage<DailyQuote | null>(cacheKey, null);
    if (cached && cached.date === today) {
      return cached;
    }

    // Fetch new quote from API
    const response = await fetch(`/api/quote?tone=${userTone}`);
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }

    const quoteData: DailyQuote = await response.json();

    // Cache the new quote
    saveToStorage(cacheKey, quoteData);

    return quoteData;
  } catch (error) {
    console.error('Error fetching daily quote:', error);

    // Return fallback quote
    const fallbackQuotes = {
      cheerful: "Every new day is a fresh chance to spread your wings and soar! You've got this! 🐧✨",
      calm: "Take a deep breath and remember: you're exactly where you need to be right now. 🌊💙",
      supportive: "You're braver than you believe and stronger than you seem. I'm here cheering you on! 🤗💕",
      playful: "Time to waddle into this day with confidence! Let's make some waves together! 🐧🌊"
    };

    const fallbackQuote: DailyQuote = {
      quote: fallbackQuotes[userTone as keyof typeof fallbackQuotes] || fallbackQuotes.cheerful,
      date: today,
      tone: userTone,
      generated: false,
      fallback: true
    };

    // Cache the fallback
    saveToStorage(cacheKey, fallbackQuote);

    return fallbackQuote;
  }
};

// Validation utilities
export const isValidMood = (mood: any): mood is MoodLevel => {
  return typeof mood === 'number' && mood >= 1 && mood <= 5;
};

export const isValidTone = (tone: any): tone is PipTone => {
  return ['cheerful', 'calm', 'supportive', 'playful'].includes(tone);
};

export const isValidPipMood = (mood: any): mood is PipMood => {
  return ['happy', 'sad', 'calm', 'playful', 'concerned'].includes(mood);
};

// Streak utilities
export const calculateStreak = (lastVisitDate: Date | string): { current: number; shouldReset: boolean; isConsecutive: boolean } => {
  const lastVisit = lastVisitDate instanceof Date ? lastVisitDate : new Date(lastVisitDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Normalize dates to compare just the date part
  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();
  const lastVisitStr = lastVisit.toDateString();

  if (lastVisitStr === todayStr) {
    // Already visited today, maintain streak
    return { current: 0, shouldReset: false, isConsecutive: false };
  } else if (lastVisitStr === yesterdayStr) {
    // Visited yesterday, increment streak
    return { current: 1, shouldReset: false, isConsecutive: true };
  } else {
    // Missed days, reset streak
    return { current: 1, shouldReset: true, isConsecutive: false };
  }
};

export const getStreakMilestones = () => [3, 7, 14, 30, 60, 100];

export const isStreakMilestone = (streak: number): boolean => {
  return getStreakMilestones().includes(streak);
};

export const getStreakEmoji = (streak: number): string => {
  if (streak >= 100) return '🏆';
  if (streak >= 60) return '👑';
  if (streak >= 30) return '⭐';
  if (streak >= 14) return '🔥';
  if (streak >= 7) return '💪';
  if (streak >= 3) return '🌟';
  return '🌱';
};

export const getStreakMessage = (streak: number): string => {
  if (streak >= 100) return 'LEGENDARY! You\'re a wellness champion! 🏆';
  if (streak >= 60) return 'Incredible dedication! You\'re unstoppable! 👑';
  if (streak >= 30) return 'Amazing! A full month of self-care! ⭐';
  if (streak >= 14) return 'You\'re on fire! Two weeks strong! 🔥';
  if (streak >= 7) return 'One week streak! You\'re building great habits! 💪';
  if (streak >= 3) return 'Three days in a row! You\'re getting the hang of this! 🌟';
  return 'Every journey starts with a single step! 🌱';
};

// Animation utilities
export const getRandomDelay = (min: number = 0, max: number = 1000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
};

// Speech synthesis utilities
export const isSpeechSynthesisSupported = (): boolean => {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!isSpeechSynthesisSupported()) return [];
  return speechSynthesis.getVoices();
};

export const findBestVoice = (preferredGender: 'female' | 'male' = 'female'): SpeechSynthesisVoice | null => {
  const voices = getAvailableVoices();

  // Look for English voices first
  const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));

  // Prioritize Google UK English Female and other premium voices
  const premiumFemaleVoices = englishVoices.filter(voice => {
    const name = voice.name.toLowerCase();
    return (
      name.includes('google uk english female') ||
      name.includes('google uk') && name.includes('female') ||
      name.includes('google') && name.includes('female') ||
      name.includes('samantha') ||
      name.includes('victoria') ||
      name.includes('karen') ||
      name.includes('susan') ||
      name.includes('female') ||
      name.includes('woman')
    );
  });

  // Prefer male voices for male preference
  const maleVoices = englishVoices.filter(voice =>
    voice.name.toLowerCase().includes('male') ||
    voice.name.toLowerCase().includes('man') ||
    voice.name.toLowerCase().includes('daniel') ||
    voice.name.toLowerCase().includes('alex')
  );

  if (preferredGender === 'female' && premiumFemaleVoices.length > 0) {
    // Sort to prefer Google voices
    premiumFemaleVoices.sort((a, b) => {
      if (a.name.toLowerCase().includes('google') && !b.name.toLowerCase().includes('google')) return -1;
      if (!a.name.toLowerCase().includes('google') && b.name.toLowerCase().includes('google')) return 1;
      return 0;
    });
    return premiumFemaleVoices[0];
  }

  if (preferredGender === 'male' && maleVoices.length > 0) {
    return maleVoices[0];
  }

  // Fallback to any English voice
  if (englishVoices.length > 0) {
    return englishVoices[0];
  }

  // Last resort: any available voice
  return voices.length > 0 ? voices[0] : null;
};

interface SpeechOptions extends Partial<SpeechSynthesisUtterance> {
  onVolumeChange?: (volume: number) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export const speakText = (text: string, options: SpeechOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isSpeechSynthesisSupported()) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set default options for a soft, pleasant voice (Pip's voice)
    utterance.rate = options.rate || 0.85; // Slightly slower for warm, friendly feel
    utterance.pitch = options.pitch || 1.15; // Slightly higher for cuteness
    utterance.volume = options.volume || 0.75; // Moderate volume

    // Try to use the best female voice (Google UK English Female preferred)
    const voice = options.voice || findBestVoice('female');
    if (voice) {
      utterance.voice = voice;
    }

    // Volume simulation for mouth animation
    let volumeSimulation: NodeJS.Timeout | null = null;

    utterance.onstart = () => {
      options.onStart?.();

      // Simulate volume changes during speech for mouth animation
      if (options.onVolumeChange) {
        volumeSimulation = setInterval(() => {
          // Simulate natural speech volume patterns (0.3-0.9 range)
          const baseVolume = 0.5;
          const variation = 0.4 * (Math.random() - 0.5); // ±0.2
          const naturalPause = Math.random() < 0.15 ? 0.1 : 0; // 15% chance of brief pause
          const volume = Math.max(0.1, baseVolume + variation - naturalPause);
          options.onVolumeChange?.(volume);
        }, 100); // Update 10 times per second for smooth animation
      }
    };

    utterance.onend = () => {
      if (volumeSimulation) {
        clearInterval(volumeSimulation);
        options.onVolumeChange?.(0); // Reset volume
      }
      options.onEnd?.();
      resolve();
    };

    utterance.onerror = (event) => {
      if (volumeSimulation) {
        clearInterval(volumeSimulation);
        options.onVolumeChange?.(0); // Reset volume
      }
      options.onEnd?.();
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    speechSynthesis.speak(utterance);
  });
};

export const stopSpeaking = (): void => {
  if (isSpeechSynthesisSupported()) {
    speechSynthesis.cancel();
  }
};

// Export the interface for use in components
export type { SpeechOptions };

// Voice settings utilities
export const getVoiceSettings = () => {
  return loadFromStorage('northstar_voice_enabled', false);
};

export const setVoiceSettings = (enabled: boolean) => {
  saveToStorage('northstar_voice_enabled', enabled);
};