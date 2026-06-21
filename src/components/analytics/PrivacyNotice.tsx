'use client';

import { useState, useEffect } from 'react';

export default function PrivacyNotice() {
  const [showNotice, setShowNotice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('northstar_analytics_consent');
    if (!consent && process.env.NODE_ENV === 'production') {
      // Show notice after a brief delay for better UX
      setTimeout(() => {
        setShowNotice(true);
        setTimeout(() => setIsVisible(true), 100);
      }, 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('northstar_analytics_consent', 'accepted');
    setIsVisible(false);
    setTimeout(() => setShowNotice(false), 300);

    // Enable analytics
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track('privacy_consent', { choice: 'accepted' });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('northstar_analytics_consent', 'declined');
    setIsVisible(false);
    setTimeout(() => setShowNotice(false), 300);
  };

  if (!showNotice) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-xl shadow-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🐧</span>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-2">
              Privacy-First Analytics
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Pip uses privacy-focused analytics (Umami) to understand how to improve your wellness experience.
              No personal data is collected - only anonymous usage patterns.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                Help improve North Star ✨
              </button>
              <button
                onClick={handleDecline}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                No thanks
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You can change this anytime in Settings.
              <a href="/privacy" className="underline hover:text-blue-600">Learn more</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}