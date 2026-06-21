import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getClientIp, isRateLimited, tooManyRequests } from '@/lib/rate-limit';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'pip';
  timestamp: string;
}

interface ExtractMomentRequest {
  messages: ChatMessage[];
  userName: string;
}

export async function POST(request: NextRequest) {
  try {
    // Basic abuse guard before spending tokens.
    if (isRateLimited(getClientIp(request), { namespace: "extract-moment", max: 15 })) {
      return tooManyRequests();
    }

    const { messages, userName }: ExtractMomentRequest = await request.json();

    if (!messages || messages.length === 0) {
      return Response.json({
        success: false,
        error: 'No messages provided'
      }, { status: 400 });
    }

    // Filter to only recent conversation (last 10 messages max)
    const recentMessages = messages.slice(-10);
    
    // Create conversation context for analysis
    const conversationText = recentMessages
      .map(msg => `${msg.sender === 'pip' ? 'Pip' : userName}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `You are analyzing a conversation between ${userName} and Pip (a friendly penguin mental health companion) to find the most meaningful, uplifting, or memorable moment to turn into a shareable card.

Your task: Extract the single BEST quote from Pip that would make someone want to share it - something that's:
- Emotionally resonant and uplifting
- Universally relatable (not too personal/specific)
- Shows Pip's caring personality
- Would inspire or comfort others
- Short enough for a social media card (max 280 characters)
- Feels warm and authentic, not generic

Focus on Pip's messages only. Look for:
- Encouraging insights or wisdom
- Heartwarming support that others could relate to
- Gentle humor or penguin personality moments
- Universal truths about growth, self-care, or resilience
- Messages that feel genuinely helpful and shareable

Return ONLY the quote text itself, nothing else. If no good shareable moment exists, return a gentle fallback that captures Pip's essence.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Find the best shareable moment from this conversation:

${conversationText}

Return only the quote text that would make the best shareable card.`
        }
      ],
    });

    const firstBlock = response.content[0];
    let bestQuote = (firstBlock.type === 'text' ? firstBlock.text?.trim() : '') || '';

    // Clean up the quote (remove quotes if AI added them)
    bestQuote = bestQuote.replace(/^["'`]+|["'`]+$/g, '');

    // Fallback quotes if extraction fails or quote is too short
    const fallbackQuotes = [
      "Every small step forward matters. You're doing better than you think! 🐧💙",
      "Some days are for big leaps, some for tiny waddles. Both count. 💙",
      "You're braver than you believe and stronger than you seem. Keep going! 🐧",
      "Even penguins have rough days, but we always find our way back to the sun. ✨",
      "Self-care isn't selfish - it's how you keep your heart open to the world. 💙"
    ];

    // Use fallback if quote is too short or doesn't feel right
    if (bestQuote.length < 20 || bestQuote.length > 280) {
      bestQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    }

    return Response.json({
      success: true,
      quote: bestQuote,
      generated: firstBlock.type === 'text' && bestQuote === firstBlock.text?.trim(),
      conversation_length: recentMessages.length
    });

  } catch (error) {
    console.error('Extract moment error:', error);
    
    // Return fallback quote on error
    const fallbackQuote = "Every moment of self-care is a victory. You're doing great! 🐧💙";
    
    return Response.json({
      success: true,
      quote: fallbackQuote,
      generated: false,
      fallback: true
    });
  }
}

export async function GET() {
  return Response.json({
    status: 'ready',
    service: 'North Star Moment Extraction API',
    description: 'Extracts the most meaningful quotes from conversations for shareable cards'
  });
}
