'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PipPenguin from '@/components/PipPenguin';
import BreathingExercise from '@/components/activities/BreathingExercise';
import GratitudePrompt from '@/components/activities/GratitudePrompt';
import MindfulnessMoment from '@/components/activities/MindfulnessMoment';
import { User, PipMood } from '@/types';
import { loadFromStorage } from '@/utils';
import { useUmamiTracking } from '@/components/analytics/UmamiAnalytics';

type ActivityType = 'breathing' | 'gratitude' | 'mindfulness' | null;

export default function ActivitiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(null);
  const [pipMood, setPipMood] = useState<PipMood>('happy');

  // Analytics tracking
  const { trackWellnessEvent } = useUmamiTracking();

  useEffect(() => {
    // Check if user exists, redirect to onboarding if not
    const userData = loadFromStorage<User | null>('northstar_user', null);
    if (!userData) {
      router.push('/onboarding');
      return;
    }
    setUser(userData);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (selectedActivity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {selectedActivity === 'breathing' && (
          <BreathingExercise
            user={user}
            onComplete={() => setSelectedActivity(null)}
            onBack={() => setSelectedActivity(null)}
          />
        )}
        {selectedActivity === 'gratitude' && (
          <GratitudePrompt
            user={user}
            onComplete={() => setSelectedActivity(null)}
            onBack={() => setSelectedActivity(null)}
          />
        )}
        {selectedActivity === 'mindfulness' && (
          <MindfulnessMoment
            user={user}
            onComplete={() => setSelectedActivity(null)}
            onBack={() => setSelectedActivity(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/chat')}
            className="absolute top-8 left-8 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="mb-6">
            <PipPenguin
              size="lg"
              mood={pipMood}
              className="mx-auto mb-4"
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Wellness Activities with Pip
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Let's take a few minutes for your mental wellness. Pip is here to guide you! 🐧💙
          </p>
        </div>

        {/* Activity Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">

          {/* Breathing Exercise */}
          <div
            onClick={() => {
              setSelectedActivity('breathing');
              trackWellnessEvent('breathing');
            }}
            className="card p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 group animate-button-breathe btn-floating"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-blue-500 group-hover:to-blue-600 transition-all">
                <span className="text-3xl">🫁</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Penguin Breathing
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn to breathe like a penguin diving deep. Calm your mind in just 3 minutes.
              </p>
              <div className="text-xs text-blue-600 font-medium">
                ⏱️ 3-5 minutes • Reduces stress
              </div>
            </div>
          </div>

          {/* Gratitude Practice */}
          <div
            onClick={() => {
              setSelectedActivity('gratitude');
              trackWellnessEvent('gratitude');
            }}
            className="card p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 group animate-button-pulse btn-floating"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-green-500 group-hover:to-green-600 transition-all">
                <span className="text-3xl">🙏</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Gratitude with Pip
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Discover what penguins are grateful for, and find your own moments of joy.
              </p>
              <div className="text-xs text-green-600 font-medium">
                ⏱️ 2-3 minutes • Boosts positivity
              </div>
            </div>
          </div>

          {/* Mindfulness */}
          <div
            onClick={() => {
              setSelectedActivity('mindfulness');
              trackWellnessEvent('mindfulness');
            }}
            className="card p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 group animate-button-glow btn-floating"
            style={{ animationDelay: '1s' }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-purple-500 group-hover:to-purple-600 transition-all">
                <span className="text-3xl">🧘</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Antarctic Mindfulness
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Find peace in the present moment, just like penguins on the ice.
              </p>
              <div className="text-xs text-purple-600 font-medium">
                ⏱️ 2-4 minutes • Increases focus
              </div>
            </div>
          </div>
        </div>

        {/* Daily Tip */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Pip's Daily Wellness Tip
                </h4>
                <p className="text-yellow-700 text-sm">
                  Even penguins take time to rest! Just 5 minutes of mindful activity can improve your whole day.
                  Try one activity now, and remember - small steps lead to big changes! 🐧✨
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm mb-4">Quick navigation</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/chat')}
              className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
            >
              💬 Chat with Pip
            </button>
            <button
              onClick={() => router.push('/journal')}
              className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
            >
              📊 View Journal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}