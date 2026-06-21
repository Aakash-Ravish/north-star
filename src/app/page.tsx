'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PipPenguin from '@/components/PipPenguin';
import { loadFromStorage } from '@/utils';

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);

  useEffect(() => {
    // Check if user has already completed onboarding
    const user = loadFromStorage('northstar_user', null);
    if (user) {
      router.push('/chat');
      return;
    }

    // Animate elements on load
    setIsLoaded(true);
    setTimeout(() => setShowGetStarted(true), 1500);
  }, [router]);

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-50 animate-pulse-gentle" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-100 rounded-full opacity-50 animate-pulse-gentle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-50 rounded-full opacity-30 animate-pulse-gentle" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">

        {/* Logo and Pip */}
        <div className={`mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <PipPenguin
            size="xl"
            mood="playful"
            className="mb-6"
          />

          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              North Star
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
            Meet <span className="font-semibold text-blue-600">Pip</span>, your friendly penguin companion on your mental health journey
          </p>
        </div>

        {/* Features */}
        <div className={`grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="card text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Safe Conversations</h3>
            <p className="text-gray-600">
              Chat with Pip in a judgment-free space designed for your comfort and growth
            </p>
          </div>

          <div className="card text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Mood Tracking</h3>
            <p className="text-gray-600">
              Keep track of your emotional journey with simple, visual mood logging
            </p>
          </div>

          <div className="card text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Build Habits</h3>
            <p className="text-gray-600">
              Develop healthy daily routines with encouragement and streak tracking
            </p>
          </div>
        </div>

        {/* Call to action */}
        {showGetStarted && (
          <div className="animate-slide-in-up">
            <button
              onClick={handleGetStarted}
              className="btn-primary btn-attention btn-floating btn-call-to-action text-lg px-8 py-4 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Start Your Journey with Pip
              <span className="ml-2 animate-wiggle">🐧✨</span>
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Free • No account • Your history stays on your device
            </p>
            <p className="text-xs text-gray-500 mt-3 max-w-md mx-auto">
              Pip is a friendly AI companion, not a therapist or crisis service, and
              isn&apos;t a substitute for professional care. If you&apos;re struggling, reach a
              trained human at{" "}
              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-600"
              >
                findahelpline.com
              </a>
              , or call your local emergency number if you&apos;re in immediate danger.
            </p>
          </div>
        )}

        {/* Bottom decorative elements */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 opacity-30">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>

      {/* Floating elements for visual interest */}
      <div className="absolute top-20 left-20 text-2xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>💙</div>
      <div className="absolute top-40 right-20 text-xl opacity-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🌟</div>
      <div className="absolute bottom-40 left-10 text-lg opacity-20 animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}>✨</div>
      <div className="absolute bottom-20 right-40 text-xl opacity-20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>🌈</div>
    </div>
  );
}
