import { describe, it, expect } from "vitest";
import {
  detectCrisisSignals,
  generateCrisisResponse,
  sseFrame,
  CRISIS_RESOURCES,
} from "./crisis";

describe("detectCrisisSignals", () => {
  it("flags explicit suicidal statements as high severity", () => {
    for (const msg of [
      "I want to die",
      "I'm going to kill myself",
      "thinking about suicide",
      "I don't want to be here anymore",
    ]) {
      const res = detectCrisisSignals(msg);
      expect(res.isRisk, msg).toBe(true);
      expect(res.severity, msg).toBe("high");
    }
  });

  it("is case-insensitive", () => {
    expect(detectCrisisSignals("I WANT TO DIE").severity).toBe("high");
  });

  it("flags hopelessness as medium severity", () => {
    const res = detectCrisisSignals("I feel completely hopeless and worthless");
    expect(res.isRisk).toBe(true);
    expect(res.severity).toBe("medium");
  });

  it("flags softer distress as low severity", () => {
    const res = detectCrisisSignals("honestly nothing matters anymore");
    expect(res.isRisk).toBe(true);
    expect(res.severity).toBe("low");
  });

  it("does not flag ordinary messages", () => {
    for (const msg of ["I had a great day!", "feeling a bit tired", "what's the weather"]) {
      expect(detectCrisisSignals(msg).isRisk, msg).toBe(false);
    }
  });
});

describe("generateCrisisResponse", () => {
  it("includes international resources for every severity", () => {
    for (const severity of ["low", "medium", "high"] as const) {
      const out = generateCrisisResponse(severity, "Sam");
      expect(out).toContain("findahelpline.com");
      expect(out).toContain(CRISIS_RESOURCES);
      expect(out).toContain("Sam");
    }
  });
});

describe("sseFrame", () => {
  it("terminates frames with a blank line (\\n\\n), never a literal 'nn'", () => {
    const frame = sseFrame({ text: "hi" });
    expect(frame).toBe('data: {"text":"hi"}\n\n');
    expect(frame.endsWith("\n\n")).toBe(true);
    expect(frame.endsWith("nn")).toBe(false); // regression guard for the original bug
  });

  it("produces a frame a client can parse after splitting on newlines", () => {
    const frame = sseFrame({ text: "hello", done: true });
    const line = frame.split("\n").find((l) => l.startsWith("data: "))!;
    const parsed = JSON.parse(line.slice(6));
    expect(parsed).toEqual({ text: "hello", done: true });
  });
});
