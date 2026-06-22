'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { MoodEntry, MoodLevel, User } from '@/types';
import { loadFromStorage, getMoodEmoji, getMoodLabel, getMoodColor } from '@/utils';

// ─── helpers ────────────────────────────────────────────────────────────────

const MOOD_COLORS: Record<number, string> = {
  0: '#F3F4F6', // no data — gray-100
  1: '#FCA5A5', // red-300
  2: '#FD8B4A', // orange-400
  3: '#FDE68A', // amber-200
  4: '#86EFAC', // green-300
  5: '#34D399', // emerald-400
};

const MOOD_BG: Record<number, string> = {
  1: 'bg-red-100 text-red-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-amber-100 text-amber-700',
  4: 'bg-green-100 text-green-700',
  5: 'bg-emerald-100 text-emerald-700',
};

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildHeatmapGrid(entries: MoodEntry[]) {
  const byDate: Record<string, number> = {};
  entries.forEach(e => {
    const k = toDateKey(new Date(e.timestamp));
    byDate[k] = Math.max(byDate[k] ?? 0, e.mood);
  });

  // 52 full weeks ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weeks: { date: Date; mood: number; key: string }[][] = [];
  // start on the Sunday 51 weeks ago
  const start = new Date(today);
  start.setDate(start.getDate() - 7 * 51 - today.getDay());

  for (let w = 0; w < 52; w++) {
    const week: { date: Date; mood: number; key: string }[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(start);
      cell.setDate(start.getDate() + w * 7 + d);
      const key = toDateKey(cell);
      week.push({ date: cell, mood: byDate[key] ?? 0, key });
    }
    weeks.push(week);
  }
  return { weeks, byDate };
}

function buildArcData(entries: MoodEntry[]) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  return sorted.map(e => ({
    date: new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: e.mood,
    label: getMoodLabel(e.mood),
    emoji: getMoodEmoji(e.mood),
  }));
}

function computeWrapped(entries: MoodEntry[]) {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // dominant mood
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  entries.forEach(e => counts[e.mood]++);
  const dominant = Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]) as MoodLevel;

  // average mood
  const avg = entries.reduce((s, e) => s + e.mood, 0) / entries.length;

  // longest streak (consecutive days with any entry)
  const days = [...new Set(entries.map(e => toDateKey(new Date(e.timestamp))))].sort();
  let streak = 1, best = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    streak = diff === 1 ? streak + 1 : 1;
    best = Math.max(best, streak);
  }

  // best day of week
  const byDow: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  entries.forEach(e => byDow[new Date(e.timestamp).getDay()].push(e.mood));
  const dowAvg = Object.entries(byDow).map(([d, ms]) => ({
    day: Number(d),
    avg: ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length : 0,
  }));
  const bestDow = dowAvg.sort((a, b) => b.avg - a.avg)[0];
  const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // trend (last 7 vs prior 7)
  const last7 = sorted.slice(-7).map(e => e.mood);
  const prior7 = sorted.slice(-14, -7).map(e => e.mood);
  const last7avg = last7.reduce((a, b) => a + b, 0) / (last7.length || 1);
  const prior7avg = prior7.reduce((a, b) => a + b, 0) / (prior7.length || 1);
  const trend = prior7.length === 0 ? 'stable'
    : last7avg > prior7avg + 0.3 ? 'improving'
    : last7avg < prior7avg - 0.3 ? 'declining'
    : 'stable';

  return {
    total: entries.length,
    dominant,
    avg: Math.round(avg * 10) / 10,
    bestStreak: best,
    bestDay: DOW[bestDow.day],
    trend,
    firstEntry: sorted[0],
  };
}

// ─── sub-components ──────────────────────────────────────────────────────────

function HeatmapTooltip({ cell }: { cell: { date: Date; mood: number } | null }) {
  if (!cell) return null;
  return (
    <div className="absolute z-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-xl -translate-x-1/2 -translate-y-full -top-2 left-1/2 whitespace-nowrap">
      {cell.mood > 0
        ? `${getMoodEmoji(cell.mood as MoodLevel)} ${getMoodLabel(cell.mood as MoodLevel)}`
        : 'No entry'}
      <div className="text-gray-400">
        {cell.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}

function MoodHeatmap({ entries }: { entries: MoodEntry[] }) {
  const { weeks } = buildHeatmapGrid(entries);
  const [hovered, setHovered] = useState<{ date: Date; mood: number; x: number; y: number } | null>(null);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // month labels: find first week where month changes
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const m = week[0].date.getMonth();
    if (m !== lastMonth) { monthLabels.push({ label: MONTHS[m], col: wi }); lastMonth = m; }
  });

  return (
    <div className="overflow-x-auto">
      <div className="relative" style={{ minWidth: 700 }}>
        {/* Month labels */}
        <div className="flex mb-1" style={{ paddingLeft: 28 }}>
          {monthLabels.map(({ label, col }) => (
            <div key={label + col} className="text-xs text-gray-400" style={{ position: 'absolute', left: 28 + col * 14 }}>{label}</div>
          ))}
        </div>
        <div className="flex mt-5 gap-1">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-1 mr-1">
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
              <div key={i} className="text-xs text-gray-400 h-3 leading-3" style={{ width: 20 }}>{d}</div>
            ))}
          </div>
          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell) => (
                <div
                  key={cell.key}
                  className="rounded-sm cursor-pointer transition-transform hover:scale-125 hover:z-10 relative"
                  style={{ width: 12, height: 12, backgroundColor: MOOD_COLORS[cell.mood] }}
                  onMouseEnter={e => {
                    const r = (e.target as HTMLElement).getBoundingClientRect();
                    setHovered({ ...cell, x: r.left, y: r.top });
                  }}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <span>Less</span>
          {[0, 2, 3, 4, 5].map(m => (
            <div key={m} className="w-3 h-3 rounded-sm" style={{ backgroundColor: MOOD_COLORS[m] }} />
          ))}
          <span>More</span>
        </div>
      </div>
      {/* Floating tooltip */}
      {hovered && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-xl"
          style={{ left: hovered.x, top: hovered.y - 52 }}
        >
          {hovered.mood > 0
            ? `${getMoodEmoji(hovered.mood as MoodLevel)} ${getMoodLabel(hovered.mood as MoodLevel)}`
            : 'No entry'}
          <div className="text-gray-400">
            {hovered.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      )}
    </div>
  );
}

function EmotionArc({ entries }: { entries: MoodEntry[] }) {
  const data = buildArcData(entries);
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Log at least 2 mood entries to see your arc
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-sm">
          <div className="font-medium">{d.emoji} {d.label}</div>
          <div className="text-gray-500 text-xs">{d.date}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#378ADD" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#378ADD" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} interval="preserveStartEnd" />
        <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="mood"
          stroke="#378ADD"
          strokeWidth={2.5}
          fill="url(#moodGrad)"
          dot={{ r: 3, fill: '#378ADD', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#378ADD' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value, duration]);

  return <>{display}</>;
}

function WrappedCard({ emoji, value, label, sublabel, colorClass, delay }: {
  emoji: string; value: string | number; label: string; sublabel?: string;
  colorClass: string; delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-1 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${colorClass}`}>
      <div className="text-3xl">{emoji}</div>
      <div className="text-2xl font-bold leading-none">{value}</div>
      <div className="text-sm font-medium">{label}</div>
      {sublabel && <div className="text-xs opacity-70">{sublabel}</div>}
    </div>
  );
}

function PipWrapped({ entries }: { entries: MoodEntry[] }) {
  const w = computeWrapped(entries);

  if (!w) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-5xl mb-3">🐧</div>
        <p className="text-sm">Start logging moods to unlock your Pip Wrapped</p>
      </div>
    );
  }

  const trendEmoji = w.trend === 'improving' ? '📈' : w.trend === 'declining' ? '📉' : '〰️';
  const trendLabel = w.trend === 'improving' ? 'Trending up' : w.trend === 'declining' ? 'Trending down' : 'Holding steady';

  const since = new Date(w.firstEntry.timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Pip's summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 flex gap-4 items-start">
        <div className="text-4xl">🐧</div>
        <div>
          <div className="font-semibold text-gray-800 mb-1">Pip's take</div>
          <p className="text-sm text-gray-600 leading-relaxed">
            You've logged <strong>{w.total} mood entries</strong> since {since}.
            {' '}Your average mood is <strong>{w.avg}/5</strong> — {w.avg >= 4 ? "you're doing great" : w.avg >= 3 ? "you're holding up" : "it's been a tough stretch"}.
            {' '}{w.bestDay}s are your best day of the week. Keep that pattern going. 🐧✨
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <WrappedCard
          emoji={getMoodEmoji(w.dominant)}
          value={getMoodLabel(w.dominant)}
          label="Dominant mood"
          sublabel="Most common feeling"
          colorClass={`${MOOD_BG[w.dominant]} bg-opacity-40`}
          delay={0}
        />
        <WrappedCard
          emoji="🔥"
          value={w.bestStreak}
          label={w.bestStreak === 1 ? 'day streak' : 'day streak'}
          sublabel="Longest check-in run"
          colorClass="bg-orange-50 text-orange-800"
          delay={150}
        />
        <WrappedCard
          emoji="📅"
          value={w.bestDay.slice(0, 3)}
          label="Best day"
          sublabel="Highest avg mood"
          colorClass="bg-blue-50 text-blue-800"
          delay={300}
        />
        <WrappedCard
          emoji={trendEmoji}
          value={trendLabel}
          label="Recent trend"
          sublabel="Last 7 vs prior 7"
          colorClass="bg-purple-50 text-purple-800"
          delay={450}
        />
      </div>

      {/* Total entries hero */}
      <div className="text-center py-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white">
        <div className="text-6xl font-black tracking-tight">
          <AnimatedNumber value={w.total} />
        </div>
        <div className="text-gray-300 text-sm mt-1">mood entries logged</div>
        <div className="text-gray-500 text-xs mt-2">since {since}</div>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

type Tab = 'heatmap' | 'arc' | 'wrapped';

export default function InsightsPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>('heatmap');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const u = loadFromStorage<User | null>('northstar_user', null);
    if (!u) { router.push('/onboarding'); return; }
    setUser(u);

    const raw = loadFromStorage<any[]>('northstar_mood_entries', []);
    setEntries(raw.map(e => ({ ...e, timestamp: new Date(e.timestamp) })));
    setLoaded(true);
  }, [router]);

  if (!loaded) return null;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'heatmap', label: 'Mood calendar', icon: '🗓️' },
    { key: 'arc', label: 'Emotion arc', icon: '📈' },
    { key: 'wrapped', label: 'Pip Wrapped', icon: '🎁' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.push('/chat')} className="text-gray-400 hover:text-gray-600 transition-colors">
            ← Back
          </button>
          <span className="font-semibold text-gray-800">Your Insights</span>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.name ? `${user.name}'s` : 'Your'} inner life
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {entries.length} mood entries &middot; {entries.length > 0
              ? `since ${new Date(Math.min(...entries.map(e => new Date(e.timestamp).getTime()))).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              : 'start logging to see patterns'}
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Panels */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {tab === 'heatmap' && (
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-4">52-week mood calendar</h2>
              <MoodHeatmap entries={entries} />
              {entries.length === 0 && (
                <p className="text-sm text-gray-400 mt-4 text-center">
                  Log your first mood in the journal to fill the calendar
                </p>
              )}
            </div>
          )}
          {tab === 'arc' && (
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-4">Emotion arc over time</h2>
              <EmotionArc entries={entries} />
            </div>
          )}
          {tab === 'wrapped' && (
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-4">Pip Wrapped</h2>
              <PipWrapped entries={entries} />
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="flex justify-center gap-4 pb-4">
          <button
            onClick={() => router.push('/journal')}
            className="text-sm text-blue-600 hover:underline"
          >
            📖 Add a mood entry
          </button>
          <span className="text-gray-300">·</span>
          <button
            onClick={() => router.push('/chat')}
            className="text-sm text-blue-600 hover:underline"
          >
            💬 Chat with Pip
          </button>
        </div>
      </div>
    </div>
  );
}
