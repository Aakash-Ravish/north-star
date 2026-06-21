'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PipPenguin from '@/components/PipPenguin';
import { User, AppSettings, PipTone, NotificationSettings, NotificationStyle, NotificationTime } from '@/types';
import { loadFromStorage, saveToStorage, getPipResponse } from '@/utils';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportData, setExportData] = useState<string>('');
  const [pushSupported, setPushSupported] = useState(false);

  const ADMIN_PASSWORD = 'northstar123'; // In a real app, this would be properly secured

  useEffect(() => {
    // Check if push notifications are supported
    setPushSupported('serviceWorker' in navigator && 'PushManager' in window);

    const userData = loadFromStorage<User | null>('northstar_user', null);
    if (!userData) {
      router.push('/onboarding');
      return;
    }

    setUser(userData);

    // Load settings with new notification structure
    const defaultNotificationSettings: NotificationSettings = {
      enabled: false,
      style: 'gentle',
      preferredTime: 'morning',
      subscribed: false,
      subscription: null
    };

    const settingsData = loadFromStorage<AppSettings>('northstar_settings', {
      darkMode: false,
      notifications: defaultNotificationSettings,
      voice: {
        enabled: true,
        autoPlay: false,
        speed: 1,
        volume: 0.7
      },
      pipPersonality: userData.preferredTone || 'cheerful'
    });

    // Migration: Convert old boolean notifications to new object structure
    if (typeof (settingsData.notifications as any) === 'boolean') {
      const wasEnabled = (settingsData.notifications as any) as boolean;
      settingsData.notifications = {
        ...defaultNotificationSettings,
        enabled: wasEnabled
      };
      saveToStorage('northstar_settings', settingsData);
    }

    setSettings(settingsData);
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('Incorrect password!');
      setPassword('');
    }
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    if (!settings) return;

    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    saveToStorage('northstar_settings', updatedSettings);
  };

  const updateNotificationSetting = (key: keyof NotificationSettings, value: any) => {
    if (!settings) return;

    const updatedNotifications = { ...settings.notifications, [key]: value };
    const updatedSettings = { ...settings, notifications: updatedNotifications };
    
    setSettings(updatedSettings);
    saveToStorage('northstar_settings', updatedSettings);
  };

  const updateVoiceSetting = (key: keyof AppSettings['voice'], value: any) => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      voice: { ...settings.voice, [key]: value }
    };
    setSettings(updatedSettings);
    saveToStorage('northstar_settings', updatedSettings);
  };

  const updateUserTone = (tone: PipTone) => {
    if (!user) return;

    const updatedUser = { ...user, preferredTone: tone };
    setUser(updatedUser);
    saveToStorage('northstar_user', updatedUser);
    updateSetting('pipPersonality', tone);
  };

  const handleNotificationSubscription = async () => {
    if (!pushSupported) {
      alert('Push notifications are not supported in this browser.');
      return;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      if (!settings?.notifications.subscribed) {
        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });

        // Save subscription
        updateNotificationSetting('subscription', subscription);
        updateNotificationSetting('subscribed', true);
        
        // Store in localStorage as backup
        saveToStorage('northstar_push', subscription);

        alert('🐧 Pip says: Push notifications enabled! I\'ll send you daily reminders.');
      } else {
        // Unsubscribe from push notifications
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }

        updateNotificationSetting('subscription', null);
        updateNotificationSetting('subscribed', false);
        
        // Remove from localStorage
        localStorage.removeItem('northstar_push');

        alert('🐧 Push notifications disabled. I\'ll miss sending you reminders!');
      }
    } catch (error) {
      console.error('Failed to manage push subscription:', error);
      alert('Failed to update notification settings. Please try again.');
    }
  };

  const handleExportData = () => {
    if (!user) return;

    const userData = loadFromStorage('northstar_user', null);
    const chatData = loadFromStorage(`northstar_chat_${user.id}`, []);
    const moodData = loadFromStorage(`northstar_moods_${user.id}`, []);
    const streakData = loadFromStorage(`northstar_streak_${user.id}`, {});
    const settingsData = loadFromStorage('northstar_settings', {});

    const exportObject = {
      exported: new Date().toISOString(),
      user: userData,
      chat: chatData,
      moods: moodData,
      streak: streakData,
      settings: settingsData
    };

    const dataStr = JSON.stringify(exportObject, null, 2);
    setExportData(dataStr);

    // Download as file
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `northstar-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAllData = () => {
    if (!user) return;

    // Remove all stored data
    localStorage.removeItem('northstar_user');
    localStorage.removeItem(`northstar_chat_${user.id}`);
    localStorage.removeItem(`northstar_moods_${user.id}`);
    localStorage.removeItem(`northstar_streak_${user.id}`);
    localStorage.removeItem('northstar_settings');
    localStorage.removeItem('northstar_push');

    // Redirect to home
    router.push('/');
  };

  const getNotificationStyleDescription = (style: NotificationStyle) => {
    const descriptions = {
      stoic: 'Ancient wisdom with modern warmth - philosophical and resilient',
      motivational: 'Energizing and action-oriented - push yourself forward!',
      funny: 'Playful penguin humor - lighthearted and amusing',
      gentle: 'Soft and nurturing - perfect for tender support',
      random: 'Surprise me! - mix of all styles for variety'
    };
    return descriptions[style];
  };

  const getTimeDescription = (time: NotificationTime) => {
    const descriptions = {
      morning: 'Start your day with Pip (8:00 AM)',
      afternoon: 'Midday boost from your penguin friend (1:00 PM)',
      evening: 'Wind down with gentle encouragement (7:00 PM)'
    };
    return descriptions[time];
  };

  if (!user || !settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="card-elevated p-8 text-center">
            <PipPenguin size="lg" mood="calm" className="mb-6 mx-auto" />

            <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Access</h1>
            <p className="text-gray-600 mb-8">
              This area contains sensitive settings. Please enter the admin password.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-center"
                autoFocus
              />

              <button type="submit" className="w-full btn-primary">
                Access Admin Panel
              </button>
            </form>

            <div className="mt-6">
              <button
                onClick={() => router.push('/chat')}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Back to Chat
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-700">
                <strong>Demo password:</strong> northstar123
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
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
                  <h1 className="text-2xl font-bold text-gray-800">Admin Settings</h1>
                  <p className="text-gray-600">Manage your North Star experience</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* User Profile Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Settings</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => {
                  const updatedUser = { ...user, name: e.target.value };
                  setUser(updatedUser);
                  saveToStorage('northstar_user', updatedUser);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pip's Personality
              </label>
              <select
                value={user.preferredTone}
                onChange={(e) => updateUserTone(e.target.value as PipTone)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cheerful">Cheerful & Upbeat</option>
                <option value="calm">Calm & Peaceful</option>
                <option value="supportive">Supportive & Caring</option>
                <option value="playful">Playful & Fun</option>
              </select>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 italic">
              "{getPipResponse(user.preferredTone, 'greeting')}"
            </p>
          </div>
        </div>

        {/* App Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">App Settings</h2>

          <div className="space-y-6">
            {/* Push Notifications */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4">🐧 Daily Reminders from Pip</h3>
              
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-700">Push Notifications</h4>
                  <p className="text-sm text-gray-600">Receive daily encouragement from your penguin friend</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.enabled}
                    onChange={(e) => updateNotificationSetting('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.notifications.enabled && (
                <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                  {/* Browser Permission */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <span className="font-medium text-gray-700">Browser Permission</span>
                      <p className="text-sm text-gray-600">
                        {settings.notifications.subscribed ? 'Subscribed ✅' : 'Click to enable browser notifications'}
                      </p>
                    </div>
                    <button
                      onClick={handleNotificationSubscription}
                      disabled={!pushSupported}
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        settings.notifications.subscribed 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      } ${!pushSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {settings.notifications.subscribed ? 'Unsubscribe' : 'Subscribe'}
                    </button>
                  </div>

                  {/* Notification Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Style
                    </label>
                    <select
                      value={settings.notifications.style}
                      onChange={(e) => updateNotificationSetting('style', e.target.value as NotificationStyle)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="stoic">🧊 Stoic - Ancient wisdom & resilience</option>
                      <option value="motivational">🚀 Motivational - Energy & action</option>
                      <option value="funny">😄 Funny - Penguin humor & jokes</option>
                      <option value="gentle">💙 Gentle - Soft & nurturing</option>
                      <option value="random">🎲 Random - Surprise me!</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {getNotificationStyleDescription(settings.notifications.style)}
                    </p>
                  </div>

                  {/* Preferred Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time
                    </label>
                    <select
                      value={settings.notifications.preferredTime}
                      onChange={(e) => updateNotificationSetting('preferredTime', e.target.value as NotificationTime)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="morning">🌅 Morning - Start your day right</option>
                      <option value="afternoon">☀️ Afternoon - Midday motivation</option>
                      <option value="evening">🌙 Evening - Wind down peacefully</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {getTimeDescription(settings.notifications.preferredTime)}
                    </p>
                  </div>

                  {/* Preview */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 mb-1">
                      <strong>Preview:</strong>
                    </p>
                    <p className="text-sm text-blue-700 italic">
                      "🐧 Pip's {settings.notifications.style.charAt(0).toUpperCase() + settings.notifications.style.slice(1)} Reminder: Your daily dose of penguin wisdom is ready! 💙"
                    </p>
                  </div>
                </div>
              )}

              {!pushSupported && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    Push notifications are not supported in this browser. Try Chrome, Firefox, or Edge for the best experience.
                  </p>
                </div>
              )}
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Dark Mode</h3>
                <p className="text-sm text-gray-600">Switch to dark theme (coming soon)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => updateSetting('darkMode', e.target.checked)}
                  disabled
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full opacity-50 cursor-not-allowed"></div>
              </label>
            </div>

            {/* Voice Settings */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4">Voice Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Voice Messages Enabled</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.voice.enabled}
                      onChange={(e) => updateVoiceSetting('enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Playback Speed: {settings.voice.speed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.voice.speed}
                    onChange={(e) => updateVoiceSetting('speed', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Volume: {Math.round(settings.voice.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.voice.volume}
                    onChange={(e) => updateVoiceSetting('volume', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Data Management</h2>

          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800">Export Data</h3>
                <button
                  onClick={handleExportData}
                  className="btn-secondary"
                >
                  Download JSON
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Download all your North Star data including conversations, mood entries, and settings.
              </p>
            </div>

            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-red-800">Delete All Data</h3>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-secondary text-red-600 border-red-300 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm text-red-600">
                Permanently remove all your data from this device. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">App Information</h2>

          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Version</h3>
              <p className="text-gray-600">North Star v1.0.0</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Data Storage</h3>
              <p className="text-gray-600">Stored on this device. Chat text is sent to Claude to generate replies and isn&apos;t stored by North Star.</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Created</h3>
              <p className="text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Notifications</h3>
              <p className="text-gray-600">
                {settings.notifications.enabled 
                  ? `${settings.notifications.style} style, ${settings.notifications.preferredTime}` 
                  : 'Disabled'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slide-in-up">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Delete All Data?
                </h3>
                <p className="text-gray-600 mb-6">
                  This will permanently remove all your conversations, mood entries, settings, and progress. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllData}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Everything
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
