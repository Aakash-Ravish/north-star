import Anthropic from '@anthropic-ai/sdk';
import webpush from 'web-push';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:contact@northstar.app', // Replace with your email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const getSystemPromptForNotificationStyle = (style: string) => {
  const basePrompt = "You are Pip, the friendly penguin companion from North Star. Generate ONE daily reminder quote that is personal, encouraging, and perfect for a push notification (max 120 characters).";

  const stylePrompts = {
    stoic: `${basePrompt} Channel ancient wisdom with modern warmth. Be philosophical but accessible, focusing on resilience, acceptance, and inner strength. Think Marcus Aurelius meets a caring friend.`,
    motivational: `${basePrompt} Be energizing and action-oriented! Focus on progress, achievement, and pushing forward. Use empowering language that makes someone want to tackle their goals.`,
    funny: `${basePrompt} Be playful and humorous! Include gentle penguin jokes, wordplay, or light-hearted observations. Make someone smile while still being encouraging.`,
    gentle: `${basePrompt} Be soft, nurturing, and comforting. Focus on self-compassion, small steps, and gentle encouragement. Perfect for someone who needs tender support.`,
    random: `${basePrompt} Surprise me! Mix any of the above styles or create something unexpected but still caring. Be creative while keeping Pip's warm personality.`
  };

  return stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.gentle;
};

const getPipNotificationMessage = (style: string, quote: string) => {
  const pipMessages = {
    stoic: `🧊 Ancient penguin wisdom: ${quote}`,
    motivational: `🚀 Your penguin coach says: ${quote}`,
    funny: `😄 A penguin just waddled 4000 miles to tell you: ${quote} Also, open the app! 🐧`,
    gentle: `💙 Pip whispers softly: ${quote}`,
    random: `🎲 Random penguin fact: you're amazing! Also: ${quote}`
  };

  return pipMessages[style as keyof typeof pipMessages] || pipMessages.gentle;
};

const FALLBACK_QUOTES = {
  stoic: "What we choose to focus on becomes our reality. Choose wisely today. 🧊",
  motivational: "Every expert was once a beginner. Your journey matters! 🚀",
  funny: "Why did the penguin cross the road? To remind you that you're doing great! 🐧",
  gentle: "Be kind to yourself today. Small steps count. 💙",
  random: "Plot twist: you're more capable than you think! ✨"
};

// Store daily quotes to avoid repetition
const dailyQuoteCache = new Map<string, { quote: string; date: string }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, style = 'gentle', userId } = body;

    if (!subscription || !subscription.endpoint) {
      return Response.json(
        { error: 'Push subscription required' },
        { status: 400 }
      );
    }

    // Check if we already generated a quote today for this style
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const cacheKey = `${style}-${today}`;
    
    let quote = '';
    let generated = false;

    // Check cache first
    const cachedQuote = dailyQuoteCache.get(cacheKey);
    if (cachedQuote && cachedQuote.date === today) {
      quote = cachedQuote.quote;
      generated = false; // Use cached
    } else {
      // Generate fresh quote using Anthropic
      try {
        const systemPrompt = getSystemPromptForNotificationStyle(style);
        
        const response = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 80,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: `Generate a daily reminder for ${new Date().toLocaleDateString()}. Make it feel personal and encouraging, as if Pip is speaking directly to a friend. Keep it under 120 characters for a notification. Date context: ${today}`
            }
          ],
        });

        const firstBlock = response.content[0];
        const generatedQuote = (firstBlock.type === 'text' ? firstBlock.text?.trim() : '') || FALLBACK_QUOTES[style as keyof typeof FALLBACK_QUOTES];
        
        // Cache the quote for the day
        quote = generatedQuote;
        dailyQuoteCache.set(cacheKey, { quote, date: today });
        generated = true;

        // Clean old cache entries (keep only today's)
        for (const [key, value] of dailyQuoteCache.entries()) {
          if (value.date !== today) {
            dailyQuoteCache.delete(key);
          }
        }

      } catch (error) {
        console.error('Failed to generate quote:', error);
        quote = FALLBACK_QUOTES[style as keyof typeof FALLBACK_QUOTES];
        generated = false;
      }
    }

    // Create Pip's personality-driven notification message
    const notificationBody = getPipNotificationMessage(style, quote);
    
    // Create the push payload
    const pushPayload = JSON.stringify({
      title: `Pip's ${style.charAt(0).toUpperCase() + style.slice(1)} Reminder 🐧`,
      body: notificationBody,
      quote: quote,
      style: style,
      icon: '/icon-192x192.png',
      data: {
        url: '/',
        style: style,
        timestamp: Date.now(),
        userId: userId
      }
    });

    // Send the push notification
    await webpush.sendNotification(subscription, pushPayload);

    return Response.json({
      success: true,
      quote: quote,
      style: style,
      generated: generated,
      date: today,
      message: 'Notification sent successfully! 🐧'
    });

  } catch (error) {
    console.error('Notification sending error:', error);
    
    return Response.json(
      { 
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return Response.json({
    status: 'ready',
    service: 'North Star Push Notification API',
    vapidConfigured: !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString()
  });
}
