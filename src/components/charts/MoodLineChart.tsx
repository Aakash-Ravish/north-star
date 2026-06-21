'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MoodEntry, MoodLevel } from '@/types';
import { getMoodColor } from '@/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MoodLineChartProps {
  entries: MoodEntry[];
  className?: string;
}

export default function MoodLineChart({ entries, className = '' }: MoodLineChartProps) {
  // Get last 7 days of data
  const getLast7DaysData = () => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();

      const dayEntries = entries.filter(entry =>
        new Date(entry.timestamp).toDateString() === dateStr
      );

      // Calculate average mood for the day
      const avgMood = dayEntries.length > 0
        ? dayEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayEntries.length
        : null;

      last7Days.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        mood: avgMood,
        entryCount: dayEntries.length
      });
    }

    return last7Days;
  };

  const chartData = getLast7DaysData();

  const data = {
    labels: chartData.map(d => d.day),
    datasets: [
      {
        label: 'Daily Mood',
        data: chartData.map(d => d.mood),
        borderColor: '#378ADD',
        backgroundColor: 'rgba(55, 138, 221, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: chartData.map(d =>
          d.mood ? getMoodColor(Math.max(1, Math.min(5, Math.round(d.mood))) as MoodLevel) : '#E5E7EB'
        ),
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        segment: {
          borderDash: (ctx: any) => {
            // Show dashed line for missing data
            return ctx.p0.parsed.y === null || ctx.p1.parsed.y === null ? [5, 5] : undefined;
          }
        }
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
        text: 'Mood Trend - Last 7 Days',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        color: '#374151'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const dayData = chartData[context.dataIndex];
            if (dayData.mood === null) {
              return 'No mood entries';
            }
            return [
              `Average Mood: ${dayData.mood.toFixed(1)}/5`,
              `Entries: ${dayData.entryCount}`
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
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            const moodLabels = ['', '😔', '😕', '😐', '😊', '😄'];
            return `${value} ${moodLabels[value] || ''}`;
          },
          color: '#6B7280'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        }
      },
      x: {
        ticks: {
          color: '#6B7280'
        },
        grid: {
          display: false
        }
      }
    },
    elements: {
      point: {
        hoverBackgroundColor: '#378ADD'
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200 ${className}`}>
      <div className="h-48 sm:h-64 md:h-80">
        <Line data={data} options={options} />
      </div>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-sm text-gray-500">Average</div>
          <div className="text-lg font-semibold text-gray-800">
            {chartData.filter(d => d.mood !== null).length > 0
              ? (chartData.filter(d => d.mood !== null).reduce((sum, d) => sum + (d.mood || 0), 0) /
                 chartData.filter(d => d.mood !== null).length).toFixed(1)
              : 'N/A'
            }
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Entries</div>
          <div className="text-lg font-semibold text-gray-800">
            {chartData.reduce((sum, d) => sum + d.entryCount, 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Days Logged</div>
          <div className="text-lg font-semibold text-gray-800">
            {chartData.filter(d => d.entryCount > 0).length}/7
          </div>
        </div>
      </div>
    </div>
  );
}