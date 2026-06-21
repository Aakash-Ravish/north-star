'use client';

import { useState } from 'react';
import { MoodPickerProps, MoodLevel } from '@/types';
import { getMoodEmoji, getMoodColor, getMoodLabel } from '@/utils';

export default function MoodPicker({
  currentMood,
  onMoodSelect,
  disabled = false,
  showLabels = true
}: MoodPickerProps) {
  const [hoveredMood, setHoveredMood] = useState<MoodLevel | null>(null);

  const moods: MoodLevel[] = [1, 2, 3, 4, 5];

  const handleMoodClick = (mood: MoodLevel) => {
    if (disabled) return;
    onMoodSelect(mood);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Mood selection row */}
      <div className="flex justify-between items-center gap-2 mb-4">
        {moods.map((mood) => {
          const isSelected = currentMood === mood;
          const isHovered = hoveredMood === mood;
          const moodColor = getMoodColor(mood);

          return (
            <button
              key={mood}
              onClick={() => handleMoodClick(mood)}
              onMouseEnter={() => setHoveredMood(mood)}
              onMouseLeave={() => setHoveredMood(null)}
              disabled={disabled}
              className={`
                relative w-14 h-14 rounded-full flex items-center justify-center
                text-2xl transition-all duration-200 transform
                ${disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:scale-110 active:scale-95'
                }
                ${isSelected || isHovered
                  ? 'shadow-lg scale-110'
                  : 'shadow-md hover:shadow-lg'
                }
              `}
              style={{
                backgroundColor: isSelected || isHovered ? moodColor + '20' : 'white',
                borderColor: isSelected ? moodColor : '#E2E8F0',
                borderWidth: '2px'
              }}
              aria-label={`Mood level ${mood}: ${getMoodLabel(mood)}`}
            >
              {/* Mood emoji */}
              <span className="relative z-10">
                {getMoodEmoji(mood)}
              </span>

              {/* Selection ring */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-full border-3 animate-pulse-gentle"
                  style={{ borderColor: moodColor }}
                />
              )}

              {/* Hover glow effect */}
              {isHovered && !isSelected && (
                <div
                  className="absolute inset-0 rounded-full opacity-30 animate-pulse"
                  style={{ backgroundColor: moodColor }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Mood labels */}
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-500 px-1">
          {moods.map((mood) => (
            <span
              key={mood}
              className={`
                text-center w-14 transition-colors duration-200
                ${currentMood === mood || hoveredMood === mood
                  ? 'text-gray-800 font-medium'
                  : 'text-gray-500'
                }
              `}
            >
              {getMoodLabel(mood)}
            </span>
          ))}
        </div>
      )}

      {/* Current selection display */}
      {currentMood && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{getMoodEmoji(currentMood)}</span>
            <span
              className="text-lg font-semibold"
              style={{ color: getMoodColor(currentMood) }}
            >
              {getMoodLabel(currentMood)}
            </span>
          </div>

          {/* Mood-specific encouragement */}
          <p className="text-sm text-gray-600">
            {currentMood >= 4 && "That's wonderful! I'm so glad you're feeling good today! 🌟"}
            {currentMood === 3 && "Thanks for sharing. Every day has its moments, and that's perfectly okay. 💙"}
            {currentMood <= 2 && "I hear you, and I'm here for you. It's okay to have tough days. 🤗"}
          </p>
        </div>
      )}

      {/* Rating scale guide (optional) */}
      {!currentMood && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 mb-2">
            How are you feeling right now?
          </p>
          <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>Very Low</span>
            <span>Excellent</span>
          </div>
        </div>
      )}
    </div>
  );
}