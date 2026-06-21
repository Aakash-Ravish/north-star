'use client';

import React, { useState } from 'react';
import { MoodEntry, MoodLevel } from '@/types';
import { getMoodColor, getMoodEmoji, getMoodLabel } from '@/utils';

interface MoodCalendarHeatmapProps {
  entries: MoodEntry[];
  className?: string;
}

interface DayData {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  mood?: MoodLevel;
  entryCount: number;
  averageMood?: number;
  entries: MoodEntry[];
}

export default function MoodCalendarHeatmap({ entries, className = '' }: MoodCalendarHeatmapProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  const getCalendarData = (month: Date): DayData[][] => {
    const year = month.getFullYear();
    const monthNum = month.getMonth();

    // Get first day of month and last day of month
    const firstDay = new Date(year, monthNum, 1);
    const lastDay = new Date(year, monthNum + 1, 0);

    // Get the starting Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Get the ending Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const weeks: DayData[][] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const week: DayData[] = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        const dateStr = date.toDateString();
        const isCurrentMonth = date.getMonth() === monthNum;

        // Find entries for this date
        const dayEntries = entries.filter(entry =>
          new Date(entry.timestamp).toDateString() === dateStr
        );

        // Calculate average mood for the day
        const averageMood = dayEntries.length > 0
          ? dayEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayEntries.length
          : undefined;

        const dayData: DayData = {
          date: new Date(date),
          dayOfMonth: date.getDate(),
          isCurrentMonth,
          mood: averageMood ? Math.round(averageMood) as MoodLevel : undefined,
          entryCount: dayEntries.length,
          averageMood,
          entries: dayEntries
        };

        week.push(dayData);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push(week);
    }

    return weeks;
  };

  const calendarData = getCalendarData(selectedMonth);
  const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getDayStyle = (day: DayData) => {
    const baseClasses = 'relative w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all cursor-pointer hover:scale-110 hover:shadow-lg';

    if (!day.isCurrentMonth) {
      return `${baseClasses} text-gray-300 hover:bg-gray-50`;
    }

    if (day.entryCount === 0) {
      return `${baseClasses} text-gray-400 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-200`;
    }

    // Color-code based on average mood
    const roundedMood = Math.round(day.averageMood || 3);
    const clampedMood = Math.max(1, Math.min(5, roundedMood)) as MoodLevel;
    const moodColor = day.averageMood ? getMoodColor(clampedMood) : '#E5E7EB';
    const isToday = day.date.toDateString() === new Date().toDateString();
    const borderClass = isToday ? 'border-4 border-blue-500' : 'border-2 border-white';

    return `${baseClasses} text-white ${borderClass} shadow-md`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedMonth(newMonth);
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  const getMoodIntensity = (averageMood: number | undefined): number => {
    if (!averageMood) return 0;
    // Convert mood (1-5) to intensity (0-1)
    return (averageMood - 1) / 4;
  };

  return (
    <div className={`bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Mood Calendar</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToCurrentMonth}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg min-w-32 text-center"
          >
            {monthName}
          </button>

          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-2">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar weeks */}
        {calendarData.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={getDayStyle(day)}
                style={{
                  backgroundColor: day.averageMood ? getMoodColor(Math.max(1, Math.min(5, Math.round(day.averageMood))) as MoodLevel) : undefined
                }}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                title={day.isCurrentMonth && day.entryCount > 0 ?
                  `${day.averageMood?.toFixed(1)}/5 (${day.entryCount} entries)` :
                  'No entries'}
              >
                <span className={day.isCurrentMonth ? 'relative z-10' : ''}>
                  {day.dayOfMonth}
                </span>

                {/* Entry count indicator */}
                {day.entryCount > 1 && day.isCurrentMonth && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white text-gray-800 text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                    {day.entryCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Mood Scale</span>
          <span className="text-xs text-gray-500">Hover over days for details</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {[1, 2, 3, 4, 5].map(mood => (
            <div key={mood} className="flex items-center gap-1 min-w-fit">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getMoodColor(mood as MoodLevel) }}
              />
              <span className="text-xs text-gray-600">
                {mood} {getMoodEmoji(mood as MoodLevel)}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1 ml-2">
            <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded" />
            <span className="text-xs text-gray-500">No data</span>
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredDay && hoveredDay.isCurrentMonth && hoveredDay.entryCount > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-1">
            {hoveredDay.date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="text-xs text-blue-700">
            Average Mood: {hoveredDay.averageMood?.toFixed(1)}/5 {hoveredDay.mood ? getMoodEmoji(hoveredDay.mood) : ''}
          </div>
          <div className="text-xs text-blue-700">
            Entries: {hoveredDay.entryCount}
          </div>
        </div>
      )}
    </div>
  );
}