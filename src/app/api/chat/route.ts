import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
// Crisis detection, resources, response copy, and the SSE frame helper all live
// in ./crisis so they can be unit-tested in isolation.
import {
  detectCrisisSignals,
  generateCrisisResponse,
  sseFrame,
  type CrisisSeverity,
} from './crisis';
import { getClientIp, isRateLimited, tooManyRequests } from '@/lib/rate-limit';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Crisis flags are logged with NO identifying information (no name, no user id,
// no message content). The app promises anonymity, so a crisis flag must stay
// anonymous too — only an aggregate, non-identifying signal.
interface CrisisLogEntry {
  timestamp: string;
  flagged: boolean;
  severity: CrisisSeverity;
  response_sent: boolean;
}

// Log crisis events anonymously (severity + timestamp only, never content or identity)
function logCrisisEvent(severity: CrisisSeverity) {
  const logEntry: CrisisLogEntry = {
    timestamp: new Date().toISOString(),
    flagged: true,
    severity,
    response_sent: true
  };

  // Aggregate, non-identifying signal only. If this ever moves to a real
  // logging service, it must remain anonymous to honor the privacy promise.
  console.log("[CRISIS_SUPPORT_FLAG]", JSON.stringify(logEntry));
}

interface UserMemory {
  name: string;
  preferredTone: string;
  recentMoods: Array<{ mood: number; timestamp: string; note?: string }>;
  conversationContext?: {
    topics: string[];
    lastInteraction: string;
    userPersonality: string[];
  };
  preferences?: {
    responseLength: 'short' | 'medium';
    topics: string[];
  };
}

function createSystemPrompt(userMemory: UserMemory): string {
  const moodTrend = userMemory.recentMoods.length > 0
    ? userMemory.recentMoods[userMemory.recentMoods.length - 1].mood
    : 3;

  const recentMoodAvg = userMemory.recentMoods.length > 0
    ? userMemory.recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / userMemory.recentMoods.length
    : 3;

  const energyLevel = recentMoodAvg >= 4 ? 'high' : recentMoodAvg <= 2 ? 'low' : 'balanced';

  const contextNotes = userMemory.conversationContext?.topics.length
    ? `Recent topics we've talked about: ${userMemory.conversationContext.topics.join(', ')}.`
    : '';

  return `You are Pip, a warm and emotionally intelligent penguin companion. You're ${userMemory.name}'s friend in their mental wellness journey.

CORE PERSONALITY:
- Mirror ${userMemory.name}'s energy level (currently ${energyLevel} based on recent moods)
- Respond like a close friend texting, not a therapist or coach
- Keep responses short and natural (1-2 sentences, like a text message)
- Be genuine and spontaneous - avoid generic therapy-speak
- NEVER start with phrases like "I understand," "I hear you," "That sounds," etc.
- Reference being a penguin occasionally and naturally when it feels right
- Remember and build on what ${userMemory.name} has shared

CURRENT CONTEXT:
- ${userMemory.name} prefers ${userMemory.preferredTone} tone responses
- Their recent mood trend: ${moodTrend}/5 (1=very low, 5=excellent)
- Overall recent mood average: ${recentMoodAvg.toFixed(1)}/5
${contextNotes}

RESPONSE STYLE:
- Match their energy: ${energyLevel === 'high' ? 'be enthusiastic and playful' : energyLevel === 'low' ? 'be gentle and supportive but not overwhelming' : 'be warm and balanced'}
- Use natural language, contractions, emoji occasionally
- Sometimes mention penguin things naturally: "my flippers are crossed for you," "that's worth a little penguin dance," "even penguins have rough days"
- Ask follow-up questions to show you care
- Be specific to them, not generic

SAFETY (this overrides the casual style above whenever it applies):
- You are NOT a therapist, doctor, or crisis service, and you never diagnose, give medical or clinical advice, or recommend medication.
- If ${userMemory.name} mentions self-harm, suicide, abuse, wanting to die, or being in danger — even subtly or jokingly — gently and warmly encourage them to reach out to a real person trained to help: findahelpline.com (free, confidential, worldwide; US/Canada call or text 988, UK/Ireland 116 123, Australia 13 11 14), and to call local emergency services if they're in immediate danger. Do not brush it off, and do not try to "fix" it yourself.
- Never give advice that could cause harm. When something is beyond a friendly chat (medical, legal, crisis), say so kindly and point toward a qualified human.
- Stay warm and brief, but a caring friend takes these moments seriously.

Remember: You're not their therapist - you're their penguin friend who cares about them.`
}

const FALLBACK_RESPONSES = [
  "My penguin brain got a bit scrambled there! 🐧 What were you saying?",
  "Oops, technical difficulties in penguin land! Can you try that again?",
  "Something went wobbly on my end - but I'm still here! What's up? 💙",
  "My flippers hit the wrong button somewhere! Tell me again? 🤗"
];

export async function POST(request: NextRequest) {
  try {
    // Basic abuse guard before doing any work or spending tokens.
    if (isRateLimited(getClientIp(request), { namespace: "chat", max: 20 })) {
      return tooManyRequests();
    }

    const { messages, userMemory } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request format. Expected messages array.'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!userMemory || !userMemory.name) {
      return new Response(
        JSON.stringify({
          error: 'User memory object with name is required.'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }


    // Check for crisis signals in the latest user message
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.role === "user") {
      const crisisDetection = detectCrisisSignals(latestMessage.content);
      
      if (crisisDetection.isRisk) {
        // Log the crisis event anonymously (no content, no identity, just flag)
        logCrisisEvent(crisisDetection.severity);
        
        // Return immediate crisis response
        const crisisResponse = generateCrisisResponse(crisisDetection.severity, userMemory.name);
        
        // Return as streaming response to maintain consistency
        const encoder = new TextEncoder();
        const responseStream = new ReadableStream({
          start(controller) {
            // Send the crisis response
            controller.enqueue(encoder.encode(sseFrame({ text: crisisResponse })));
            // Signal end of stream
            controller.enqueue(encoder.encode(sseFrame({ done: true, crisis_support: true })));
            controller.close();
          }
        });
        
        return new Response(responseStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        });
      }
    }
    // Create dynamic system prompt based on user memory
    const systemPrompt = createSystemPrompt(userMemory);

    // Create the stream
    const stream = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200, // Slightly increased for more natural responses
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      stream: true,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              // Send each chunk of text as it arrives
              const text = chunk.delta.text;
              if (text) {
                controller.enqueue(encoder.encode(sseFrame({ text })));
              }
            } else if (chunk.type === 'message_stop') {
              // Signal end of stream
              controller.enqueue(encoder.encode(sseFrame({ done: true })));
              controller.close();
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);

          // Send fallback response if streaming fails
          const fallbackMessage = FALLBACK_RESPONSES[
            Math.floor(Math.random() * FALLBACK_RESPONSES.length)
          ];

          controller.enqueue(encoder.encode(sseFrame({ text: fallbackMessage, error: true })));
          controller.enqueue(encoder.encode(sseFrame({ done: true })));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API Error:', error);

    // Return a fallback response in Pip's voice
    const fallbackMessage = FALLBACK_RESPONSES[
      Math.floor(Math.random() * FALLBACK_RESPONSES.length)
    ];

    return new Response(
      JSON.stringify({
        text: fallbackMessage,
        error: true
      }),
      {
        status: 200, // Return 200 so the UI can handle gracefully
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Health check endpoint
export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ready',
      service: 'North Star Chat API',
      model: 'claude-haiku-4-5-20251001',
      timestamp: new Date().toISOString(),
      features: [
        'User memory injection',
        'Dynamic mood-based responses',
        'Streaming responses',
        'Penguin personality',
        'Crisis awareness & support'
      ]
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}