import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getClientIp, isRateLimited, tooManyRequests } from '@/lib/rate-limit';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const getSystemPromptForTone = (tone: string) => {
  const basePrompt = "You are Pip, the friendly penguin companion from North Star. Generate ONE short, uplifting daily quote (1-2 sentences max) that feels warm and encouraging.";

  const tonePrompts = {
    cheerful: `${basePrompt} Be energetic, positive, and enthusiastic! Use exclamation points and upbeat language.`,
    calm: `${basePrompt} Be gentle, peaceful, and mindful. Use soothing, tranquil language.`,
    supportive: `${basePrompt} Be empathetic, understanding, and nurturing. Focus on emotional support and validation.`,
    playful: `${basePrompt} Be light-hearted, fun, and energetic. Use playful language and maybe include penguin references!`
  };

  return tonePrompts[tone as keyof typeof tonePrompts] || tonePrompts.cheerful;
};

const FALLBACK_QUOTES = {
  cheerful: "Every new day is a fresh chance to spread your wings and soar! You've got this! 🐧✨",
  calm: "Take a deep breath and remember: you're exactly where you need to be right now. 🌊💙",
  supportive: "You're braver than you believe and stronger than you seem. I'm here cheering you on! 🤗💕",
  playful: "Time to waddle into this day with confidence! Let's make some waves together! 🐧🌊"
};

export async function GET(request: NextRequest) {
  try {
    // Basic abuse guard before spending tokens.
    if (isRateLimited(getClientIp(request), { namespace: "quote", max: 30 })) {
      return tooManyRequests();
    }

    const { searchParams } = new URL(request.url);
    const tone = searchParams.get('tone') || 'cheerful';

    // Validate tone
    const validTones = ['cheerful', 'calm', 'supportive', 'playful'];
    const userTone = validTones.includes(tone) ? tone : 'cheerful';

    // Generate quote using AI
    const systemPrompt = getSystemPromptForTone(userTone);

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate a daily motivational quote for ${new Date().toLocaleDateString()}. Make it feel personal and encouraging, as if Pip is speaking directly to a friend who needs some gentle motivation today.`
        }
      ],
    });

    const firstBlock = response.content[0];
    const quote = (firstBlock.type === 'text' ? firstBlock.text?.trim() : '') || FALLBACK_QUOTES[userTone as keyof typeof FALLBACK_QUOTES];

    return Response.json({
      quote,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      tone: userTone,
      generated: true
    });

  } catch (error) {
    console.error('Quote generation error:', error);

    // Return fallback quote
    const tone = new URL(request.url).searchParams.get('tone') || 'cheerful';
    const userTone = ['cheerful', 'calm', 'supportive', 'playful'].includes(tone) ? tone : 'cheerful';

    return Response.json({
      quote: FALLBACK_QUOTES[userTone as keyof typeof FALLBACK_QUOTES],
      date: new Date().toISOString().split('T')[0],
      tone: userTone,
      generated: false,
      fallback: true
    });
  }
}

export async function POST(request: NextRequest) {
  // Health check endpoint
  return Response.json({
    status: 'ready',
    service: 'North Star Daily Quote API',
    model: 'claude-haiku-4-5-20251001',
    timestamp: new Date().toISOString()
  });
}