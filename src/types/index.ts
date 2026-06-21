// Core types for the North Star app
export interface User {
  id: string;
  name: string;
  joinReason: string;
  preferredTone: PipTone;
  createdAt: Date;
  lastActive: Date;
  streak: number;
}

export type PipTone = 'cheerful' | 'calm' | 'supportive' | 'playful';

export type NotificationStyle = 'stoic' | 'motivational' | 'funny' | 'gentle' | 'random';

export type NotificationTime = 'morning' | 'afternoon' | 'evening';

export interface NotificationSettings {
  enabled: boolean;
  style: NotificationStyle;
  preferredTime: NotificationTime;
  subscribed: boolean;
  subscription?: PushSubscription | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'pip';
  timestamp: Date;
  mood?: MoodLevel;
  type: 'text' | 'voice' | 'mood-check';
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type PipMood = 'happy' | 'sad' | 'calm' | 'playful' | 'concerned';

export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodLevel;
  note?: string;
  timestamp: Date;
  tags?: string[];
  activities?: string[];
}

export interface OnboardingStep {
  step: number;
  title: string;
  subtitle?: string;
  completed: boolean;
}

export interface PipAnimation {
  state: 'idle' | 'talking' | 'listening' | 'thinking' | 'happy' | 'concerned';
  duration?: number;
}

export interface VoiceSettings {
  enabled: boolean;
  autoPlay: boolean;
  speed: number;
  volume: number;
}

export interface AppSettings {
  darkMode: boolean;
  notifications: NotificationSettings;
  voice: VoiceSettings;
  pipPersonality: PipTone;
}

export interface JournalPrompt {
  id: string;
  title: string;
  question: string;
  category: 'reflection' | 'gratitude' | 'goals' | 'feelings';
}

export interface Streak {
  current: number;
  longest: number;
  lastDate: Date;
  lastVisit: Date;
  milestoneReached?: number;
}

export interface DailyQuote {
  quote: string;
  date: string;
  tone: string;
  generated: boolean;
  fallback?: boolean;
}

// Component props interfaces
export interface PipPenguinProps {
  mood?: PipMood;
  speaking?: boolean;
  volume?: number; // 0-1 range
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface ChatBubbleProps {
  message: ChatMessage;
  isTyping?: boolean;
  showAvatar?: boolean;
  onRetry?: () => void;
  onShare?: (message: ChatMessage) => void;
}

export interface MoodPickerProps {
  currentMood?: MoodLevel;
  onMoodSelect: (mood: MoodLevel) => void;
  disabled?: boolean;
  showLabels?: boolean;
}

export interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface SpeechSettings {
  enabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
  voice?: SpeechSynthesisVoice;
}

export interface StreakCounterProps {
  streak: Streak;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
