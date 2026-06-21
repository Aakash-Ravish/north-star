'use client';

import { useState, useEffect } from 'react';
import PipPenguin from '@/components/PipPenguin';
import { User, PipMood } from '@/types';
import { saveToStorage, loadFromStorage, generateId } from '@/utils';

interface GratitudePromptProps {
  user: User;
  onComplete: () => void;
  onBack: () => void;
}

interface GratitudeEntry {
  id: string;
  text: string;
  timestamp: Date;
}

type GratitudeStep = 'intro' | 'prompts' | 'complete';

const gratitudePrompts = [
  "What made you smile today, even for just a moment?",
  "Who in your life are you grateful for right now?",
  "What's something simple that brought you joy recently?",
  "What part of your body are you thankful for today?",
  "What opportunity or experience are you glad you had?",
  "What challenge helped you grow stronger?",
  "What in nature fills you with appreciation?",
  "What skill or ability are you grateful to have?",
  "What memory from this week brings warmth to your heart?",
  "What act of kindness (given or received) touched you recently?"
];

export default function GratitudePrompt({ user, onComplete, onBack }: GratitudePromptProps) {
  const [step, setStep] = useState<GratitudeStep>('intro');
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [pipMood, setPipMood] = useState<PipMood>('happy');
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    // Load existing gratitude entries
    const existingEntries = loadFromStorage(`northstar_gratitude_${user.id}`, []);
    setGratitudeEntries(existingEntries);
  }, [user.id]);

  const startGratitudePractice = () => {
    setStep('prompts');
    setPipMood('calm');
    // Randomize the first prompt
    setCurrentPrompt(Math.floor(Math.random() * gratitudePrompts.length));
  };

  const saveGratitudeEntry = () => {
    if (!currentText.trim()) return;

    const newEntry: GratitudeEntry = {
      id: generateId(),
      text: currentText.trim(),
      timestamp: new Date()
    };

    const updatedEntries = [newEntry, ...gratitudeEntries];
    setGratitudeEntries(updatedEntries);
    saveToStorage(`northstar_gratitude_${user.id}`, updatedEntries);

    setCurrentText('');

    if (gratitudeEntries.length >= 2) {
      setStep('complete');
      setPipMood('playful');
    } else {
      // Show next prompt
      const nextPrompt = (currentPrompt + 1) % gratitudePrompts.length;
      setCurrentPrompt(nextPrompt);
      setPipMood('happy');
    }
  };

  const skipPrompt = () => {
    const nextPrompt = (currentPrompt + 1) % gratitudePrompts.length;
    setCurrentPrompt(nextPrompt);
  };

  const shareGratitude = async () => {
    if (gratitudeEntries.length === 0) return;

    setIsSharing(true);
    try {
      // Create a beautiful gratitude moment to share
      const recentGratitude = gratitudeEntries[0].text;
      const shareText = `💙 Grateful for: "${recentGratitude}" - Taking a moment with my penguin friend Pip to appreciate life's gifts! 🐧✨ #Gratitude #MentalWellness #NorthStar`;

      if (navigator.share) {
        await navigator.share({
          title: 'My Gratitude Moment',
          text: shareText,
          url: window.location.origin
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(shareText);
        alert('Gratitude moment copied to clipboard! 📋✨');
      }
    } catch (error) {
      console.log('Sharing not available, but gratitude saved! 💙');
    }
    setIsSharing(false);
  };

  const getPenguinWisdom = () => {
    const wisdom = [
      "Penguins huddle together for warmth - they're grateful for their community! 🐧",
      "Even in the coldest Antarctic, penguins find joy in sliding on the ice! ⛸️",
      "Penguins take care of their eggs with incredible patience - they appreciate the gift of life! 🥚",
      "When penguins dive deep, they're grateful for the abundance of fish in the ocean! 🐟",
      "Penguins celebrate together when they return from hunting - gratitude shared is joy doubled! 🎉"
    ];
    return wisdom[Math.floor(Math.random() * wisdom.length)];
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="absolute top-8 left-8 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Gratitude Practice with Pip
          </h1>
        </div>

        {/* Pip Animation */}
        <div className="text-center mb-8">
          <PipPenguin
            size="lg"
            mood={pipMood}
            className="mx-auto"
          />
        </div>

        {/* Intro Step */}
        {step === 'intro' && (
          <div className="text-center space-y-6">
            <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                🌟 Welcome to Gratitude Time!
              </h3>
              <p className="text-yellow-700 mb-4">
                Hi {user.name}! Pip wants to help you discover the joy of gratitude.
                Research shows that gratitude practice can improve mood and overall well-being.
              </p>
              <p className="text-yellow-700">
                We'll share a few gentle prompts. Take your time with each one! 🐧💙
              </p>
            </div>

            <button
              onClick={startGratitudePractice}
              className="btn-primary text-lg px-8 py-4"
            >
              Start Gratitude Practice 🙏
            </button>

            {/* Show recent gratitude count */}
            {gratitudeEntries.length > 0 && (
              <div className="text-sm text-gray-600">
                You've shared {gratitudeEntries.length} gratitude moment{gratitudeEntries.length !== 1 ? 's' : ''} with Pip! 💙
              </div>
            )}
          </div>
        )}

        {/* Prompts Step */}
        {step === 'prompts' && (
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex justify-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < gratitudeEntries.length ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Current prompt */}
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🐧 Pip asks:
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {gratitudePrompts[currentPrompt]}
              </p>

              <textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Share what comes to mind... there's no wrong answer! 💙"
                className="w-full p-4 border-2 border-green-300 rounded-xl focus:border-green-500 focus:outline-none resize-none"
                rows={3}
                maxLength={280}
              />

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">
                  {280 - currentText.length} characters left
                </span>
                <span className="text-sm text-gray-500">
                  {gratitudeEntries.length}/3 shared
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={skipPrompt}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Different Question
              </button>
              <button
                onClick={saveGratitudeEntry}
                disabled={!currentText.trim()}
                className="flex-1 btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Share with Pip 💙
              </button>
            </div>

            {/* Penguin wisdom */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700 text-center">
                💡 {getPenguinWisdom()}
              </p>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Beautiful gratitude practice, {user.name}!
            </h3>

            <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <p className="text-gray-700 mb-4">
                Pip is so proud of you for taking time to appreciate life's gifts!
                Your grateful heart makes the world a little brighter! 🌟
              </p>
              <p className="text-sm text-gray-600">
                Studies show that regular gratitude practice can increase happiness
                by up to 25%. You're investing in your wellbeing! 🐧💙
              </p>
            </div>

            {/* Recent gratitude entries */}
            {gratitudeEntries.length > 0 && (
              <div className="text-left p-4 bg-white rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Your Recent Gratitude:</h4>
                <div className="space-y-2">
                  {gratitudeEntries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="text-sm text-gray-600 border-l-4 border-green-400 pl-3">
                      "{entry.text}"
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={shareGratitude}
                disabled={isSharing || gratitudeEntries.length === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50"
              >
                {isSharing ? 'Sharing...' : 'Share Gratitude 🌟'}
              </button>
              <button
                onClick={onComplete}
                className="flex-1 btn-primary px-6 py-3"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}