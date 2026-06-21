// Crisis detection + support, extracted as pure functions so they can be
// unit-tested in isolation (route handlers are awkward to test directly).
//
// IMPORTANT: All Server-Sent Events frames in the chat route go through
// `sseFrame()`. SSE requires each event to end with a blank line (`\n\n`).
// A previous bug wrote a literal `nn` instead of `\n\n`, which silently broke
// the crisis response (it failed to parse client-side and rendered nothing).
// Centralizing the framing here means that bug class cannot recur.

export type CrisisSeverity = "low" | "medium" | "high";

export interface CrisisDetection {
  isRisk: boolean;
  severity: CrisisSeverity;
}

// High severity - direct self-harm or suicide mentions
const highRiskPatterns = [
  /suicide/i, /kill myself/i, /end my life/i, /want to die/i,
  /take my own life/i, /end it all/i, /self harm/i, /self-harm/i, /cutting/i,
  /kill me/i, /don'?t want to (be here|live|exist) anymore/i,
];

// Medium severity - hopelessness and severe distress
const mediumRiskPatterns = [
  /can'?t go on/i, /no point/i, /better off dead/i, /hurt myself/i,
  /hopeless/i, /worthless/i, /burden to everyone/i, /hate myself/i,
];

// Low severity - concerning but less immediate
const lowRiskPatterns = [
  /tired of existing/i, /wish i (was|were) dead/i, /disappear forever/i,
  /nothing matters/i, /give up on everything/i,
];

// Keyword-based crisis detection. This is a deliberately conservative first
// line of defense — the chat system prompt carries a safety backstop for the
// cases this misses. Patterns are matched against the raw message (the regexes
// are already case-insensitive).
export function detectCrisisSignals(message: string): CrisisDetection {
  for (const pattern of highRiskPatterns) {
    if (pattern.test(message)) return { isRisk: true, severity: "high" };
  }
  for (const pattern of mediumRiskPatterns) {
    if (pattern.test(message)) return { isRisk: true, severity: "medium" };
  }
  for (const pattern of lowRiskPatterns) {
    if (pattern.test(message)) return { isRisk: true, severity: "low" };
  }
  return { isRisk: false, severity: "low" };
}

// International, locale-agnostic crisis resources. North Star deploys globally,
// so we never hardcode one country's hotline. findahelpline.com routes anyone to
// a free, confidential line in their own country; we also name a few well-known
// 24/7 lines and always point to local emergency services for immediate danger.
export const CRISIS_RESOURCES =
  "you can reach a free, confidential helpline anywhere in the world at findahelpline.com " +
  "(US/Canada: call or text 988 · UK/Ireland: 116 123 · Australia: 13 11 14). " +
  "If you're in immediate danger, please call your local emergency number.";

// Generate Pip's warm crisis response.
export function generateCrisisResponse(severity: CrisisSeverity, userName: string): string {
  const responses: Record<CrisisSeverity, string[]> = {
    high: [
      `Hey ${userName}, what you're sharing sounds really heavy and I want to make sure you're okay. I'm just a penguin, but real humans trained for exactly this are standing by — ${CRISIS_RESOURCES} You don't have to face this alone. Want to keep talking? 🐧💙`,
      `${userName}, I can hear how much pain you're in right now. You matter so much, and there are people trained to help through this — ${CRISIS_RESOURCES} I'm here too. 💙`,
      `Oh ${userName}, my penguin heart is really concerned about you right now. What you're feeling sounds incredibly difficult, and you're worth fighting for. Please reach out — ${CRISIS_RESOURCES} 🐧💙`,
    ],
    medium: [
      `${userName}, I can tell you're going through something really tough right now. Sometimes talking to someone trained to help can make a difference — ${CRISIS_RESOURCES} I'm here too if you want to keep chatting. You matter. 🐧💙`,
      `That sounds incredibly hard, ${userName}. I'm worried about you. If these feelings get overwhelming — ${CRISIS_RESOURCES} Want to tell me more about what's going on? 💙`,
      `${userName}, what you're sharing tells me you're really struggling. I care about you, and there are people who specialize in helping with these heavy feelings — ${CRISIS_RESOURCES} I'm here too. 🐧💙`,
    ],
    low: [
      `${userName}, it sounds like things feel pretty overwhelming right now. That's really tough. If you ever need to talk to someone beyond your penguin friend — ${CRISIS_RESOURCES} Want to share what's been weighing on you? 💙`,
      `I hear you, ${userName}. Some days are just brutally hard. If you need someone with more training than a penguin — ${CRISIS_RESOURCES} What's been making things feel so heavy? 🐧💙`,
      `That sounds really difficult, ${userName}. When things feel this tough, it can help to talk to people trained for these moments — ${CRISIS_RESOURCES} I'm here too, for whatever that's worth. 💙`,
    ],
  };

  const responseArray = responses[severity];
  return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// Build a single Server-Sent Events frame. ALWAYS use this to write SSE data
// so the required `\n\n` terminator is never dropped or mistyped.
export function sseFrame(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}
