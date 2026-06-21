'use client';

import { useState, useEffect, useRef } from 'react';
import PipPenguin from '@/components/PipPenguin';
import AmbientSounds from '@/components/audio/AmbientSounds';
import VoiceGuidance from '@/components/audio/VoiceGuidance';
import { User, PipMood } from '@/types';

interface BreathingExerciseProps {
  user: User;
  onComplete: () => void;
  onBack: () => void;
}

type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'complete';

export default function BreathingExercise({ user, onComplete, onBack }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [cycle, setCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pipMood, setPipMood] = useState<PipMood>('calm');

  // Audio settings
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState(0.3);
  const [voiceVolume, setVoiceVolume] = useState(0.6);
  const [ambientType, setAmbientType] = useState<'water' | 'ocean' | 'rain' | 'forest'>('water');

  const totalCycles = 6;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const phaseConfig = {
    inhale: { duration: 4000, instruction: "Breathe in slowly like a penguin preparing to dive..." },
    hold: { duration: 4000, instruction: "Hold your breath, just like diving deep under the ice..." },
    exhale: { duration: 6000, instruction: "Breathe out gently, surfacing back to safety..." }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const startExercise = () => {
    setPhase('inhale');
    setCycle(1);
    setPipMood('calm');
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    // Inhale phase
    setPhase('inhale');
    animateProgress(4000);

    timerRef.current = setTimeout(() => {
      // Hold phase
      setPhase('hold');
      animateProgress(4000);

      timerRef.current = setTimeout(() => {
        // Exhale phase
        setPhase('exhale');
        animateProgress(6000);

        timerRef.current = setTimeout(() => {
          // Next cycle or complete
          const nextCycle = cycle + 1;
          setCycle(nextCycle);

          if (nextCycle <= totalCycles) {
            setProgress(0);
            runBreathingCycle();
          } else {
            setPhase('complete');
            setPipMood('happy');
          }
        }, 6000);
      }, 4000);
    }, 4000);
  };

  const animateProgress = (duration: number) => {
    setProgress(0);
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1) * 100;
      setProgress(progress);

      if (progress < 100) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const getCurrentInstruction = () => {
    if (phase === 'idle') return "Ready to learn penguin breathing?";
    if (phase === 'complete') return "Beautiful! You've mastered penguin breathing! 🐧";
    return phaseConfig[phase as keyof typeof phaseConfig]?.instruction || '';
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return 'from-blue-400 to-blue-600';
      case 'hold': return 'from-purple-400 to-purple-600';
      case 'exhale': return 'from-green-400 to-green-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full">

        {/* Audio Components */}
        <AmbientSounds
          isPlaying={phase !== 'idle' && phase !== 'complete' && ambientEnabled}
          soundType={ambientType}
          volume={ambientVolume}
        />
        <VoiceGuidance
          phase={phase}
          enabled={voiceEnabled}
          volume={voiceVolume}
          voice="gentle"
        />

        {/* Header */}
        <div className="text-center mb-6">
          <button
            onClick={onBack}
            className="absolute top-8 left-8 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Penguin Breathing with Pip
          </h1>

          {/* Audio Controls */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border">
              <button
                onClick={() => setAmbientEnabled(!ambientEnabled)}
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  ambientEnabled ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                title="Toggle ambient sounds"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="text-xs text-gray-600">Ambient</span>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  voiceEnabled ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                title="Toggle voice guidance"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.477 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.477l3.906-3.817z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="text-xs text-gray-600">Voice</span>
            </div>

            {ambientEnabled && (
              <select
                value={ambientType}
                onChange={(e) => setAmbientType(e.target.value as any)}
                className="text-xs bg-white rounded-lg px-2 py-2 shadow-sm border"
              >
                <option value="water">💧 Water</option>
                <option value="ocean">🌊 Ocean</option>
                <option value="rain">🌧️ Rain</option>
                <option value="forest">🌲 Forest</option>
              </select>
            )}
          </div>
        </div>

        {/* Enhanced Pip Breathing Animation */}
        <div className="text-center mb-8">
          <div className="relative">
            {/* Breathing Aura Effect */}
            <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
              phase === 'inhale' ? 'scale-125 opacity-30' :
              phase === 'exhale' ? 'scale-75 opacity-10' :
              phase === 'hold' ? 'scale-110 opacity-20' : 'scale-100 opacity-0'
            } ${getPhaseColor().replace('from-', 'bg-').replace(' to-', '').split('-').slice(0, 2).join('-')}-200`}>
            </div>

            {/* Breathing Ripple Effect */}
            {(phase === 'inhale' || phase === 'exhale') && (
              <div className={`absolute inset-0 rounded-full animate-ping ${
                phase === 'inhale' ? 'bg-blue-300' : 'bg-green-300'
              } opacity-20`} style={{
                animationDuration: phase === 'inhale' ? '4s' : '6s'
              }}>
              </div>
            )}

            {/* Pip with Enhanced Breathing.
                NOTE: uses arbitrary values — `scale-115/85` and `duration-4000/6000`
                are NOT real Tailwind classes, so the old code silently did not
                animate Pip with the breath. */}
            <div className={`relative transform transition-all ease-in-out ${
              phase === 'inhale' ? 'scale-[1.15] duration-[4000ms]' :
              phase === 'exhale' ? 'scale-[0.85] duration-[6000ms]' :
              phase === 'hold' ? 'scale-105 duration-[4000ms]' : 'scale-100 duration-1000'
            }`} style={{
              filter: phase === 'hold' ? 'brightness(1.1)' : 'brightness(1)'
            }}>
              <PipPenguin
                size="xl"
                mood={pipMood}
                className="mx-auto"
                speaking={phase !== 'idle' && phase !== 'complete'}
              />
            </div>

            {/* Breathing Guidance Text Overlay */}
            {phase !== 'idle' && phase !== 'complete' && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <div className={`px-4 py-2 rounded-full text-white text-sm font-medium transition-all duration-500 ${
                  phase === 'inhale' ? 'bg-blue-500 scale-100' :
                  phase === 'hold' ? 'bg-purple-500 scale-95' :
                  phase === 'exhale' ? 'bg-green-500 scale-90' : 'scale-0'
                } animate-pulse-gentle`}>
                  {phase === 'inhale' && '↗ Breathe In'}
                  {phase === 'hold' && '⏸ Hold Gently'}
                  {phase === 'exhale' && '↘ Breathe Out'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Progress Circle with Breathing Visualization */}
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48">
            {/* Breathing Visualization Circle */}
            <div className={`absolute inset-4 rounded-full border-4 transition-all ${
              phase === 'inhale' ? 'scale-110 border-blue-300 duration-[4000ms]' :
              phase === 'exhale' ? 'scale-75 border-green-300 duration-[6000ms]' :
              phase === 'hold' ? 'scale-100 border-purple-300 duration-[4000ms]' :
              'scale-90 border-gray-200 duration-1000'
            } opacity-40`}></div>

            <svg className="w-48 h-48 transform -rotate-90 relative z-10">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="rgba(229, 231, 235, 0.3)"
                strokeWidth="8"
                fill="transparent"
              />

              {/* Phase-specific background glow */}
              {phase !== 'idle' && phase !== 'complete' && (
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={
                    phase === 'inhale' ? '#3B82F6' :
                    phase === 'hold' ? '#8B5CF6' :
                    phase === 'exhale' ? '#10B981' : '#6B7280'
                  }
                  strokeWidth="4"
                  fill="transparent"
                  opacity="0.2"
                  className="animate-pulse"
                />
              )}

              {/* Progress circle with phase colors */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke={
                  phase === 'inhale' ? '#3B82F6' :
                  phase === 'hold' ? '#8B5CF6' :
                  phase === 'exhale' ? '#10B981' : '#6B7280'
                }
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                className="transition-all duration-100 ease-linear"
                style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
              />
            </svg>

            {/* Center content with breathing animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-center transition-all duration-1000 ${
                phase === 'inhale' ? 'scale-105' :
                phase === 'exhale' ? 'scale-95' : 'scale-100'
              }`}>
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {cycle}/{totalCycles}
                </div>
                <div className="text-sm text-gray-600">cycles</div>

                {/* Phase indicator */}
                {phase !== 'idle' && phase !== 'complete' && (
                  <div className={`text-xs mt-2 font-medium transition-colors ${
                    phase === 'inhale' ? 'text-blue-600' :
                    phase === 'hold' ? 'text-purple-600' :
                    phase === 'exhale' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {phase.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Instructions */}
        <div className="text-center mb-8">
          <div className={`transition-all duration-1000 ${
            phase === 'inhale' ? 'scale-105 text-blue-700' :
            phase === 'exhale' ? 'scale-95 text-green-700' :
            phase === 'hold' ? 'scale-100 text-purple-700' : 'scale-100 text-gray-700'
          }`}>
            <p className="text-lg mb-4 leading-relaxed font-medium">
              {getCurrentInstruction()}
            </p>
          </div>

          {phase !== 'idle' && phase !== 'complete' && (
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-white font-medium bg-gradient-to-r ${getPhaseColor()} transition-all duration-500 ${
              phase === 'inhale' ? 'scale-105 shadow-lg' :
              phase === 'exhale' ? 'scale-95' : 'scale-100'
            }`}>
              <div className={`w-3 h-3 rounded-full bg-white ${
                phase === 'inhale' ? 'animate-pulse' :
                phase === 'exhale' ? 'animate-bounce' : ''
              } opacity-80`}></div>
              {phase.charAt(0).toUpperCase() + phase.slice(1)}
              <div className="text-xs opacity-75">
                {phase === 'inhale' && '4s'}
                {phase === 'hold' && '4s'}
                {phase === 'exhale' && '6s'}
              </div>
            </div>
          )}

          {/* Visual breathing pattern guide */}
          {phase !== 'idle' && phase !== 'complete' && (
            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full ${phase === 'inhale' ? 'bg-blue-400' : 'bg-gray-300'}`}></div>
                <span>4s In</span>
                <div className={`w-2 h-2 rounded-full ${phase === 'hold' ? 'bg-purple-400' : 'bg-gray-300'}`}></div>
                <span>4s Hold</span>
                <div className={`w-2 h-2 rounded-full ${phase === 'exhale' ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                <span>6s Out</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          {phase === 'idle' && (
            <button
              onClick={startExercise}
              className="btn-primary btn-attention btn-floating btn-call-to-action text-lg px-8 py-4"
            >
              🌟 Start Breathing Exercise 🫁
            </button>
          )}

          {phase === 'complete' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Well done, {user.name}!
                </h3>
                <p className="text-gray-600 mb-6">
                  You've completed the penguin breathing exercise. Your mind is now calmer,
                  just like Pip floating peacefully on the water! 🐧💙
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setPhase('idle');
                    setCycle(0);
                    setProgress(0);
                  }}
                  className="px-6 py-3 border border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Practice Again
                </button>
                <button
                  onClick={onComplete}
                  className="btn-primary px-6 py-3"
                >
                  Continue to Activities
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        {phase === 'idle' && (
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">🐧 Pip's Enhanced Breathing Tips:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Find a comfortable position, just like penguins on the ice</li>
              <li>• Breathe through your nose, like preparing for a deep dive</li>
              <li>• Let the ambient sounds wash over you like gentle waves 🌊</li>
              <li>• Follow Pip's voice guidance for deeper relaxation 🎵</li>
              <li>• Don't force it - let your breath flow naturally</li>
              <li>• If you get distracted, that's normal! Just come back to Pip</li>
              <li>• Use the audio controls above to customize your experience</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}