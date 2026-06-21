import { NextRequest } from "next/server";

// Lightweight in-memory rate limiter keyed by client IP. A basic abuse guard so
// open API endpoints can't trivially drain the Anthropic key/budget.
//
// NOTE: On serverless (Vercel) memory is per-instance and resets on cold start,
// so for real production protection move this to a shared store (e.g. Upstash
// Redis / @vercel/kv). Good enough to stop a single client hammering one instance.

const buckets = new Map<string, number[]>();

export function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

// Returns true when the caller has exceeded `max` requests within `windowMs`.
// Namespacing keeps separate endpoints from sharing one budget.
export function isRateLimited(
  ip: string,
  { max = 20, windowMs = 60_000, namespace = "default" }: { max?: number; windowMs?: number; namespace?: string } = {}
): boolean {
  const key = `${namespace}:${ip}`;
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, times] of buckets) {
      if (times.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return hits.length > max;
}

// Convenience: build the standard 429 response.
export function tooManyRequests(): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please slow down and try again shortly." }),
    { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
  );
}
