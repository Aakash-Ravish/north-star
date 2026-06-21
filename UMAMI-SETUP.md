# 📊 Umami Analytics Setup Guide

## Overview

North Star now includes privacy-focused analytics with Umami - a free, open-source alternative to Google Analytics that's GDPR compliant and doesn't track personal information.

## ✨ Features Included

### 🛡️ **Privacy-First Design**
- No personal data collection
- GDPR compliant
- User consent mechanism
- Data sanitization for mental health app safety

### 📈 **Mental Health Specific Tracking**
- Wellness activity usage (breathing, gratitude, mindfulness)
- Mood entry patterns (levels only, no content)
- Voice feature adoption
- Streak milestones
- Share moments (frequency only)

### 🎯 **Analytics Events Tracked**
```typescript
// Wellness activities
trackWellnessEvent('breathing' | 'gratitude' | 'mindfulness' | 'chat' | 'mood_check')

// Mood patterns (levels only)
trackMoodEntry(1 | 2 | 3 | 4 | 5)

// Engagement milestones  
trackStreakMilestone(days: number)

// Feature usage
trackVoiceUsage('enabled' | 'disabled' | 'message_sent')
trackShareMoment()
```

## 🚀 Setup Options

### Option 1: Umami Cloud (Recommended - Easy Setup)

1. **Create Account**: Go to [umami.is](https://umami.is) and sign up (free)

2. **Add Website**: 
   - Click "Add Website"
   - Name: "North Star"  
   - Domain: your-domain.com

3. **Get Tracking Code**:
   - Copy your Website ID and tracking URL
   - Add to environment variables:

```bash
# Add to .env.local
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id-here
NEXT_PUBLIC_UMAMI_URL=https://cloud.umami.is
```

4. **Deploy**: Your analytics will start working immediately!

### Option 2: Self-Hosted (Advanced - Maximum Privacy)

1. **Deploy Umami**:
   ```bash
   # Option A: Railway (free tier)
   git clone https://github.com/umami-software/umami
   # Deploy to Railway with PostgreSQL

   # Option B: Vercel + PlanetScale
   # Deploy Umami to Vercel with PlanetScale database

   # Option C: Docker
   docker run -d --name umami -p 3001:3000 ghcr.io/umami-software/umami:postgresql-latest
   ```

2. **Configure Environment**:
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id
   NEXT_PUBLIC_UMAMI_URL=https://your-umami-domain.com
   ```

## 📊 What You'll See in Analytics

### **Page Views**
- Landing page visits
- Chat sessions
- Activities usage
- Journal views

### **Events (Privacy-Safe)**
- Wellness activity completion rates
- Mood check-in frequency  
- Voice feature adoption
- Sharing feature usage
- Streak milestone achievements

### **No Personal Data**
- ❌ No conversation content
- ❌ No mood details/notes
- ❌ No personal information
- ❌ No IP tracking
- ✅ Only anonymous usage patterns

## 🔧 Customization

### Disable Analytics
```typescript
// Set in .env.local
NEXT_PUBLIC_UMAMI_WEBSITE_ID=
NEXT_PUBLIC_UMAMI_URL=
```

### Add Custom Tracking
```typescript
import { useUmamiTracking } from '@/components/analytics/UmamiAnalytics';

function MyComponent() {
  const { trackEvent } = useUmamiTracking();
  
  const handleCustomEvent = () => {
    trackEvent('custom_event', { category: 'engagement' });
  };
}
```

### Privacy Settings
Users can opt-out anytime through:
- Initial privacy notice
- Settings page (coming soon)
- Browser settings (blocking scripts)

## 💰 Cost Comparison

| Service | North Star (Umami) | Alternative | Savings |
|---------|--------------------|-----------|---------| 
| **Analytics** | FREE | Google Analytics (privacy issues) | Privacy + $0 |
| **Analytics** | FREE | PostHog ($20/month) | $240/year |
| **Analytics** | FREE | Mixpanel ($25/month) | $300/year |

## 🛠️ Troubleshooting

### Analytics Not Loading
1. Check environment variables are set
2. Verify Umami instance is running
3. Check browser console for errors
4. Ensure user has given consent

### No Events Showing
1. Wait 5-10 minutes for data to appear
2. Check if consent was given
3. Verify events are firing in browser dev tools
4. Check Umami dashboard filters

### Privacy Compliance
- Analytics only loads after user consent
- All data is anonymized and sanitized
- No PII collection by design
- Users can revoke consent anytime

## 🎯 Benefits for North Star

1. **User Insights**: Understand which wellness features help most
2. **Product Decisions**: Data-driven feature improvements
3. **Privacy Compliance**: GDPR/CCPA compliant by design
4. **Cost Effective**: $0/month vs $20-50/month for paid analytics
5. **Mental Health Safe**: No sensitive data collection

## 📈 Sample Analytics Setup

After setup, you'll see insights like:
- "Breathing exercises completed: 45 times this week"
- "Users who try gratitude practice return 3x more often"
- "Voice features increase session length by 40%"
- "Sharing moments correlates with mood improvement"

**No personal information, just helpful insights to improve the mental health experience!** 🐧💙