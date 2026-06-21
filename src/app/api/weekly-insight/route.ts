import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getClientIp, isRateLimited, tooManyRequests } from '@/lib/rate-limit';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface MoodEntry {
  mood: number;
  timestamp: string;
  note?: string;
}

interface WeeklyInsightRequest {
  entries: MoodEntry[];
  userName: string;
  userPersonality: string;
}

export async function POST(request: NextRequest) {
  try {
    // Basic abuse guard before spending tokens.
    if (isRateLimited(getClientIp(request), { namespace: "weekly-insight", max: 10 })) {
      return tooManyRequests();
    }

    const { entries, userName, userPersonality }: WeeklyInsightRequest = await request.json();

    if (!entries || entries.length === 0) {
      return Response.json({
        success: false,
        error: 'No mood entries provided'
      }, { status: 400 });
    }

    // Filter to last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const weekEntries = entries.filter(entry => 
      new Date(entry.timestamp) >= sevenDaysAgo
    );

    if (weekEntries.length === 0) {
      return Response.json({
        insight: `🐧 Hey ${userName}! I haven't seen any mood entries from you this week. That's totally okay - sometimes life gets busy! When you're ready, I'm here to listen and learn about your emotional journey. Every small step counts! 💙`,
        generated: false,
        fallback: true
      });
    }

    // Analyze the week's data
    const analysisData = analyzeWeeklyMoods(weekEntries);
    
    // Create context for Pip's personality
    const systemPrompt = `You are Pip, the friendly and empathetic penguin companion from North Star. You're analyzing ${userName}'s mood entries from the past week to provide warm, encouraging insights.

Your personality: ${userPersonality} but always warm, supportive, and never clinical. You're naturally curious about patterns and want to help ${userName} understand their emotional journey.

Key guidelines:
- Use "you" to speak directly to ${userName}
- Include penguin references naturally (waddling, ice, swimming, etc.)
- Be warm and encouraging, not analytical or clinical
- Notice patterns but frame them positively
- Keep insights conversational and friendly
- Always end with encouragement or a gentle suggestion
- Use emojis sparingly but meaningfully (especially 🐧💙)
- Maximum 2-3 sentences

Example tone: "you seemed happiest on Wednesday and Thursday this week — both days you chatted with me in the evening. coincidence? waddling to conclusions here but maybe evenings work for you."`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate a weekly insight for ${userName} based on this mood data:

${createMoodSummary(analysisData)}

Focus on:
- Patterns in mood/timing/days
- Positive observations
- Gentle encouragements
- Pip's warm personality

Keep it conversational and under 3 sentences.`
        }
      ],
    });

    const firstBlock = response.content[0];
    const insight = (firstBlock.type === 'text' ? firstBlock.text?.trim() : '') || getFallbackInsight(userName, analysisData);

    return Response.json({
      insight,
      generated: true,
      data: analysisData,
      weeklyEntryCount: weekEntries.length
    });

  } catch (error) {
    console.error('Weekly insight generation error:', error);
    
    return Response.json({
      insight: "🐧 I'm having a little penguin brain freeze trying to analyze your week, but I can see you've been taking care of your emotional wellbeing! Keep swimming forward, and maybe I'll have better insights next time! 💙",
      generated: false,
      error: true
    });
  }
}

function analyzeWeeklyMoods(entries: MoodEntry[]) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const moodLabels = ['very low', 'low', 'okay', 'good', 'excellent'];
  
  // Group by day of week
  const byDay = entries.reduce((acc, entry) => {
    const day = new Date(entry.timestamp).getDay();
    const dayName = dayNames[day];
    if (!acc[dayName]) acc[dayName] = [];
    acc[dayName].push(entry);
    return acc;
  }, {} as Record<string, MoodEntry[]>);

  // Group by time of day
  const byTimeOfDay = entries.reduce((acc, entry) => {
    const hour = new Date(entry.timestamp).getHours();
    const timeSlot = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    if (!acc[timeSlot]) acc[timeSlot] = [];
    acc[timeSlot].push(entry);
    return acc;
  }, {} as Record<string, MoodEntry[]>);

  // Find patterns
  const bestDay = Object.entries(byDay)
    .map(([day, dayEntries]) => ({
      day,
      avgMood: dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length,
      count: dayEntries.length
    }))
    .sort((a, b) => b.avgMood - a.avgMood)[0];

  const bestTime = Object.entries(byTimeOfDay)
    .map(([time, timeEntries]) => ({
      time,
      avgMood: timeEntries.reduce((sum, e) => sum + e.mood, 0) / timeEntries.length,
      count: timeEntries.length
    }))
    .sort((a, b) => b.avgMood - a.avgMood)[0];

  const overallAvg = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
  const highestMood = Math.max(...entries.map(e => e.mood));
  const lowestMood = Math.min(...entries.map(e => e.mood));

  return {
    totalEntries: entries.length,
    overallAverage: overallAvg,
    highestMood,
    lowestMood,
    bestDay: bestDay?.day,
    bestDayAvg: bestDay?.avgMood,
    bestTime: bestTime?.time,
    bestTimeAvg: bestTime?.avgMood,
    byDay,
    byTimeOfDay,
    moodRange: moodLabels[highestMood - 1] + (highestMood !== lowestMood ? ` to ${moodLabels[lowestMood - 1]}` : '')
  };
}

function createMoodSummary(data: any): string {
  return `Weekly Summary:
- ${data.totalEntries} mood entries
- Average mood: ${data.overallAverage.toFixed(1)}/5 (${data.moodRange})
- Best day: ${data.bestDay || 'varied'} (avg: ${data.bestDayAvg?.toFixed(1) || 'N/A'})
- Best time: ${data.bestTime || 'varied'} (avg: ${data.bestTimeAvg?.toFixed(1) || 'N/A'})
- Days with entries: ${Object.keys(data.byDay).length}/7`;
}

function getFallbackInsight(userName: string, data: any): string {
  const encouragements = [
    `🐧 Hey ${userName}! I noticed you logged ${data.totalEntries} mood entries this week - that's wonderful self-awareness! Keep waddling forward on your emotional journey. 💙`,
    `🐧 ${userName}, your mood averaged ${data.overallAverage.toFixed(1)}/5 this week. Every feeling is valid, and I'm proud of you for tracking them! Swimming through life one day at a time. 💙`,
    `🐧 What a week, ${userName}! I see you've been checking in with yourself ${data.totalEntries} times. That kind of self-care makes my penguin heart happy! 💙`
  ];
  
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}

export async function GET() {
  return Response.json({
    status: 'ready',
    service: 'North Star Weekly Insight API',
    description: 'Generates personalized weekly mood insights with Pip\'s personality'
  });
}
