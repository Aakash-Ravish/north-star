'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MoodEntry, MoodLevel } from '@/types';
import { getMoodColor, getMoodEmoji, getMoodLabel } from '@/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MoodBarChartProps {
  entries: MoodEntry[];
  className?: string;
}

export default function MoodBarChart({ entries, className = '' }: MoodBarChartProps) {
  // Get current month's data
  const getCurrentMonthData = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    // Count occurrences of each mood level
    const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    monthEntries.forEach(entry => {
      moodCounts[entry.mood as keyof typeof moodCounts]++;
    });

    return {
      counts: moodCounts,
      total: monthEntries.length,
      monthName: new Date().toLocaleDateString('en-US', { month: 'long' })
    };
  };

  const monthData = getCurrentMonthData();
  const moodLevels: MoodLevel[] = [1, 2, 3, 4, 5];

  const data = {
    labels: moodLevels.map(level => `${getMoodEmoji(level)} ${getMoodLabel(level)}`),
    datasets: [
      {
        label: 'Number of Entries',
        data: moodLevels.map(level => monthData.counts[level]),
        backgroundColor: moodLevels.map(level => getMoodColor(level) + '80'), // Add transparency
        borderColor: moodLevels.map(level => getMoodColor(level)),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: moodLevels.map(level => getMoodColor(level)),
        hoverBorderWidth: 3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Mood Distribution - ${monthData.monthName}`,
        font: {
          size: 16,
          weight: 'bold' as const
        },
        color: '#374151'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const count = context.parsed.y;
            const percentage = monthData.total > 0 ? ((count / monthData.total) * 100).toFixed(1) : '0';
            return [
              `${count} entries`,
              `${percentage}% of total`
            ];
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#378ADD',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#6B7280'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        }
      },
      x: {
        ticks: {
          color: '#6B7280',
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  // Calculate most and least common moods
  const getMoodInsights = () => {
    const nonZeroCounts = moodLevels.filter(level => monthData.counts[level] > 0);

    if (nonZeroCounts.length === 0) {
      return { mostCommon: null, leastCommon: null, trend: 'neutral' };
    }

    const mostCommon = nonZeroCounts.reduce((a, b) =>
      monthData.counts[a] > monthData.counts[b] ? a : b
    );

    const leastCommon = nonZeroCounts.reduce((a, b) =>
      monthData.counts[a] < monthData.counts[b] ? a : b
    );

    // Simple trend calculation: average of all moods
    const avgMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
    const trend = avgMood >= 3.5 ? 'positive' : avgMood <= 2.5 ? 'negative' : 'neutral';

    return { mostCommon, leastCommon, trend };
  };

  const insights = getMoodInsights();

  return (
    <div className={`bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200 ${className}`}>
      <div className="h-48 sm:h-64 md:h-80">
        <Bar data={data} options={options} />
      </div>

      {/* Insights */}
      {monthData.total > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.mostCommon && (
              <div className="text-center">
                <div className="text-sm text-gray-500">Most Common</div>
                <div className="text-lg font-semibold flex items-center justify-center gap-1">
                  <span>{getMoodEmoji(insights.mostCommon)}</span>
                  <span style={{ color: getMoodColor(insights.mostCommon) }}>
                    {getMoodLabel(insights.mostCommon)}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {monthData.counts[insights.mostCommon]} times
                </div>
              </div>
            )}

            <div className="text-center">
              <div className="text-sm text-gray-500">Total Entries</div>
              <div className="text-lg font-semibold text-gray-800">
                {monthData.total}
              </div>
              <div className="text-xs text-gray-400">
                this month
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-500">Trend</div>
              <div className={`text-lg font-semibold ${
                insights.trend === 'positive' ? 'text-green-600' :
                insights.trend === 'negative' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {insights.trend === 'positive' ? '📈 Improving' :
                 insights.trend === 'negative' ? '📉 Needs Care' :
                 '➡️ Stable'}
              </div>
            </div>
          </div>
        </div>
      )}

      {monthData.total === 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-center text-gray-500">
          <p className="text-sm">No mood entries for {monthData.monthName} yet.</p>
          <p className="text-xs mt-1">Start tracking your mood to see insights here!</p>
        </div>
      )}
    </div>
  );
}