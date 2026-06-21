'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface UmamiAnalyticsProps {
  websiteId?: string;
  src?: string;
}

// Extend window object for Umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}

export default function UmamiAnalytics({
  websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  src = process.env.NEXT_PUBLIC_UMAMI_URL
}: UmamiAnalyticsProps) {

  // Don't load analytics in development or if not configured
  if (process.env.NODE_ENV !== 'production' || !websiteId || !src) {
    return null;
  }

  return (
    <Script
      src={`${src}/script.js`}
      data-website-id={websiteId}
      data-domains={typeof window !== 'undefined' ? window.location.hostname : ''}
      data-auto-track="false"
      strategy="afterInteractive"
      onLoad={() => {
        console.log('📊 Umami Analytics loaded (privacy-focused)');
      }}
    />
  );
}

// Custom hook for Umami tracking
export function useUmamiTracking() {
  const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.umami) {
      // Sanitize event data to ensure no PII is sent
      const sanitizedData = eventData ? sanitizeEventData(eventData) : undefined;
      window.umami.track(eventName, sanitizedData);
    }
  };

  const trackPageView = (url?: string) => {
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track('pageview', { url: url || window.location.pathname });
    }
  };

  // Mental health specific tracking (privacy-safe)
  const trackWellnessEvent = (activity: 'breathing' | 'gratitude' | 'mindfulness' | 'chat' | 'mood_check') => {
    trackEvent('wellness_activity', { activity });
  };

  const trackMoodEntry = (level: 1 | 2 | 3 | 4 | 5) => {
    trackEvent('mood_logged', { level });
  };

  const trackStreakMilestone = (days: number) => {
    trackEvent('streak_milestone', { days });
  };

  const trackShareMoment = () => {
    trackEvent('moment_shared');
  };

  const trackVoiceUsage = (action: 'enabled' | 'disabled' | 'message_sent') => {
    trackEvent('voice_interaction', { action });
  };

  return {
    trackEvent,
    trackPageView,
    trackWellnessEvent,
    trackMoodEntry,
    trackStreakMilestone,
    trackShareMoment,
    trackVoiceUsage,
  };
}

// Sanitize event data to ensure no PII is leaked
function sanitizeEventData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    // Only allow safe, non-PII data types
    if (typeof value === 'string') {
      // Remove any potential PII patterns
      const cleanValue = value
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]') // emails
        .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[phone]') // phone numbers
        .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[card]'); // credit cards

      // Only include if it's a known safe category
      if (key.match(/^(activity|level|days|action|page|url|type|category|status)$/)) {
        sanitized[key] = cleanValue.substring(0, 50); // Limit length
      }
    } else if (typeof value === 'number' && value >= 0 && value <= 10000) {
      // Safe numeric values only
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    }
  }

  return sanitized;
}