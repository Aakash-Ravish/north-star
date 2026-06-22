'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PipPenguin from '@/components/PipPenguin';
import { loadFromStorage, getMoodEmoji, getMoodLabel, getMoodColor } from '@/utils';
import { MoodEntry, MoodLevel, User, Streak } from '@/types';

// ─── Dashboard (returning user) ──────────────────────────────────────────────

function Dashboard({ user, entries, streak }: { user: User; entries: MoodEntry[]; streak: Streak }) {
  const router = useRouter();
  const recentMood = entries.length > 0
    ? [...entries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const lastCheckin = recentMood
    ? new Date(recentMood.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const avgMood = entries.length > 0
    ? (entries.slice(-7).reduce((s, e) => s + e.mood, 0) / Math.min(entries.length, 7)).toFixed(1)
    : null;

  const quickActions = [
    { icon: '💬', label: 'Chat with Pip', sub: 'Talk it out', path: '/chat', color: 'from-blue-400 to-blue-500' },
    { icon: '📊', label: 'Log mood', sub: 'How are you?', path: '/journal', color: 'from-emerald-400 to-green-500' },
    { icon: '✨', label: 'Your insights', sub: 'Patterns & trends', path: '/insights', color: 'from-purple-400 to-indigo-500' },
    { icon: '🧘', label: 'Activities', sub: 'Wellness exercises', path: '/activities', color: 'from-orange-400 to-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/20">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PipPenguin size="sm" mood="happy" />
            <span className="font-semibold text-gray-800">North Star</span>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
          >
            ⚙️
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Welcome hero */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">{today}</p>
              <h1 className="text-2xl font-bold mt-1">
                Hey {user.name} 👋
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                {recentMood
                  ? `Last check-in: ${getMoodEmoji(recentMood.mood as MoodLevel)} ${getMoodLabel(recentMood.mood as MoodLevel)} · ${lastCheckin}`
                  : "Pip's waiting to hear from you"}
              </p>
            </div>
            <PipPenguin size="md" mood={recentMood ? (recentMood.mood >= 4 ? 'happy' : recentMood.mood >= 3 ? 'calm' : 'concerned') : 'playful'} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-orange-500">{streak.current}</div>
            <div className="text-xs text-gray-500 mt-0.5">day streak 🔥</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-500">{entries.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">total entries</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-500">{avgMood ?? '—'}</div>
            <div className="text-xs text-gray-500 mt-0.5">avg mood (7d)</div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(action => (
              <button
                key={action.path}
                onClick={() => router.push(action.path)}
                className="group bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-lg mb-3 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  {action.icon}
                </div>
                <div className="font-semibold text-gray-800 text-sm">{action.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{action.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent mood strip */}
        {entries.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Last 7 days</h2>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex gap-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  const entry = entries.find(e => {
                    const ed = new Date(e.timestamp);
                    const ek = `${ed.getFullYear()}-${String(ed.getMonth() + 1).padStart(2, '0')}-${String(ed.getDate()).padStart(2, '0')}`;
                    return ek === dateKey;
                  });
                  const isToday = i === 6;
                  return (
                    <div key={dateKey} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full aspect-square rounded-xl flex items-center justify-center text-lg transition-transform hover:scale-110 cursor-default"
                        style={{
                          backgroundColor: entry ? `${getMoodColor(entry.mood as MoodLevel)}22` : '#F3F4F6',
                          border: isToday ? `2px solid ${entry ? getMoodColor(entry.mood as MoodLevel) : '#CBD5E1'}` : '2px solid transparent',
                        }}
                      >
                        {entry ? getMoodEmoji(entry.mood as MoodLevel) : ''}
                      </div>
                      <span className="text-xs text-gray-400">
                        {d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Pip's tip */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-100">
          <div className="flex gap-3">
            <div className="text-2xl flex-shrink-0">🐧</div>
            <div>
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Pip's daily thought</div>
              <p className="text-sm text-amber-900 leading-relaxed">
                {entries.length === 0
                  ? "Your first check-in is the hardest. It gets easier — and more rewarding — from there."
                  : streak.current >= 7
                  ? `${streak.current} days in a row! You're building something real. Keep it going. 🌟`
                  : entries.length < 5
                  ? "Every entry teaches me a little more about you. The more we talk, the better I understand what helps."
                  : "Small moments of reflection add up. You're doing great by just showing up."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Landing page (new user) ─────────────────────────────────────────────────

function Landing() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 200),
      setTimeout(() => setStep(2), 700),
      setTimeout(() => setStep(3), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const features = [
    {
      icon: '💬',
      title: 'Talk to Pip',
      desc: 'A judgment-free space, any time of day. Pip listens, reflects, and never judges.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: '📊',
      title: 'Track your mood',
      desc: 'Log how you feel in seconds. Watch patterns emerge over days and weeks.',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: '✨',
      title: 'See your story',
      desc: 'Beautiful visualizations of your inner life — heatmaps, arcs, and your Pip Wrapped.',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/40 flex flex-col">

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center">

        {/* Pip */}
        <div className={`transition-all duration-700 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-blue-200 rounded-full blur-2xl opacity-40 scale-150" />
            <PipPenguin size="xl" mood="playful" className="relative z-10" />
          </div>
        </div>

        {/* Title */}
        <div className={`transition-all duration-700 delay-100 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-gray-900 mb-3">
            North{' '}
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Star
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-sm mx-auto leading-relaxed">
            Your personal mental wellness companion.{' '}
            <span className="text-blue-600 font-medium">Meet Pip.</span>
          </p>
        </div>

        {/* CTA */}
        <div className={`mt-8 transition-all duration-700 delay-200 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={() => router.push('/onboarding')}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200"
          >
            Meet Pip 🐧
          </button>
          <p className="text-xs text-gray-400 mt-3">
            Free · No account · Stays on your device
          </p>
        </div>
      </div>

      {/* Features */}
      <div className={`px-6 pb-10 max-w-xl mx-auto w-full transition-all duration-700 delay-300 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="space-y-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-4 flex gap-4 items-start shadow-sm border border-gray-100"
              style={{ transitionDelay: `${300 + i * 80}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${f.color}`}>
                {f.icon}
              </div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{f.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed px-4">
          Pip is a friendly AI companion, not a therapist or crisis service.
          If you're struggling, reach a trained human at{' '}
          <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline">
            findahelpline.com
          </a>
          {' '}or call your local emergency number.
        </p>
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function Home() {
  const [state, setState] = useState<'loading' | 'dashboard' | 'landing'>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0, lastDate: new Date(), lastVisit: new Date() });

  useEffect(() => {
    const u = loadFromStorage<User | null>('northstar_user', null);
    if (!u) { setState('landing'); return; }

    setUser(u);
    const raw = loadFromStorage<any[]>('northstar_mood_entries', []);
    const parsed: MoodEntry[] = raw.map(e => ({ ...e, timestamp: new Date(e.timestamp) }));
    setEntries(parsed);

    const s = loadFromStorage<Streak>('northstar_streak', { current: 0, longest: 0, lastDate: new Date(), lastVisit: new Date() });
    setStreak(s);

    setState('dashboard');
  }, []);

  if (state === 'loading') return null;
  if (state === 'landing') return <Landing />;
  return <Dashboard user={user!} entries={entries} streak={streak} />;
}
