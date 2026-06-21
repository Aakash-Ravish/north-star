'use client';

import { useState, useEffect } from 'react';
import PipPenguin from '@/components/PipPenguin';
import { PipMood } from '@/types';

export default function DemoPage() {
  const [currentMood, setCurrentMood] = useState<PipMood>('happy');
  const [speaking, setSpeaking] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');

  // Auto-cycle through moods for demo
  const [autoCycle, setAutoCycle] = useState(false);
  const moods: PipMood[] = ['happy', 'sad', 'calm', 'playful', 'concerned'];

  useEffect(() => {
    if (!autoCycle) return;

    const interval = setInterval(() => {
      setCurrentMood(prev => {
        const currentIndex = moods.indexOf(prev);
        const nextIndex = (currentIndex + 1) % moods.length;
        return moods[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [autoCycle]);

  // Simulate talking volume variation
  useEffect(() => {
    if (!speaking) return;

    const interval = setInterval(() => {
      setVolume(0.3 + Math.random() * 0.6); // Natural variation 0.3-0.9
    }, 150);

    return () => clearInterval(interval);
  }, [speaking]);

  const handleTestSpeaking = () => {
    setSpeaking(true);
    setTimeout(() => setSpeaking(false), 3000); // Stop after 3 seconds
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🐧 PipPenguin Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet Pip, your expressive mental health companion! Watch as Pip responds to different moods,
            speaks with volume-based mouth animation, and shows genuine emotions through facial expressions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Display */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Current Mood: {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
              </h2>
              <div className="flex justify-center">
                <PipPenguin
                  mood={currentMood}
                  speaking={speaking}
                  volume={volume}
                  size={size}
                />
              </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-700">Speaking</div>
                <div className={speaking ? 'text-green-600' : 'text-red-600'}>
                  {speaking ? '🗣️ Active' : '🤫 Silent'}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-700">Volume</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-150"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Mood Controls */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold mb-4">🎭 Mood Controls</h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setCurrentMood(mood)}
                    className={`p-3 rounded-xl font-medium transition-all ${
                      currentMood === mood
                        ? 'bg-blue-500 text-white shadow-md transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mood === 'happy' && '😊'} {mood === 'sad' && '😢'}
                    {mood === 'calm' && '😌'} {mood === 'playful' && '😄'}
                    {mood === 'concerned' && '😟'} {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setAutoCycle(!autoCycle)}
                className={`w-full p-3 rounded-xl font-medium transition-all ${
                  autoCycle
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                {autoCycle ? '⏸️ Stop Auto-Cycle' : '▶️ Auto-Cycle Moods'}
              </button>
            </div>

            {/* Voice & Speaking */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold mb-4">🗣️ Voice & Speaking</h3>

              <button
                onClick={handleTestSpeaking}
                disabled={speaking}
                className={`w-full p-3 rounded-xl font-medium transition-all mb-4 ${
                  speaking
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {speaking ? '🎙️ Speaking...' : '🎤 Test Speaking (3s)'}
              </button>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manual Volume: {Math.round(volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full"
                    disabled={speaking} // Disable during auto-speaking
                  />
                </div>

                <button
                  onClick={() => setSpeaking(!speaking)}
                  className={`w-full p-2 rounded-lg text-sm font-medium ${
                    speaking
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {speaking ? 'Stop Manual Speaking' : 'Start Manual Speaking'}
                </button>
              </div>
            </div>

            {/* Size Controls */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold mb-4">📏 Size Controls</h3>

              <div className="grid grid-cols-4 gap-2">
                {(['sm', 'md', 'lg', 'xl'] as const).map((sizeOption) => (
                  <button
                    key={sizeOption}
                    onClick={() => setSize(sizeOption)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      size === sizeOption
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {sizeOption.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Features Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">✨ Features Showcase</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Continuous bobbing animation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Natural blinking every 3-4 seconds
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  Volume-based mouth animation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  Mood-specific expressions & colors
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  Smooth CSS transitions
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <a
            href="/chat"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-all transform hover:scale-105"
          >
            ← Back to Chat
          </a>
        </div>
      </div>
    </div>
  );
}