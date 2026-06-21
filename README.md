# North Star - Mental Health Companion App

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR-USERNAME%2FNORTH-STAR&env=ANTHROPIC_API_KEY,NEXT_PUBLIC_ADMIN_PASSWORD,NEXT_PUBLIC_VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY&envDescription=API%20keys%20and%20configuration%20needed%20for%20North%20Star)

A cheerful, safe space for mental wellness with **Pip**, your friendly penguin companion. Built with Next.js 16, React 19, and Tailwind CSS 4.

## ✨ Features

### 🐧 **Meet Pip**
- Animated SVG penguin that bobs, blinks, and reacts to your mood
- Multiple personality modes: Cheerful, Calm, Supportive, and Playful
- Mood-reactive expressions and animations

### 🎯 **Core Pages**
- **Landing Page** (`/`) - Beautiful welcome experience
- **Onboarding** (`/onboarding`) - 3-step setup flow
- **Chat** (`/chat`) - Main conversation interface with Pip
- **Journal** (`/journal`) - Mood tracking and history
- **Admin** (`/admin`) - Settings and data management

### 🧩 **Components**
- **PipPenguin** - Animated companion with mood reactions
- **ChatBubble** - Beautiful message bubbles with timestamps
- **VoiceButton** - Voice recording interface
- **MoodPicker** - 5-level mood selection with emojis
- **StreakCounter** - Daily habit tracking with milestones

### 🎨 **Design System**
- **Primary Blue**: `#378ADD` - Main brand color
- **Mood Colors**: Greens for positive moods, yellows for playful
- **Smooth Animations**: Bob, blink, pulse, and slide transitions
- **Responsive**: Mobile-first design with desktop optimization

### 💾 **Data Management**
- Local storage only - completely private
- Chat history and mood entries
- Streak tracking and achievements
- Export/import functionality
- Complete data deletion option

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🚀 Deployment to Vercel

### Quick Deploy

Click the deploy button above to instantly deploy to Vercel, or follow the manual steps below.

### Manual Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy North Star to Vercel"
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

3. **Configure Environment Variables**
   
   In the Vercel dashboard, add these environment variables:
   
   **Required:**
   - `ANTHROPIC_API_KEY` - Your Anthropic Claude API key
   - `NEXT_PUBLIC_ADMIN_PASSWORD` - Admin panel password (e.g., "northstar123")
   
   **Optional (for push notifications):**
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - VAPID public key for push notifications
   - `VAPID_PRIVATE_KEY` - VAPID private key for push notifications

4. **Deploy**
   - Click "Deploy"
   - Your North Star app will be live in ~2 minutes!

### Environment Variables

Copy `.env.example` to `.env.local` for local development and fill in your values:

```bash
cp .env.example .env.local
```

**Required for basic functionality:**
- `ANTHROPIC_API_KEY` - Get from [Anthropic Console](https://console.anthropic.com/)

**Required for push notifications:**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` - Generate with [web-push CLI](https://github.com/web-push-libs/web-push#command-line)

**Optional for analytics:**
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` and `NEXT_PUBLIC_UMAMI_URL` - See [UMAMI-SETUP.md](./UMAMI-SETUP.md) for privacy-focused analytics

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout with fonts and metadata
│   ├── page.tsx           # Landing page
│   ├── onboarding/        # 3-step user setup
│   ├── chat/              # Main chat interface
│   ├── journal/           # Mood tracking and history
│   └── admin/             # Settings and admin panel
├── components/            # Reusable UI components
│   ├── PipPenguin.tsx     # Animated companion
│   ├── ChatBubble.tsx     # Message display
│   ├── VoiceButton.tsx    # Voice recording
│   ├── MoodPicker.tsx     # Mood selection
│   └── StreakCounter.tsx  # Habit tracking
├── types/                 # TypeScript definitions
│   └── index.ts          # All app types
└── utils/                 # Helper functions
    └── index.ts          # Utilities and logic
```

## 🧠 Key Features

### Onboarding Flow
1. **Name Collection** - Personal greeting setup
2. **Join Reason** - Understanding user goals
3. **Pip Personality** - Choose companion tone

### Chat Experience
- Real-time conversation with Pip
- Mood-aware responses
- Voice message support (UI ready)
- Daily mood check-ins
- Streak tracking integration

### Journal & Analytics
- Visual mood history (timeline, calendar, stats)
- Mood trend analysis
- Reflection prompts
- Data export capabilities

### Admin Panel
- User profile management
- App settings and preferences
- Voice settings configuration
- Complete data management
- Privacy controls

## 🎭 Pip Personalities

- **Cheerful** - Energetic, positive, encouraging
- **Calm** - Gentle, soothing, mindful
- **Supportive** - Empathetic, understanding, nurturing  
- **Playful** - Light-hearted, humorous, energetic

## 🔒 Privacy & Security

- **Your data lives on your device** - Profile, chat history, moods, and streaks are stored in your browser's local storage. North Star has no user database and no accounts.
- **What leaves your device** - To generate Pip's replies, daily quotes, and weekly insights, the relevant text is sent to Anthropic's Claude API over HTTPS at request time. It is processed to produce a response and is **not** stored by North Star. See [Anthropic's privacy policy](https://www.anthropic.com/legal/privacy) for how the API handles data.
- **Crisis flags are anonymous** - If a message trips crisis detection, the server logs only a severity level and timestamp. No name, no user id, no message content.
- **Analytics (optional)** - If Umami is configured, only privacy-friendly, non-identifying event counts are tracked. Disabled if not configured.
- **Data Export** - Full JSON backup capability.
- **Complete Deletion** - Remove all local data at any time.

> ⚠️ **Not a substitute for professional care.** North Star is a wellness companion, not a medical or crisis service. Pip is an AI penguin, not a therapist. If you are struggling, reach a trained human at [findahelpline.com](https://findahelpline.com) (worldwide), or call your local emergency number if you are in immediate danger.

> 🔑 **Admin password:** set via `NEXT_PUBLIC_ADMIN_PASSWORD`. Because it is a `NEXT_PUBLIC_` variable it is bundled into the client and is **not** a real security boundary — treat the admin panel as a convenience for a single local user, not as protected access.

## 🛠️ Tech Stack

- **Next.js 16** with App Router
- **React 19** with hooks
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Local Storage** for data persistence
- **SVG Animations** for Pip character

## 🎨 Color Palette

```css
/* Brand Colors */
--primary: #378ADD          /* Main blue */
--positive: #4ADE80         /* Success green */
--playful: #FDE047          /* Joy yellow */
--calm: #A78BFA             /* Peace purple */

/* Mood Scale */
Level 1: #EF4444 (red)      /* Very low */
Level 2: #F97316 (orange)   /* Low */
Level 3: #EAB308 (yellow)   /* Okay */
Level 4: #22C55E (green)    /* Good */
Level 5: #10B981 (emerald)  /* Excellent */
```

## 🎪 Animations

- **Bob Animation** - Gentle up/down movement for Pip
- **Blink Animation** - Natural eye blinking every 3-5 seconds
- **Pulse Animation** - Soft scaling for positive interactions
- **Slide Animations** - Smooth page transitions
- **Mood Reactions** - Dynamic expressions based on user mood

## 📱 Responsive Design

- Mobile-first approach
- Sidebar navigation on larger screens
- Touch-friendly interface
- Optimized for accessibility

---

**Built with 💙 for mental wellness and emotional growth**

*Pip is here to remind you that every small step forward matters on your journey to better mental health.*
