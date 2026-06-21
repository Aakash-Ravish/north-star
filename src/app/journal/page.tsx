'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PipPenguin from '@/components/PipPenguin';
import MoodPicker from '@/components/MoodPicker';
import MoodLineChart from '@/components/charts/MoodLineChart';
import MoodBarChart from '@/components/charts/MoodBarChart';
import MoodCalendarHeatmap from '@/components/charts/MoodCalendarHeatmap';
import { User, MoodEntry, MoodLevel, JournalPrompt } from '@/types';
import {
  loadFromStorage,
  saveToStorage,
  generateId,
  getMoodEmoji,
  getMoodColor,
  getMoodLabel,
  formatDate,
  getRelativeTime,
  calculateAverageMood,
  getMoodTrend,
  getPipMoodFromLevel
} from '@/utils';

export default function JournalPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodLevel | undefined>();
  const [note, setNote] = useState('');
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'charts' | 'calendar' | 'stats'>('list');
  const [weeklyInsight, setWeeklyInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [yearlyStats, setYearlyStats] = useState<any>(null);

  const journalPrompts: JournalPrompt[] = [
    {
      id: '1',
      title: 'Daily Reflection',
      question: 'What was the highlight of your day?',
      category: 'reflection'
    },
    {
      id: '2',
      title: 'Gratitude',
      question: 'What are you grateful for today?',
      category: 'gratitude'
    },
    {
      id: '3',
      title: 'Feelings Check',
      question: 'What emotions did you experience today?',
      category: 'feelings'
    },
    {
      id: '4',
      title: 'Tomorrow\'s Goals',
      question: 'What do you hope to accomplish tomorrow?',
      category: 'goals'
    }
  ];

  useEffect(() => {
    const userData = loadFromStorage('northstar_user', null);
    if (!userData) {
      router.push('/onboarding');
      return;
    }

    setUser(userData);

    // Load mood entries
    const moodEntries = loadFromStorage('northstar_mood_entries', []);
    setEntries(moodEntries.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    })));
  }, [router]);

  // Load weekly insights and yearly stats when entries change
  useEffect(() => {
    if (entries.length > 0 && user) {
      fetchWeeklyInsight();
      const yearly = calculateYearlyStats();
      setYearlyStats(yearly);
    }
  }, [entries, user]);

  const handleAddEntry = () => {
    if (!user || !selectedMood) return;

    const newEntry: MoodEntry = {
      id: generateId(),
      userId: user.id,
      mood: selectedMood,
      note: note.trim() || undefined,
      timestamp: new Date(),
      tags: [], // Could be expanded for categorization
      activities: [] // Could be expanded for activity tracking
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    saveToStorage('northstar_mood_entries', updatedEntries);

    // Reset form
    setSelectedMood(undefined);
    setNote('');
    setShowAddEntry(false);
  };


  const fetchWeeklyInsight = async () => {
    if (!user || entries.length === 0 || insightLoading) return;

    // Only generate insights on Sundays or if no insight exists
    const today = new Date();
    const lastSunday = new Date(today.setDate(today.getDate() - today.getDay()));
    const insightKey = `northstar_weekly_insight_${lastSunday.toDateString()}`;
    
    // Check if we already have this week's insight
    const cachedInsight = loadFromStorage(insightKey, null);
    if (cachedInsight) {
      setWeeklyInsight(cachedInsight);
      return;
    }

    setInsightLoading(true);
    
    try {
      const response = await fetch('/api/weekly-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: entries.map(entry => ({
            mood: entry.mood,
            timestamp: entry.timestamp.toISOString(),
            note: entry.note
          })),
          userName: user.name,
          userPersonality: user.preferredTone || 'gentle'
        })
      });

      const data = await response.json();
      
      if (data.insight) {
        setWeeklyInsight(data.insight);
        // Cache the insight for the week
        saveToStorage(insightKey, data.insight);
      }
    } catch (error) {
      console.error('Failed to fetch weekly insight:', error);
      setWeeklyInsight("🐧 I'm having trouble generating insights right now, but I can see you're taking great care of your emotional wellbeing! Keep it up! 💙");
    }
    
    setInsightLoading(false);
  };

  const calculateYearlyStats = () => {
    if (entries.length === 0) return null;

    const currentYear = new Date().getFullYear();
    const yearEntries = entries.filter(entry => 
      entry.timestamp.getFullYear() === currentYear
    );

    if (yearEntries.length === 0) return null;

    // Calculate total chats (assuming each mood entry represents a chat/interaction)
    const totalChats = yearEntries.length;
    
    // Calculate streak record (longest consecutive days with entries)
    const streakRecord = calculateLongestStreak(yearEntries);
    
    // Most common mood
    const moodCounts = yearEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const mostCommonMoodLevel = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    // Monthly breakdown
    const monthlyData = Array.from({length: 12}, (_, i) => {
      const month = i + 1;
      const monthEntries = yearEntries.filter(entry => 
        entry.timestamp.getMonth() + 1 === month
      );
      return {
        month: new Date(currentYear, i).toLocaleDateString('en-US', { month: 'short' }),
        entries: monthEntries.length,
        avgMood: monthEntries.length > 0 
          ? monthEntries.reduce((sum, e) => sum + e.mood, 0) / monthEntries.length 
          : 0
      };
    });

    const bestMonth = monthlyData
      .filter(m => m.entries > 0)
      .sort((a, b) => b.avgMood - a.avgMood)[0];

    return {
      year: currentYear,
      totalChats,
      streakRecord,
      mostCommonMood: mostCommonMoodLevel ? parseInt(mostCommonMoodLevel) : null,
      averageMood: yearEntries.reduce((sum, e) => sum + e.mood, 0) / yearEntries.length,
      totalDays: yearEntries.length,
      bestMonth: bestMonth?.month,
      bestMonthAvg: bestMonth?.avgMood,
      monthlyData,
      firstEntry: yearEntries[yearEntries.length - 1], // Oldest first
      latestEntry: yearEntries[0] // Most recent first
    };
  };

  const calculateLongestStreak = (moodEntries: any[]) => {
    if (moodEntries.length === 0) return 0;
    
    // Sort entries by date
    const sortedEntries = moodEntries
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Get unique dates
    const uniqueDates = [...new Set(sortedEntries.map(entry => 
      new Date(entry.timestamp).toDateString()
    ))];
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currentDate = new Date(uniqueDates[i]);
      const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  };
  const getStatsData = () => {
    if (entries.length === 0) return null;

    const last7Days = entries.filter(entry => {
      const daysDiff = (new Date().getTime() - entry.timestamp.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7;
    });

    const last30Days = entries.filter(entry => {
      const daysDiff = (new Date().getTime() - entry.timestamp.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 30;
    });

    return {
      total: entries.length,
      last7Days: last7Days.length,
      last30Days: last30Days.length,
      averageAllTime: calculateAverageMood(entries),
      average7Days: calculateAverageMood(last7Days),
      average30Days: calculateAverageMood(last30Days),
      trend: getMoodTrend(entries),
      mostCommonMood: getMostCommonMood(entries)
    };
  };

  const getMostCommonMood = (moodEntries: MoodEntry[]): MoodLevel | null => {
    if (moodEntries.length === 0) return null;

    const moodCounts = moodEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<MoodLevel, number>);

    return (Object.keys(moodCounts).reduce((a, b) =>
      moodCounts[a as unknown as MoodLevel] > moodCounts[b as unknown as MoodLevel] ? a : b
    ) as unknown as MoodLevel);
  };

  const renderCalendarView = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Generate 30 days of calendar data
    const calendarDays = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayEntries = entries.filter(entry =>
        entry.timestamp.toDateString() === date.toDateString()
      );
      
      // Calculate average mood for the day if there are entries
      const avgMood = dayEntries.length > 0
        ? dayEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayEntries.length
        : null;

      calendarDays.push({
        date,
        entries: dayEntries,
        avgMood,
        isToday: date.toDateString() === today.toDateString()
      });
    }

    const getMoodDotColor = (mood: number) => {
      // Green = great (4-5), Yellow = okay (3), Blue = low (1-2)
      if (mood >= 4) return '#10B981'; // Green for great
      if (mood >= 3) return '#F59E0B'; // Yellow for okay  
      return '#3B82F6'; // Blue for low
    };

    return (
      <div className="space-y-6">
        {/* 30-day mood calendar header */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Your Mood Journey - Last 30 Days
          </h3>
          <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Great mood</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Okay mood</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Low mood</span>
            </div>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-3 p-4 bg-white rounded-xl border border-gray-200">
          {/* Weekday headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 pb-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((dayData, index) => (
            <div
              key={index}
              className={`
                relative aspect-square flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer
                transition-all hover:bg-gray-50 border
                ${dayData.isToday 
                  ? 'bg-blue-50 border-blue-300 shadow-sm' 
                  : 'border-transparent hover:border-gray-200'
                }
              `}
              title={`${dayData.date.toLocaleDateString()} - ${
                dayData.entries.length > 0 
                  ? `${dayData.entries.length} ${dayData.entries.length === 1 ? 'entry' : 'entries'}, avg mood: ${dayData.avgMood?.toFixed(1)}/5`
                  : 'No entries'
              }`}
            >
              {/* Date number */}
              <span className={`text-sm font-medium ${
                dayData.isToday ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {dayData.date.getDate()}
              </span>
              
              {/* Mood indicator dots */}
              {dayData.entries.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {dayData.entries.slice(0, 3).map((entry, entryIndex) => (
                    <div
                      key={entryIndex}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getMoodDotColor(entry.mood) }}
                    />
                  ))}
                  {dayData.entries.length > 3 && (
                    <span className="text-xs text-gray-400">+{dayData.entries.length - 3}</span>
                  )}
                </div>
              )}
              
              {/* Today indicator */}
              {dayData.isToday && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>

        {/* Calendar summary stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">
              {calendarDays.filter(d => d.entries.length > 0).length}
            </div>
            <div className="text-sm text-gray-600">Days logged</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">
              {calendarDays.reduce((sum, d) => sum + d.entries.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Total entries</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">
              {calendarDays.filter(d => d.avgMood && d.avgMood >= 4).length}
            </div>
            <div className="text-sm text-gray-600">Great days</div>
          </div>
        </div>
      </div>
    );
  };

  const statsData = getStatsData();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/chat')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <PipPenguin size="sm" mood="happy" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Your Mood Journal</h1>
                  <p className="text-gray-600">Track your emotional journey with Pip</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAddEntry(true)}
              className="btn-primary"
            >
              + Add Entry
            </button>
          </div>

          {/* View mode tabs */}
          <div className="flex gap-1 mt-6 p-1 bg-gray-100 rounded-lg w-fit">
            {[
              { id: 'list', label: 'Timeline', icon: '📋' },
              { id: 'charts', label: 'Charts', icon: '📈' },
              { id: 'calendar', label: 'Calendar', icon: '📅' },
              { id: 'stats', label: 'Statistics', icon: '📊' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${viewMode === mode.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Add entry modal */}
        {showAddEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slide-in-up">
              <div className="text-center mb-6">
                <PipPenguin size="md" mood={selectedMood ? getPipMoodFromLevel(selectedMood) : 'calm'} className="mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  New Mood Entry
                </h3>
                <p className="text-gray-600">
                  How are you feeling right now?
                </p>
              </div>

              <MoodPicker
                currentMood={selectedMood}
                onMoodSelect={setSelectedMood}
                showLabels={true}
              />

              {selectedMood && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What's on your mind? Any thoughts about your mood today?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddEntry(false);
                    setSelectedMood(undefined);
                    setNote('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEntry}
                  disabled={!selectedMood}
                  className={`
                    flex-1 btn-primary
                    ${!selectedMood ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content based on view mode */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main content area */}
          <div className="lg:col-span-2">

            {/* List view */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {entries.length === 0 ? (
                  <div className="card text-center p-12">
                    <PipPenguin size="lg" mood="happy" className="mb-6 mx-auto" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Start Your Mood Journey
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Begin tracking your emotions to better understand your patterns and progress.
                    </p>
                    <button
                      onClick={() => setShowAddEntry(true)}
                      className="btn-primary"
                    >
                      Add Your First Entry
                    </button>
                  </div>
                ) : (
                  entries.map((entry) => (
                    <div key={entry.id} className="card p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: getMoodColor(entry.mood) + '20' }}
                        >
                          {getMoodEmoji(entry.mood)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3
                              className="font-semibold"
                              style={{ color: getMoodColor(entry.mood) }}
                            >
                              Feeling {getMoodLabel(entry.mood)}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {getRelativeTime(entry.timestamp)}
                            </span>
                          </div>

                          {entry.note && (
                            <p className="text-gray-700 leading-relaxed">
                              {entry.note}
                            </p>
                          )}

                          <div className="mt-3 text-xs text-gray-500">
                            {formatDate(entry.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Charts view */}
            {viewMode === 'charts' && (
              <div className="space-y-6 lg:space-y-8">
                {entries.length === 0 ? (
                  <div className="card text-center p-12">
                    <PipPenguin size="lg" mood="happy" className="mb-6 mx-auto" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No Data for Charts Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add some mood entries to see beautiful charts and insights about your emotional journey.
                    </p>
                    <div className="space-y-4">
                      <button
                        onClick={() => setShowAddEntry(true)}
                        className="btn-primary w-full"
                      >
                        Add Your First Entry
                      </button>

                      {/* Development sample data button */}
                      {process.env.NODE_ENV === 'development' && (
                        <button
                          onClick={() => {
                            const generateSampleData = () => {
                              const sampleData = [];
                              const today = new Date();

                              for (let i = 29; i >= 0; i--) {
                                const date = new Date(today);
                                date.setDate(date.getDate() - i);
                                const entriesPerDay = Math.floor(Math.random() * 3) + 1;

                                for (let j = 0; j < entriesPerDay; j++) {
                                  const hour = Math.floor(Math.random() * 16) + 7;
                                  const entryDate = new Date(date);
                                  entryDate.setHours(hour, 0, 0, 0);

                                  let mood;
                                  if (i < 7) mood = Math.floor(Math.random() * 2) + 3;
                                  else if (i < 14) mood = Math.floor(Math.random() * 5) + 1;
                                  else mood = Math.floor(Math.random() * 3) + 1;

                                  sampleData.push({
                                    id: `sample_${i}_${j}_${Date.now()}`,
                                    userId: user?.id || 'sample',
                                    mood: mood as MoodLevel,
                                    note: Math.random() > 0.5 ? ['Great day!', 'Feeling overwhelmed', 'Peaceful evening', 'Good workout'][Math.floor(Math.random() * 4)] : undefined,
                                    timestamp: entryDate,
                                    tags: [],
                                    activities: []
                                  });
                                }
                              }

                              setEntries(sampleData);
                              saveToStorage('northstar_mood_entries', sampleData);
                            };

                            generateSampleData();
                          }}
                          className="btn-secondary text-sm w-full"
                        >
                          🧪 Generate Sample Data (Dev)
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Line Chart - Mood over last 7 days */}
                    <MoodLineChart entries={entries} />

                    {/* Bar Chart - Most common moods this month */}
                    <MoodBarChart entries={entries} />
                  </>
                )}
              </div>
            )}

            {/* Calendar view */}
            {viewMode === 'calendar' && (
              <MoodCalendarHeatmap entries={entries} />
            )}

            {/* Stats view */}
            {viewMode === 'stats' && statsData && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="card p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {statsData.total}
                    </div>
                    <div className="text-gray-600">Total Entries</div>
                  </div>

                  <div className="card p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {statsData.averageAllTime.toFixed(1)}
                    </div>
                    <div className="text-gray-600">Average Mood</div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood Distribution</h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((mood) => {
                      const count = entries.filter(e => e.mood === mood).length;
                      const percentage = statsData.total > 0 ? (count / statsData.total) * 100 : 0;

                      return (
                        <div key={mood} className="flex items-center gap-3">
                          <span className="text-lg">{getMoodEmoji(mood as MoodLevel)}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{getMoodLabel(mood as MoodLevel)}</span>
                              <span>{count} entries</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  backgroundColor: getMoodColor(mood as MoodLevel),
                                  width: `${percentage}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Quick stats */}
            {statsData && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">This week</span>
                    <span className="font-medium">{statsData.last7Days} entries</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This month</span>
                    <span className="font-medium">{statsData.last30Days} entries</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trend</span>
                    <span
                      className={`font-medium ${
                        statsData.trend === 'improving' ? 'text-green-600' :
                        statsData.trend === 'declining' ? 'text-red-600' :
                        'text-gray-600'
                      }`}
                    >
                      {statsData.trend === 'improving' ? '📈 Improving' :
                       statsData.trend === 'declining' ? '📉 Declining' :
                       '➡️ Stable'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly insights from Pip */}
            {weeklyInsight && (
              <div className="card p-6 bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200">
                <div className="flex items-start gap-3 mb-3">
                  <PipPenguin size="sm" mood="happy" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">🐧 Pip's Weekly Insight</h3>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      This week
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {weeklyInsight}
                </p>
              </div>
            )}
            
            {insightLoading && (
              <div className="card p-6 bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-gray-600 text-sm">Pip is thinking about your week... 🐧</span>
                </div>
              </div>
            )}

            {/* Your year with Pip summary */}
            {yearlyStats && (
              <div className="card p-6 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">🎊</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Your {yearlyStats.year} with Pip</h3>
                    <p className="text-xs text-orange-600">A year of growth and self-care</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      💬 Total chats
                    </span>
                    <span className="font-bold text-orange-600">{yearlyStats.totalChats}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      🔥 Longest streak
                    </span>
                    <span className="font-bold text-orange-600">{yearlyStats.streakRecord} days</span>
                  </div>
                  
                  {yearlyStats.mostCommonMood && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        😊 Most common mood
                      </span>
                      <span className="font-bold text-orange-600">
                        {getMoodEmoji(yearlyStats.mostCommonMood)} {getMoodLabel(yearlyStats.mostCommonMood)}
                      </span>
                    </div>
                  )}
                  
                  {yearlyStats.bestMonth && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        ⭐ Best month
                      </span>
                      <span className="font-bold text-orange-600">{yearlyStats.bestMonth}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-orange-200">
                  <p className="text-xs text-orange-700 text-center font-medium">
                    🐧 Every step forward matters - proud of your journey! 💙
                  </p>
                </div>
              </div>
            )}

            {/* Journal prompts */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Reflection Prompts</h3>
              <div className="space-y-3">
                {journalPrompts.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => {
                      setNote(prompt.question + '\n\n');
                      setShowAddEntry(true);
                    }}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      {prompt.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {prompt.question}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}