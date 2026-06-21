'use client';

import { useState, useEffect, useRef } from 'react';
import PipPenguin from '@/components/PipPenguin';
import { User, PipMood } from '@/types';

interface MindfulnessMomentProps {
  user: User;
  onComplete: () => void;
  onBack: () => void;
}

type MindfulnessStep = 'intro' | 'active' | 'reflection' | 'complete';

const mindfulnessScenarios = [
  {
    title: "Antarctic Sunrise",
    description: "Imagine watching the sunrise over the vast Antarctic ice with Pip",
    guidance: [
      "Picture yourself sitting beside Pip on a smooth ice shelf...",
      "The horizon begins to glow with soft orange and pink light...",
      "Feel the crisp, clean air filling your lungs...",
      "Notice how peaceful everything feels in this moment...",
      "Pip waddles closer, sharing this beautiful silence with you..."
    ]
  },
  {
    title: "Penguin Colony Peace",
    description: "Find calm in the gentle sounds of a penguin colony",
    guidance: [
      "You're in a safe, warm place watching penguins from afar...",
      "Hear the gentle calls of penguins talking to each other...",
      "Notice the rhythm of waves lapping against the ice...",
      "Feel your breathing naturally slowing down...",
      "Pip looks at you with kind, understanding eyes..."
    ]
  },
  {
    title: "Floating with Pip",
    description: "Drift peacefully on calm ocean waters",
    guidance: [
      "Imagine floating gently on your back in warm, calm water...",
      "Pip floats nearby, completely relaxed and trusting...",
      "Feel supported by the water beneath you...",
      "Notice clouds drifting slowly across the sky above...",
      "Your body feels weightless and completely at peace..."
    ]
  }
];

export default function MindfulnessMoment({ user, onComplete, onBack }: MindfulnessMomentProps) {
  const [step, setStep] = useState<MindfulnessStep>('intro');
  const [currentScenario, setCurrentScenario] = useState(0);
  const [guidanceIndex, setGuidanceIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes
  const [isPaused, setIsPaused] = useState(false);
  const [pipMood, setPipMood] = useState<PipMood>('calm');
  const [reflection, setReflection] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const guidanceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (guidanceRef.current) clearTimeout(guidanceRef.current);
    };
  }, []);

  const startMindfulness = () => {
    setStep('active');
    setCurrentScenario(Math.floor(Math.random() * mindfulnessScenarios.length));
    setGuidanceIndex(0);
    setTimeRemaining(120);
    setIsPaused(false);
    setPipMood('calm');

    startTimer();
    startGuidance();
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setStep('reflection');
          setPipMood('happy');
          if (guidanceRef.current) clearTimeout(guidanceRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startGuidance = () => {
    const scenario = mindfulnessScenarios[currentScenario];
    const showNextGuidance = (index: number) => {
      if (index < scenario.guidance.length) {
        setGuidanceIndex(index);
        guidanceRef.current = setTimeout(() => {
          showNextGuidance(index + 1);
        }, 20000); // 20 seconds per guidance
      }
    };

    showNextGuidance(0);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);

    if (!isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (guidanceRef.current) clearTimeout(guidanceRef.current);
    } else {
      startTimer();
      // Resume guidance from current point
      const scenario = mindfulnessScenarios[currentScenario];
      if (guidanceIndex < scenario.guidance.length - 1) {
        guidanceRef.current = setTimeout(() => {
          setGuidanceIndex(guidanceIndex + 1);
          startGuidance();
        }, 5000);
      }
    }
  };

  const completeReflection = () => {
    setStep('complete');
    setPipMood('playful');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathingAnimation = () => {
    if (step !== 'active' || isPaused) return 'scale-100';
    // Breathing animation: 4 seconds in, 4 seconds out
    return 'animate-pulse';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
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
            Antarctic Mindfulness with Pip
          </h1>
        </div>

        {/* Pip Animation */}
        <div className="text-center mb-8">
          <div className={`transform transition-all duration-2000 ${getBreathingAnimation()}`}>
            <PipPenguin
              size="xl"
              mood={pipMood}
              className="mx-auto"
            />
          </div>
        </div>

        {/* Intro Step */}
        {step === 'intro' && (
          <div className="text-center space-y-6">
            <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">
                🧘‍♀️ Mindful Moment with Pip
              </h3>
              <p className="text-purple-700 mb-4">
                Hello {user.name}! Let's take a peaceful journey to the Antarctic with Pip.
                This gentle meditation will help you find calm in the present moment.
              </p>
              <p className="text-purple-700">
                Find a comfortable position and let Pip guide you to tranquility. 🐧✨
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">⏱️</div>
                <div className="text-sm text-gray-600">2-4 minutes</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">🧘</div>
                <div className="text-sm text-gray-600">Guided imagery</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">🐧</div>
                <div className="text-sm text-gray-600">With Pip</div>
              </div>
            </div>

            <button
              onClick={startMindfulness}
              className="btn-primary text-lg px-8 py-4"
            >
              Begin Mindful Journey 🧘‍♀️
            </button>
          </div>
        )}

        {/* Active Meditation */}
        {step === 'active' && (
          <div className="text-center space-y-6">
            {/* Timer */}
            <div className="text-4xl font-bold text-purple-600 mb-4">
              {formatTime(timeRemaining)}
            </div>

            {/* Scenario Title */}
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {mindfulnessScenarios[currentScenario].title}
            </h3>

            {/* Current Guidance */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-lg text-gray-700 leading-relaxed">
                {mindfulnessScenarios[currentScenario].guidance[guidanceIndex]}
              </p>
            </div>

            {/* Breathing indicator */}
            <div className="flex justify-center">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                Breathe naturally with Pip
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={togglePause}
                className="px-6 py-3 border border-purple-300 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={() => {
                  setStep('reflection');
                  if (timerRef.current) clearInterval(timerRef.current);
                  if (guidanceRef.current) clearTimeout(guidanceRef.current);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Finish Early
              </button>
            </div>

            {/* Progress indicator */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((120 - timeRemaining) / 120) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Reflection Step */}
        {step === 'reflection' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                How are you feeling now?
              </h3>
              <p className="text-gray-600 mb-6">
                Pip would love to know how this mindful moment affected you.
                Take a moment to reflect on your experience.
              </p>
            </div>

            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="I feel... I noticed... This helped me..."
              className="w-full p-4 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
              rows={4}
              maxLength={500}
            />

            <div className="text-sm text-gray-500 text-center">
              {500 - reflection.length} characters left • Optional reflection
            </div>

            <div className="flex gap-4">
              <button
                onClick={completeReflection}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Skip Reflection
              </button>
              <button
                onClick={completeReflection}
                className="flex-1 btn-primary px-6 py-3"
              >
                Complete Session
              </button>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🕊️</div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Peace achieved, {user.name}!
            </h3>

            <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
              <p className="text-gray-700 mb-4">
                You've completed your mindful journey to the Antarctic with Pip!
                You've given your mind a gift of peace and presence. 🐧💙
              </p>
              {reflection && (
                <div className="text-left mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-2">Your reflection:</div>
                  <div className="text-sm text-gray-700 italic">"{reflection}"</div>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-xl border border-blue-200">
              💡 <strong>Mindfulness Tip:</strong> Even 2 minutes of mindfulness can reduce stress hormones and improve focus.
              Pip is proud of you for taking this time for yourself! 🌟
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep('intro');
                  setReflection('');
                  setGuidanceIndex(0);
                  setTimeRemaining(120);
                }}
                className="flex-1 px-6 py-3 border border-purple-300 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors"
              >
                Practice Again
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