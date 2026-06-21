import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { style = 'gentle', userName = 'friend' } = body;

    // Generate a preview quote using Anthropic
    let quote = '';
    let generated = false;

    try {
      const systemPrompt = getSystemPromptForNotificationStyle(style);

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 80,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Generate a preview daily reminder for ${userName}. Make it feel personal and encouraging, as if Pip is speaking directly to them. Keep it under 120 characters for a notification. This is a PREVIEW, so make it extra special!`
          }
        ],
      });

      const firstBlock = response.content[0];
      quote = (firstBlock.type === 'text' ? firstBlock.text?.trim() : '') || FALLBACK_QUOTES[style as keyof typeof FALLBACK_QUOTES];
      generated = true;

    } catch (error) {
      console.error('Failed to generate preview quote:', error);
      quote = FALLBACK_QUOTES[style as keyof typeof FALLBACK_QUOTES];
      generated = false;
    }

    // Create Pip's personality-driven notification message
    const notificationBody = getPipNotificationMessage(style, quote);

    // Return preview data
    return Response.json({
      success: true,
      preview: {
        title: `Pip's ${style.charAt(0).toUpperCase() + style.slice(1)} Reminder 🐧`,
        body: notificationBody,
        quote: quote,
        style: style,
        icon: '/icon-192x192.png',
        generated: generated,
        userName: userName
      },
      message: `Preview notification generated for ${style} style! 🐧`
    });

  } catch (error) {
    console.error('Preview generation error:', error);

    return Response.json(
      {
        error: 'Failed to generate notification preview',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return all available styles and their descriptions
  return Response.json({
    service: 'North Star Notification Preview API',
    availableStyles: {
      stoic: {
        name: 'Stoic',
        description: 'Ancient wisdom with modern warmth. Philosophical but accessible.',
        emoji: '🧊',
        example: 'Ancient penguin wisdom: Focus on what you control, let go of the rest.'
      },
      motivational: {
        name: 'Motivational',
        description: 'Energizing and action-oriented. Perfect for goal achievement.',
        emoji: '🚀',
        example: 'Your penguin coach says: Every step forward is a victory!'
      },
      funny: {
        name: 'Funny',
        description: 'Playful and humorous with gentle penguin jokes.',
        emoji: '😄',
        example: 'A penguin just waddled 4000 miles to tell you: You\'re ice-olated amazing! 🐧'
      },
      gentle: {
        name: 'Gentle',
        description: 'Soft, nurturing, and comforting. Focus on self-compassion.',
        emoji: '💙',
        example: 'Pip whispers softly: Be patient with yourself today.'
      },
      random: {
        name: 'Random',
        description: 'Surprise me! Mix of all styles with creative twists.',
        emoji: '🎲',
        example: 'Random penguin fact: you\'re more amazing than you think! ✨'
      }
    },
    usage: {
      preview: 'POST with { "style": "gentle", "userName": "optional" }',
      styles: 'GET for this information'
    }
  });
}