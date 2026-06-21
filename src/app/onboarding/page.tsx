'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PipPenguin from '@/components/PipPenguin';
import { PipTone } from '@/types';
import { saveToStorage, generateId, getPipResponse } from '@/utils';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [joinReason, setJoinReason] = useState('');
  const [preferredTone, setPreferredTone] = useState<PipTone>('cheerful');
  const [isCompleting, setIsCompleting] = useState(false);

  const joinReasons = [
    { id: 'stress', label: 'Managing stress and anxiety', icon: '🧘‍♀️' },
    { id: 'mood', label: 'Understanding my emotions', icon: '💭' },
    { id: 'habits', label: 'Building healthy habits', icon: '🌱' },
    { id: 'support', label: 'Having someone to talk to', icon: '🤗' },
    { id: 'growth', label: 'Personal growth and reflection', icon: '✨' },
    { id: 'other', label: 'Just curious to try it out', icon: '🤔' }
  ];

  const tones: { id: PipTone; label: string; description: string; preview: string }[] = [
    {
      id: 'cheerful',
      label: 'Cheerful & Upbeat',
      description: 'Energetic, positive, and encouraging',
      preview: getPipResponse('cheerful', 'greeting')
    },
    {
      id: 'calm',
      label: 'Calm & Peaceful',
      description: 'Gentle, soothing, and mindful',
      preview: getPipResponse('calm', 'greeting')
    },
    {
      id: 'supportive',
      label: 'Supportive & Caring',
      description: 'Empathetic, understanding, and nurturing',
      preview: getPipResponse('supportive', 'greeting')
    },
    {
      id: 'playful',
      label: 'Playful & Fun',
      description: 'Light-hearted, humorous, and energetic',
      preview: getPipResponse('playful', 'greeting')
    }
  ];

  const canProceed = () => {
    if (currentStep === 1) return name.trim().length > 0;
    if (currentStep === 2) return joinReason.length > 0;
    if (currentStep === 3) return true;
    return false;
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      setIsCompleting(true);

      const user = {
        id: generateId(),
        name: name.trim(),
        joinReason,
        preferredTone,
        createdAt: new Date(),
        lastActive: new Date(),
        streak: 0
      };

      // Save user to localStorage
      saveToStorage('northstar_user', user);
      saveToStorage('northstar_settings', {
        darkMode: false,
        notifications: true,
        voice: {
          enabled: true,
          autoPlay: false,
          speed: 1,
          volume: 0.7
        },
        pipPersonality: preferredTone
      });

      // Navigate to chat after a short delay
      setTimeout(() => {
        router.push('/chat');
      }, 2000);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
        <div className="text-center">
          <PipPenguin
            size="xl"
            mood="playful"
            className="mb-8"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome aboard, {name}! 🎉</h1>
          <p className="text-lg text-gray-600 mb-8">
            I'm excited to be your companion on this journey. Let's head to your chat!
          </p>
          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">

        {/* Progress indicator */}
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step <= currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`
                      w-8 h-1 mx-2
                      ${step < currentStep ? 'bg-blue-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500">
            Step {currentStep} of 3 • Setting up your North Star experience
          </p>
        </div>

        {/* Main content */}
        <div className="card-elevated max-w-xl mx-auto p-8 animate-slide-in-up">

          {/* Step 1: Name */}
          {currentStep === 1 && (
            <div className="text-center">
              <PipPenguin
                size="lg"
                mood="happy"
                className="mb-6 mx-auto"
              />

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Hi there! What should I call you?
              </h2>

              <p className="text-gray-600 mb-8">
                I'd love to know your name so I can personalize our conversations together.
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg text-center"
                  maxLength={50}
                  autoFocus
                />

                {name && (
                  <p className="text-blue-600 animate-fade-in">
                    Nice to meet you, {name}! 😊
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Join Reason */}
          {currentStep === 2 && (
            <div className="text-center">
              <PipPenguin
                size="lg"
                mood="happy"
                className="mb-6 mx-auto"
              />

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                What brings you here today, {name}?
              </h2>

              <p className="text-gray-600 mb-8">
                This helps me understand how I can best support you on your journey.
              </p>

              <div className="grid gap-3">
                {joinReasons.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setJoinReason(reason.id)}
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all hover:scale-105 transform
                      ${joinReason === reason.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reason.icon}</span>
                      <span className="font-medium text-gray-800">{reason.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Tone Preference */}
          {currentStep === 3 && (
            <div className="text-center">
              <PipPenguin
                size="lg"
                mood="playful"
                    className="mb-6 mx-auto"
              />

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                How would you like me to talk with you?
              </h2>

              <p className="text-gray-600 mb-8">
                Choose the personality style that feels most comfortable for you. Don't worry – you can change this anytime!
              </p>

              <div className="grid gap-4 text-left">
                {tones.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setPreferredTone(tone.id)}
                    className={`
                      p-4 rounded-xl border-2 transition-all hover:scale-105 transform
                      ${preferredTone === tone.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-800">{tone.label}</h3>
                      <p className="text-sm text-gray-600">{tone.description}</p>
                    </div>

                    {preferredTone === tone.id && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200 animate-fade-in">
                        <p className="text-sm text-gray-700 italic">
                          "{tone.preview}"
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              className={`
                btn-secondary
                ${currentStep === 1 ? 'invisible' : 'visible'}
              `}
            >
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`
                btn-primary btn-attention btn-floating
                ${!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {currentStep === 3 ? 'Complete Setup ✨' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Skip option */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}